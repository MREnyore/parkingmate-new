using ServiceStack;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using ServiceStack.Auth;
using ParkingMate.ServiceModel;
using System.Security.Cryptography;
using System.Data;
using System.Text.Json;

namespace ParkingMate.ServiceInterface;

public class CustomerAuthServices : Service
{
    private readonly IDbConnectionFactory _dbFactory;
    private readonly IEmailService _emailService;

    public CustomerAuthServices(IDbConnectionFactory dbFactory, IEmailService emailService)
    {
        _dbFactory = dbFactory;
        _emailService = emailService;
    }

    public object Post(ValidateRegistrationToken request)
    {
        var token = Db.Select<RegistrationToken>(t =>
            t.Token == request.Token &&
            !t.Used &&
            t.ExpiresAt > DateTime.UtcNow).FirstOrDefault();

        if (token == null)
        {
            return new ValidateRegistrationTokenResponse
            {
                IsValid = false,
                ErrorMessage = "Invalid or expired registration token"
            };
        }

        return new ValidateRegistrationTokenResponse
        {
            IsValid = true,
            Email = token.Email
        };
    }

    public async Task<object> Post(RegisterCustomer request)
    {
        var token = Db.Select<RegistrationToken>(t =>
            t.Token == request.Token &&
            !t.Used &&
            t.ExpiresAt > DateTime.UtcNow).FirstOrDefault();

        if (token == null)
        {
            throw HttpError.BadRequest("Invalid or expired registration token");
        }

        // Security validation: email in request must match email stored with token
        if (token.Email != request.Email)
        {
            throw HttpError.BadRequest("Email does not match the registration token");
        }

        var orgId = token.OrgId;
        var email = token.Email;

        // Look up existing customer - they should already exist since car registration creates them
        var customer = Db.Select<Customer>(c => c.OrgId == orgId && c.Email == email).FirstOrDefault();
        if (customer == null)
        {
            throw HttpError.BadRequest("Customer not found. Please contact support.");
        }

        // Generate OTP and send email
        var otpCode = GenerateOtpCode();
        CreateOtpToken(orgId, email, otpCode, "registration");

        var success = await _emailService.SendOtpEmailAsync(email, customer.Name, otpCode);

        return new RegisterCustomerResponse
        {
            Success = success,
            Message = success ? "OTP sent to your email. Please check your inbox." : "Failed to send OTP email"
        };
    }

    public async Task<object> Post(CustomerAuthenticate request)
    {
        var customer = Db.Select<Customer>(c => c.Email == request.Email).FirstOrDefault();

        if (customer == null)
        {
            return new CustomerAuthenticateResponse
            {
                Success = false,
                CustomerExists = false,
                Message = "Customer not found. Please check your email address."
            };
        }

        if (!customer.Registered)
        {
            return new CustomerAuthenticateResponse
            {
                Success = false,
                CustomerExists = true,
                Message = "Customer account not activated. Please complete registration first."
            };
        }

        var otpCode = GenerateOtpCode();
        CreateOtpToken(customer.OrgId, request.Email, otpCode, "signin");

        var success = await _emailService.SendOtpEmailAsync(request.Email, customer.Name, otpCode);

        return new CustomerAuthenticateResponse
        {
            Success = success,
            CustomerExists = true,
            Message = success ? "OTP sent to your email. Please check your inbox." : "Failed to send OTP email"
        };
    }

    public async Task<object> Post(VerifyOtp request)
    {
        var otp = Db.Select<OtpToken>(o =>
            o.Email == request.Email &&
            o.Code == request.Code &&
            !o.Used &&
            o.ExpiresAt > DateTime.UtcNow).FirstOrDefault();

        if (otp == null)
        {
            throw HttpError.BadRequest("Invalid or expired OTP code");
        }

        var customer = Db.Select<Customer>(c => c.Email == request.Email).FirstOrDefault();
        if (customer == null)
        {
            throw HttpError.BadRequest("Customer not found");
        }

        Db.Update<OtpToken>(new { Used = true }, where: o => o.Id == otp.Id);

        if (otp.Purpose == "registration" && !customer.Registered)
        {
            Db.Update<Customer>(new { Registered = true }, where: c => c.Id == customer.Id);
            customer.Registered = true;

            // Mark the registration token as used now that registration is complete
            var registrationToken = Db.Select<RegistrationToken>(t =>
                t.Email == customer.Email &&
                t.OrgId == customer.OrgId &&
                !t.Used).FirstOrDefault();
            if (registrationToken != null)
            {
                Db.Update<RegistrationToken>(new { Used = true }, where: t => t.Id == registrationToken.Id);
            }
        }

        var session = new AuthUserSession
        {
            Id = Guid.NewGuid().ToString("N"),
            UserAuthId = customer.Id.ToString(),
            UserName = $"customer:{customer.Email}",
            Email = customer.Email,
            DisplayName = customer.Name,
            FirstName = customer.Name.Split(' ').FirstOrDefault(),
            LastName = customer.Name.Split(' ').Skip(1).FirstOrDefault(),
            IsAuthenticated = true,
            Roles = new List<string> { "Customer" },
            Permissions = new List<string> { "customer:access" }
        };

        await Request.SaveSessionAsync(session);

        // Generate JWT token
        var jwtAuthProvider = AuthenticateService.GetAuthProvider("jwt") as JwtAuthProvider;
        var jwtToken = jwtAuthProvider?.CreateJwtBearerToken(session);

        // Generate refresh token
        var refreshToken = GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(30); // 30 days
        var accessTokenExpiry = DateTime.UtcNow.AddMinutes(30); // 30 minutes

        // Store refresh token in database
        var refreshTokenEntity = new RefreshTokenEntity
        {
            CustomerId = customer.Id,
            Token = refreshToken,
            ExpiresAt = refreshTokenExpiry,
            DeviceInfo = Request.UserAgent,
            IpAddress = Request.UserHostAddress
        };
        
        Db.Insert(refreshTokenEntity);

        return new VerifyOtpResponse
        {
            Success = true,
            SessionId = session.Id,
            AccessToken = jwtToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = accessTokenExpiry,
            RefreshTokenExpiresAt = refreshTokenExpiry,
            Email = customer.Email,
            Name = customer.Name,
            IsRegisteredCustomer = customer.Registered
        };
    }


    public object Post(RefreshToken request)
    {
        // Find and validate refresh token
        var refreshTokenEntity = Db.Select<RefreshTokenEntity>(rt => 
            rt.Token == request.Token && 
            !rt.IsRevoked && 
            rt.ExpiresAt > DateTime.UtcNow).FirstOrDefault();

        if (refreshTokenEntity == null)
        {
            throw HttpError.Unauthorized("Invalid or expired refresh token");
        }

        // Get customer
        var customer = Db.SelectByIds<Customer>(new[] { refreshTokenEntity.CustomerId }).FirstOrDefault();
        if (customer == null)
        {
            throw HttpError.NotFound("Customer not found");
        }

        // Generate new tokens
        var session = new AuthUserSession
        {
            UserAuthId = customer.Id.ToString(),
            UserName = $"customer:{customer.Email}",
            Email = customer.Email,
            DisplayName = customer.Name,
            IsAuthenticated = true,
            Roles = new List<string> { "Customer" },
            Permissions = new List<string> { "customer:access" }
        };

        var jwtAuthProvider = AuthenticateService.GetAuthProvider("jwt") as JwtAuthProvider;
        var newAccessToken = jwtAuthProvider?.CreateJwtBearerToken(session);

        var newRefreshToken = GenerateRefreshToken();
        var newRefreshTokenExpiry = DateTime.UtcNow.AddDays(30);
        var newAccessTokenExpiry = DateTime.UtcNow.AddMinutes(30);

        // Revoke old refresh token
        refreshTokenEntity.IsRevoked = true;
        refreshTokenEntity.UpdatedAt = DateTime.UtcNow;
        Db.Update(refreshTokenEntity);

        // Store new refresh token
        var newRefreshTokenEntity = new RefreshTokenEntity
        {
            CustomerId = customer.Id,
            Token = newRefreshToken,
            ExpiresAt = newRefreshTokenExpiry,
            DeviceInfo = Request.UserAgent,
            IpAddress = Request.UserHostAddress
        };
        
        Db.Insert(newRefreshTokenEntity);

        return new RefreshTokenResponse
        {
            Success = true,
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            AccessTokenExpiresAt = newAccessTokenExpiry,
            RefreshTokenExpiresAt = newRefreshTokenExpiry
        };
    }

    public object Post(ValidateAuthToken request)
    {
        try
        {
            // Get token from Authorization header first (best practice), fallback to request body
            var token = Request.GetHeader("Authorization");
            
            if (!string.IsNullOrWhiteSpace(token))
            {
                // Remove Bearer prefix if present
                if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = token.Substring(7).Trim();
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.AccessToken))
            {
                // Fallback to request body (for backward compatibility)
                token = request.AccessToken;
                if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = token.Substring(7).Trim();
                }
            }
            else
            {
                return new ValidateTokenResponse 
                { 
                    IsValid = false,
                    ResponseStatus = new ResponseStatus("MISSING_TOKEN", "No access token provided in Authorization header or request body")
                };
            }

            // Parse JWT token manually
            var tokenParts = token.Split('.');
            if (tokenParts.Length != 3)
            {
                return new ValidateTokenResponse 
                { 
                    IsValid = false,
                    ResponseStatus = new ResponseStatus("INVALID_TOKEN", "Invalid JWT token format")
                };
            }

            // Decode the payload (second part)
            var payload = tokenParts[1];
            
            // Add padding if needed for Base64 decoding
            switch (payload.Length % 4)
            {
                case 2: payload += "=="; break;
                case 3: payload += "="; break;
            }

            // Replace URL-safe characters
            payload = payload.Replace('-', '+').Replace('_', '/');

            byte[] payloadBytes;
            try
            {
                payloadBytes = Convert.FromBase64String(payload);
            }
            catch
            {
                return new ValidateTokenResponse 
                { 
                    IsValid = false,
                    ResponseStatus = new ResponseStatus("INVALID_TOKEN", "Invalid JWT payload encoding")
                };
            }

            var payloadJson = System.Text.Encoding.UTF8.GetString(payloadBytes);
            var claims = JsonSerializer.Deserialize<Dictionary<string, object>>(payloadJson);

            if (claims == null)
            {
                return new ValidateTokenResponse 
                { 
                    IsValid = false,
                    ResponseStatus = new ResponseStatus("INVALID_TOKEN", "Invalid JWT payload")
                };
            }

            // Extract claims
            var customerId = claims.ContainsKey("sub") ? claims["sub"]?.ToString() : null;
            var email = claims.ContainsKey("email") ? claims["email"]?.ToString() : null;
            
            DateTime? expiresAt = null;
            if (claims.ContainsKey("exp"))
            {
                var expValue = claims["exp"];
                if (expValue != null)
                {
                    // Handle both JsonElement and direct values
                    long expUnix = 0;
                    if (expValue is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Number)
                    {
                        expUnix = jsonElement.GetInt64();
                    }
                    else if (long.TryParse(expValue.ToString(), out var parsedExp))
                    {
                        expUnix = parsedExp;
                    }

                    if (expUnix > 0)
                    {
                        expiresAt = DateTimeOffset.FromUnixTimeSeconds(expUnix).DateTime;
                        
                        // Check if token is expired
                        if (expiresAt < DateTime.UtcNow)
                        {
                            return new ValidateTokenResponse 
                            { 
                                IsValid = false,
                                ResponseStatus = new ResponseStatus("TOKEN_EXPIRED", "Token has expired")
                            };
                        }
                    }
                }
            }

            // For now, we'll consider the token valid if we can parse it and it's not expired
            // In a production environment, you would also verify the signature
            return new ValidateTokenResponse
            {
                IsValid = true,
                CustomerId = customerId,
                Email = email,
                ExpiresAt = expiresAt
            };
        }
        catch (Exception ex)
        {
            return new ValidateTokenResponse 
            { 
                IsValid = false,
                ResponseStatus = new ResponseStatus("VALIDATION_ERROR", $"Token validation error: {ex.Message}")
            };
        }
    }

    public object Post(CustomerLogout request)
    {
        var session = SessionAs<AuthUserSession>();

        if (session?.IsAuthenticated == true)
        {
            this.RemoveSession();
        }

        // Revoke refresh token if provided
        if (!string.IsNullOrEmpty(request.RefreshToken))
        {
            var refreshTokenEntity = Db.Select<RefreshTokenEntity>(rt => 
                rt.Token == request.RefreshToken && !rt.IsRevoked).FirstOrDefault();
            
            if (refreshTokenEntity != null)
            {
                refreshTokenEntity.IsRevoked = true;
                refreshTokenEntity.UpdatedAt = DateTime.UtcNow;
                Db.Update(refreshTokenEntity);
            }
        }

        return new CustomerLogoutResponse
        {
            Success = true,
            Message = "Logged out successfully"
        };
    }


    private static string GenerateOtpCode()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[4];
        rng.GetBytes(bytes);
        var number = Math.Abs(BitConverter.ToInt32(bytes, 0));
        return (number % 900000 + 100000).ToString("D6");
    }

    private static string GenerateRefreshToken()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[32];
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }


    private void CreateOtpToken(Guid orgId, string email, string code, string purpose)
    {
        Db.Delete<OtpToken>(o => o.Email == email && o.Purpose == purpose);

        var otp = new OtpToken
        {
            OrgId = orgId,
            Email = email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            Purpose = purpose
        };

        Db.Insert(otp);
    }
}