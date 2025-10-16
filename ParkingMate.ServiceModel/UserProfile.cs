using ServiceStack;

namespace ParkingMate.ServiceModel;

// Get current user profile
[Route("/api/user/profile", "GET")]
[Tag("User Profile")]
public class GetUserProfile : IGet, IReturn<GetUserProfileResponse>
{
}

public class GetUserProfileResponse
{
    public required string UserId { get; set; }
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<string>? Roles { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

// Update user profile (name)
[Route("/api/user/profile", "PUT")]
[Tag("User Profile")]
public class UpdateUserProfile : IPut, IReturn<UpdateUserProfileResponse>
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class UpdateUserProfileResponse
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

// Change password
[Route("/api/user/password", "PUT")]
[Tag("User Profile")]
public class ChangePassword : IPut, IReturn<ChangePasswordResponse>
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}

public class ChangePasswordResponse
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

// Upload profile picture
[Route("/api/user/profile-picture", "POST")]
[Tag("User Profile")]
public class UploadProfilePicture : IPost, IReturn<UploadProfilePictureResponse>
{
    // File will be handled via Request.Files in the service
}

public class UploadProfilePictureResponse
{
    public required bool Success { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public required string Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

// Delete profile picture
[Route("/api/user/profile-picture", "DELETE")]
[Tag("User Profile")]
public class DeleteProfilePicture : IDelete, IReturn<DeleteProfilePictureResponse>
{
}

public class DeleteProfilePictureResponse
{
    public required bool Success { get; set; }
    public required string Message { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}
