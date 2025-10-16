namespace ParkingMate.ServiceModel;

public interface IEmailService
{
    Task<bool> SendOtpEmailAsync(string customerEmail, string customerName, string otpCode);
    Task<bool> SendVehicleDetectionEmailWithTokenAsync(string customerEmail, string customerName, string registrationToken);
}