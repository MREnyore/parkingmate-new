using ServiceStack;

namespace ParkingMate.ServiceModel;

[Route("/auth/login", "POST")]
[Tag("Authentication")]
public class Authenticate : IPost, IReturn<AuthenticateResponse>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public bool RememberMe { get; set; }
}

[Route("/auth/logout", "POST")]
[Tag("Authentication")]
public class Logout : IPost, IReturn<LogoutResponse>
{
}

[Route("/auth/register", "POST")]
[Tag("Authentication")]
public class Register : IPost, IReturn<RegisterResponse>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string ConfirmPassword { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

[Route("/auth/me", "GET")]
[Tag("Authentication")]
public class GetUserInfo : IGet, IReturn<GetUserInfoResponse>
{
}

public class AuthenticateResponse
{
    public required string SessionId { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public List<string>? Roles { get; set; }
    public List<string>? Permissions { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class LogoutResponse
{
    public required bool Success { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class RegisterResponse
{
    public required string UserId { get; set; }
    public required string SessionId { get; set; }
    public required string Email { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class GetUserInfoResponse
{
    public required string UserId { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public List<string>? Roles { get; set; }
    public List<string>? Permissions { get; set; }
    public DateTime CreatedAt { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}