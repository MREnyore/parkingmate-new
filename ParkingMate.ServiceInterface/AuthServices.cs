using ServiceStack;
using ServiceStack.Auth;
using ParkingMate.ServiceModel;

namespace ParkingMate.ServiceInterface;

public class AuthServices : Service
{
    public async Task<object> Post(ParkingMate.ServiceModel.Authenticate request)
    {
        // Find user by email first and get their username
        var authRepo = TryResolve<IAuthRepository>();

        // Try to find user by email
        var users = authRepo.GetUserAuths();
        var userAuth = users.FirstOrDefault(u => u.Email == request.Email);

        if (userAuth == null)
        {
            throw HttpError.Unauthorized("Invalid email or password");
        }

        var authService = base.ResolveService<AuthenticateService>();
        await authService.PostAsync(new ServiceStack.Authenticate
        {
            provider = CredentialsAuthProvider.Name,
            UserName = userAuth.UserName, // Use the actual username
            Password = request.Password,
            RememberMe = request.RememberMe
        });

        var session = SessionAs<AuthUserSession>();

        return new ParkingMate.ServiceModel.AuthenticateResponse
        {
            SessionId = session.Id,
            Email = session.Email ?? "",
            FirstName = session.FirstName,
            LastName = session.LastName,
            Roles = session.Roles?.ToList(),
            Permissions = session.Permissions?.ToList()
        };
    }

    public object Post(Logout _)
    {
        // Remove the session from server
        this.RemoveSession();
        
        // Explicitly expire the session cookies by deleting them
        base.Response.DeleteSessionCookies();
        
        return new LogoutResponse
        {
            Success = true
        };
    }

    public async Task<object> Post(ParkingMate.ServiceModel.Register request)
    {
        if (request.Password != request.ConfirmPassword)
        {
            throw HttpError.BadRequest("Passwords do not match");
        }

        var authRepo = TryResolve<IAuthRepository>();

        var existingEmail = authRepo.GetUserAuthByUserName(request.Email);
        if (existingEmail != null)
        {
            throw HttpError.Conflict("Email already registered");
        }

        var newUser = new UserAuth
        {
            UserName = request.Email.Split('@')[0], // Use email prefix as username for ServiceStack compatibility
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var user = authRepo.CreateUserAuth(newUser, request.Password);

        // Create session manually
        var session = SessionFeature.CreateNewSession(Request, Guid.NewGuid().ToString());
        session.UserAuthId = user.Id.ToString();
        session.Email = user.Email;
        session.FirstName = user.FirstName;
        session.LastName = user.LastName;
        session.IsAuthenticated = true;

        await Request.SaveSessionAsync(session);

        return new ParkingMate.ServiceModel.RegisterResponse
        {
            UserId = user.Id.ToString(),
            SessionId = session.Id,
            Email = user.Email ?? request.Email
        };
    }

    public object Get(GetUserInfo _)
    {
        var session = SessionAs<AuthUserSession>();
        if (session.UserAuthId == null)
        {
            throw HttpError.Unauthorized("Not authenticated");
        }

        var authRepo = TryResolve<IAuthRepository>();
        var userAuth = authRepo.GetUserAuth(session.UserAuthId);

        return new GetUserInfoResponse
        {
            UserId = userAuth.Id.ToString(),
            Email = userAuth.Email ?? "",
            FirstName = userAuth.FirstName,
            LastName = userAuth.LastName,
            ProfilePictureUrl = userAuth.Meta?.GetValueOrDefault("ProfilePictureUrl"),
            Roles = session.Roles?.ToList(),
            Permissions = session.Permissions?.ToList(),
            CreatedAt = userAuth.CreatedDate
        };
    }
}