using ServiceStack;
using System.Net;

namespace ParkingMate.ServiceModel;

[Route("/auth/validate-registration-token", "POST")]
[Tag("Customer Authentication")]
public class ValidateRegistrationToken : IPost, IReturn<ValidateRegistrationTokenResponse>
{
    [ApiMember(Description = "Registration token from email")]
    public required string Token { get; set; }
}

[Route("/auth/register-customer", "POST")]
[Tag("Customer Authentication")]
public class RegisterCustomer : IPost, IReturn<RegisterCustomerResponse>
{
    [ApiMember(Description = "Registration token from email")]
    public required string Token { get; set; }

    [ApiMember(Description = "Customer email address")]
    public required string Email { get; set; }
}

[Route("/auth/customer/signin", "POST")]
[Tag("Customer Authentication")]
[Api("Customer Authenticate")]
[ApiResponse(HttpStatusCode.OK, "OTP sent successfully")]
[ApiResponse(HttpStatusCode.BadRequest, "Invalid email format")]
public class CustomerAuthenticate : IPost, IReturn<CustomerAuthenticateResponse>
{
    [ApiMember(Description = "Customer email address", IsRequired = true, Format = "email")]
    public required string Email { get; set; }
}

[Route("/auth/verify-otp", "POST")]
[Tag("Customer Authentication")]
[Api("Verify OTP Code")]
[ApiResponse(HttpStatusCode.OK, "OTP verified, JWT token returned")]
[ApiResponse(HttpStatusCode.BadRequest, "Invalid OTP code")]
[ApiResponse(HttpStatusCode.NotFound, "Customer not found")]
public class VerifyOtp : IPost, IReturn<VerifyOtpResponse>
{
    [ApiMember(Description = "Customer email address", IsRequired = true, Format = "email")]
    public required string Email { get; set; }

    [ApiMember(Description = "6-digit OTP code", IsRequired = true, Format = "^[0-9]{6}$")]
    public required string Code { get; set; }
}

public class ValidateRegistrationTokenResponse
{
    public bool IsValid { get; set; }
    public string? Email { get; set; }
    public string? ErrorMessage { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class RegisterCustomerResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class CustomerAuthenticateResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public bool CustomerExists { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class VerifyOtpResponse
{
    public bool Success { get; set; }
    public string? SessionId { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? AccessTokenExpiresAt { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public bool IsRegisteredCustomer { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}


[Route("/auth/refresh-token", "POST")]
[Tag("Customer Authentication")]
[Api("Refresh Access Token")]
[ApiResponse(HttpStatusCode.OK, "New access token generated")]
[ApiResponse(HttpStatusCode.BadRequest, "Invalid refresh token")]
[ApiResponse(HttpStatusCode.Unauthorized, "Refresh token expired")]
public class RefreshToken : IPost, IReturn<RefreshTokenResponse>
{
    [ApiMember(Description = "Refresh token from previous authentication", IsRequired = true)]
    public required string Token { get; set; }
}

[Route("/auth/validate-auth-token", "POST")]
[Tag("Customer Authentication")]
[Api("Validate Access Token")]
[ApiResponse(HttpStatusCode.OK, "Token is valid")]
[ApiResponse(HttpStatusCode.Unauthorized, "Token is invalid or expired")]
public class ValidateAuthToken : IPost, IReturn<ValidateTokenResponse>
{
    [ApiMember(Description = "Access token to validate", IsRequired = true)]
    public required string AccessToken { get; set; }
}

[Route("/auth/customer/logout", "POST")]
[Tag("Customer Authentication")]
[Api("Customer Logout")]
[ApiResponse(HttpStatusCode.OK, "Logged out successfully")]
public class CustomerLogout : IPost, IReturn<CustomerLogoutResponse>
{
    [ApiMember(Description = "Refresh token to invalidate (optional)")]
    public string? RefreshToken { get; set; }
}


[Route("/api/customer/info", "GET")]
[Tag("Customer Data")]
[Api("Get Customer Information")]
[ApiResponse(HttpStatusCode.OK, "Customer information with cars returned")]
[ApiResponse(HttpStatusCode.Unauthorized, "JWT token required")]
[ApiResponse(HttpStatusCode.NotFound, "Customer not found")]
public class GetCustomerInfo : IGet, IReturn<GetCustomerInfoResponse>
{
}


[Route("/api/customer/info", "PUT")]
[Tag("Customer Data")]
public class UpdateCustomerInfo : IPut, IReturn<UpdateCustomerInfoResponse>
{
    [ApiMember(Description = "Customer name")]
    public string? Name { get; set; }
    
    [ApiMember(Description = "Customer phone number")]
    public string? PhoneNumber { get; set; }
    
    [ApiMember(Description = "Customer membership status")]
    public string? MembershipStatus { get; set; }
    
    [ApiMember(Description = "Customer membership expiry date")]
    public DateTime? MembershipExpiryDate { get; set; }
    
    [ApiMember(Description = "Customer address")]
    public string? Address { get; set; }
    
    [ApiMember(Description = "Customer postal code")]
    public string? PostalCode { get; set; }
    
    [ApiMember(Description = "Customer city")]
    public string? City { get; set; }
}

[Route("/api/customer/cars", "POST")]
[Tag("Customer Data")]
public class AddCustomerCar : IPost, IReturn<AddCustomerCarResponse>
{
    [ApiMember(Description = "License plate number", IsRequired = true)]
    public required string LicensePlate { get; set; }

    [ApiMember(Description = "Car label")]
    public string? Label { get; set; }

    [ApiMember(Description = "Car brand")]
    public string? Brand { get; set; }

    [ApiMember(Description = "Car model")]
    public string? Model { get; set; }
}

[Route("/api/customer/cars/{CarId}", "PUT")]
[Tag("Customer Data")]
public class UpdateCustomerCar : IPut, IReturn<UpdateCustomerCarResponse>
{
    [ApiMember(Description = "Car ID", IsRequired = true)]
    public Guid CarId { get; set; }

    [ApiMember(Description = "License plate number")]
    public string? LicensePlate { get; set; }

    [ApiMember(Description = "Car label")]
    public string? Label { get; set; }

    [ApiMember(Description = "Car brand")]
    public string? Brand { get; set; }

    [ApiMember(Description = "Car model")]
    public string? Model { get; set; }
}

[Route("/api/customer/cars/{CarId}", "DELETE")]
[Tag("Customer Data")]
public class DeleteCustomerCar : IDelete, IReturn<DeleteCustomerCarResponse>
{
    [ApiMember(Description = "Car ID", IsRequired = true)]
    public Guid CarId { get; set; }
}


public class RefreshTokenResponse
{
    public bool Success { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? AccessTokenExpiresAt { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class ValidateTokenResponse
{
    public bool IsValid { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? CustomerId { get; set; }
    public string? Email { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class CustomerLogoutResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}


public class GetCustomerInfoResponse
{
    public Guid CustomerId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsRegistered { get; set; }
    public CustomerStatus Status { get; set; }
    
    [ApiMember(Description = "Customer membership status")]
    public string? MembershipStatus { get; set; }
    
    [ApiMember(Description = "Customer membership expiry date")]
    public DateTime? MembershipExpiryDate { get; set; }
    
    [ApiMember(Description = "Customer address")]
    public string? Address { get; set; }
    
    [ApiMember(Description = "Customer postal code")]
    public string? PostalCode { get; set; }
    
    [ApiMember(Description = "Customer city")]
    public string? City { get; set; }
    
    public List<CustomerCarInfo> Cars { get; set; } = new();
    public int TotalCars { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class CustomerCarInfo
{
    public Guid CarId { get; set; }
    public string? LicensePlate { get; set; }
    public string? Label { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }
    public CarOwnerInfo? Owner { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CarOwnerInfo
{
    public Guid OwnerId { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerEmail { get; set; }
}


public class UpdateCustomerInfoResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public GetCustomerInfoResponse? CustomerInfo { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class AddCustomerCarResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public CustomerCarInfo? CarInfo { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class UpdateCustomerCarResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public CustomerCarInfo? CarInfo { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class DeleteCustomerCarResponse
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}