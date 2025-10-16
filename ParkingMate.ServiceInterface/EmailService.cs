using SendGrid;
using SendGrid.Helpers.Mail;
using ParkingMate.ServiceModel;
using ServiceStack;
using ServiceStack.Configuration;

namespace ParkingMate.ServiceInterface;

public class EmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly string _senderEmail;
    private readonly string _senderName;
    private readonly string _templateId;
    private readonly string _otpTemplateId;

    public EmailService(ISendGridClient sendGridClient, IAppSettings appSettings)
    {
        _sendGridClient = sendGridClient;
        _senderEmail = appSettings.GetString("SendGrid:SenderEmail") ?? "vlad.crishan20@gmail.com";
        _senderName = appSettings.GetString("SendGrid:SenderName") ?? "ParkingMate";
        _templateId = appSettings.GetString("SendGrid:VehicleDetectionTemplateId") ?? "";
        _otpTemplateId = appSettings.GetString("SendGrid:OtpTemplateId") ?? "d-c9cef1f6367f4168afadaa44fde95c2b";
    }

    public async Task<bool> SendOtpEmailAsync(string customerEmail, string customerName, string otpCode)
    {
        try
        {
            Console.WriteLine($"Attempting to send OTP email to: {customerEmail} using template: {_otpTemplateId}");

            var from = new EmailAddress(_senderEmail, _senderName);
            var to = new EmailAddress(customerEmail, customerName);

            var dynamicTemplateData = new
            {
                otp_code = otpCode,
                expires_minutes = "10"
            };

            var msg = MailHelper.CreateSingleTemplateEmail(from, to, _otpTemplateId, dynamicTemplateData); 
            var response = await _sendGridClient.SendEmailAsync(msg);
            Console.WriteLine($"SendGrid OTP Response Status: {response.StatusCode}");

            return response.StatusCode == System.Net.HttpStatusCode.Accepted;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending OTP email: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SendVehicleDetectionEmailWithTokenAsync(string customerEmail, string customerName, string registrationToken)
    {
        try
        {
            Console.WriteLine($"Attempting to send vehicle detection email with token to: {customerEmail}");

            var from = new EmailAddress(_senderEmail, _senderName);
            var to = new EmailAddress(customerEmail, customerName);

            var dynamicTemplateData = new
            {
                registration_url = $"https://parkingmate-ui.vercel.app/customer-registration?token={Uri.EscapeDataString(registrationToken)}",
                expires_hours = "48"
            };

            var msg = MailHelper.CreateSingleTemplateEmail(from, to, _templateId, dynamicTemplateData);
            var response = await _sendGridClient.SendEmailAsync(msg);
            Console.WriteLine($"SendGrid Token Response Status: {response.StatusCode}");

            return response.StatusCode == System.Net.HttpStatusCode.Accepted;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending vehicle detection email with token: {ex.Message}");
            return false;
        }
    }
}