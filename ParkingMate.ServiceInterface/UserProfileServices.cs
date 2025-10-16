using ServiceStack;
using ServiceStack.Auth;
using ParkingMate.ServiceModel;

namespace ParkingMate.ServiceInterface;

[Authenticate]
public class UserProfileServices : Service
{
    // GET /api/user/profile
    public object Get(GetUserProfile request)
    {
        var session = SessionAs<AuthUserSession>();
        if (session.UserAuthId == null)
        {
            throw HttpError.Unauthorized("Not authenticated");
        }

        var authRepo = TryResolve<IAuthRepository>();
        var userAuth = authRepo.GetUserAuth(session.UserAuthId);

        if (userAuth == null)
        {
            throw HttpError.NotFound("User not found");
        }

        return new GetUserProfileResponse
        {
            UserId = userAuth.Id.ToString(),
            Email = userAuth.Email ?? "",
            FirstName = userAuth.FirstName,
            LastName = userAuth.LastName,
            ProfilePictureUrl = userAuth.Meta?.GetValueOrDefault("ProfilePictureUrl"),
            CreatedAt = userAuth.CreatedDate,
            Roles = session.Roles?.ToList()
        };
    }

    // PUT /api/user/profile
    public object Put(UpdateUserProfile request)
    {
        var session = SessionAs<AuthUserSession>();
        if (session.UserAuthId == null)
        {
            throw HttpError.Unauthorized("Not authenticated");
        }

        var authRepo = TryResolve<IAuthRepository>();
        var userAuth = authRepo.GetUserAuth(session.UserAuthId);

        if (userAuth == null)
        {
            throw HttpError.NotFound("User not found");
        }

        // Update user info
        userAuth.FirstName = request.FirstName;
        userAuth.LastName = request.LastName;
        userAuth.ModifiedDate = DateTime.UtcNow;

        authRepo.SaveUserAuth(userAuth);

        return new UpdateUserProfileResponse
        {
            Success = true,
            Message = "Profile updated successfully"
        };
    }

    // PUT /api/user/password
    public object Put(ChangePassword request)
    {
        var session = SessionAs<AuthUserSession>();
        if (session.UserAuthId == null)
        {
            throw HttpError.Unauthorized("Not authenticated");
        }

        var authRepo = TryResolve<IAuthRepository>();
        var userAuth = authRepo.GetUserAuth(session.UserAuthId);

        if (userAuth == null)
        {
            throw HttpError.NotFound("User not found");
        }

        // Verify current password
        bool isValid = authRepo.TryAuthenticate(
            userAuth.UserName,
            request.CurrentPassword,
            out _
        );

        if (!isValid)
        {
            throw HttpError.BadRequest("Current password is incorrect");
        }

        // Update password - ServiceStack handles PBKDF2 hashing automatically
        authRepo.UpdateUserAuth(userAuth, userAuth, request.NewPassword);

        return new ChangePasswordResponse
        {
            Success = true,
            Message = "Password changed successfully"
        };
    }

    // POST /api/user/profile-picture
    public object Post(UploadProfilePicture request)
    {
        var session = SessionAs<AuthUserSession>();
        if (session.UserAuthId == null)
        {
            throw HttpError.Unauthorized("Not authenticated");
        }

        // Get uploaded file
        var file = Request.Files.FirstOrDefault();
        if (file == null)
        {
            throw HttpError.BadRequest("No file uploaded");
        }

        // Validate file size (15MB max)
        const long maxFileSize = 15 * 1024 * 1024; // 15MB in bytes
        if (file.ContentLength > maxFileSize)
        {
            throw HttpError.BadRequest("File size exceeds 15MB limit");
        }

        // Validate file type
        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw HttpError.BadRequest("Only PNG and JPEG files are allowed");
        }

        // Get auth repository
        var authRepo = TryResolve<IAuthRepository>();
        var userAuth = authRepo.GetUserAuth(session.UserAuthId);

        if (userAuth == null)
        {
            throw HttpError.NotFound("User not found");
        }

        // Create uploads directory if it doesn't exist
        var uploadsPath = Path.Combine(VirtualFileSources.RootDirectory.RealPath, "uploads", "avatars");
        Directory.CreateDirectory(uploadsPath);

        // Delete old profile picture if exists
        if (userAuth.Meta?.ContainsKey("ProfilePictureUrl") == true)
        {
            var oldRelativeUrl = userAuth.Meta["ProfilePictureUrl"];
            DeleteOldProfilePicture(oldRelativeUrl);
        }

        // Generate unique filename
        var fileName = $"{session.UserAuthId}_{DateTime.UtcNow.Ticks}{extension}";
        var filePath = Path.Combine(uploadsPath, fileName);

        // Save file to disk
        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            file.InputStream.CopyTo(fileStream);
        }

        // Update UserAuth Meta with profile picture URL
        var profilePictureUrl = $"/uploads/avatars/{fileName}";
        userAuth.Meta ??= new Dictionary<string, string>();
        userAuth.Meta["ProfilePictureUrl"] = profilePictureUrl;
        userAuth.ModifiedDate = DateTime.UtcNow;

        authRepo.SaveUserAuth(userAuth);

        return new UploadProfilePictureResponse
        {
            Success = true,
            ProfilePictureUrl = profilePictureUrl,
            Message = "Profile picture uploaded successfully"
        };
    }

    // DELETE /api/user/profile-picture
    public object Delete(DeleteProfilePicture request)
    {
        var session = SessionAs<AuthUserSession>();
        if (session.UserAuthId == null)
        {
            throw HttpError.Unauthorized("Not authenticated");
        }

        var authRepo = TryResolve<IAuthRepository>();
        var userAuth = authRepo.GetUserAuth(session.UserAuthId);

        if (userAuth == null)
        {
            throw HttpError.NotFound("User not found");
        }

        // Delete profile picture file if exists
        if (userAuth.Meta?.ContainsKey("ProfilePictureUrl") == true)
        {
            var oldRelativeUrl = userAuth.Meta["ProfilePictureUrl"];
            DeleteOldProfilePicture(oldRelativeUrl);

            // Remove from Meta
            userAuth.Meta.Remove("ProfilePictureUrl");
            userAuth.ModifiedDate = DateTime.UtcNow;
            authRepo.SaveUserAuth(userAuth);
        }

        return new DeleteProfilePictureResponse
        {
            Success = true,
            Message = "Profile picture deleted successfully"
        };
    }

    // Helper method to delete old profile picture file
    private void DeleteOldProfilePicture(string relativeUrl)
    {
        try
        {
            var uploadsPath = Path.Combine(VirtualFileSources.RootDirectory.RealPath, "uploads", "avatars");
            var fileName = Path.GetFileName(relativeUrl);

            // Sanitize filename to prevent directory traversal
            if (string.IsNullOrEmpty(fileName) || fileName.Contains(".."))
            {
                return;
            }

            var fullPath = Path.Combine(uploadsPath, fileName);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch (Exception ex)
        {
            // Log error but don't throw - deletion failure shouldn't block the operation
            Console.WriteLine($"Warning: Failed to delete old profile picture: {ex.Message}");
        }
    }
}
