using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ServiceStack.Configuration;

namespace ParkingMate.ServiceInterface;

/// <summary>
/// Interface for reCAPTCHA validation service
/// </summary>
public interface IReCaptchaService
{
    /// <summary>
    /// Validates a reCAPTCHA token with Google's API
    /// </summary>
    /// <param name="token">The reCAPTCHA token from the client</param>
    /// <returns>Validation result with success status and optional error codes</returns>
    Task<ReCaptchaValidationResult> ValidateTokenAsync(string token);
}

/// <summary>
/// Service for validating reCAPTCHA tokens with Google's verification API
/// </summary>
public class ReCaptchaService : IReCaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly string _secretKey;
    private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    public ReCaptchaService(HttpClient httpClient, IAppSettings appSettings)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));

        // Get secret key from configuration
        _secretKey = appSettings.GetString("ReCaptcha:SecretKey")
            ?? throw new InvalidOperationException("ReCaptcha:SecretKey is not configured in appsettings.json");
    }

    public async Task<ReCaptchaValidationResult> ValidateTokenAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return new ReCaptchaValidationResult
            {
                Success = false,
                ErrorCodes = new[] { "missing-input-response" }
            };
        }

        try
        {
            // Prepare request data
            var requestData = new Dictionary<string, string>
            {
                { "secret", _secretKey },
                { "response", token }
            };

            // Send POST request to Google's siteverify endpoint
            var response = await _httpClient.PostAsync(
                VerifyUrl,
                new FormUrlEncodedContent(requestData)
            );

            response.EnsureSuccessStatusCode();

            // Parse response
            var responseContent = await response.Content.ReadFromJsonAsync<ReCaptchaApiResponse>();

            if (responseContent == null)
            {
                Console.WriteLine("Error: Failed to parse reCAPTCHA API response");
                return new ReCaptchaValidationResult
                {
                    Success = false,
                    ErrorCodes = new[] { "invalid-response" }
                };
            }

            // Log validation result
            if (responseContent.Success)
            {
                Console.WriteLine($"reCAPTCHA validation successful. Hostname: {responseContent.Hostname}, Challenge timestamp: {responseContent.ChallengeTs}");
            }
            else
            {
                Console.WriteLine($"reCAPTCHA validation failed. Error codes: {string.Join(", ", responseContent.ErrorCodes ?? Array.Empty<string>())}");
            }

            return new ReCaptchaValidationResult
            {
                Success = responseContent.Success,
                ChallengeTimestamp = responseContent.ChallengeTs,
                Hostname = responseContent.Hostname,
                ErrorCodes = responseContent.ErrorCodes
            };
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"HTTP error during reCAPTCHA validation: {ex.Message}");
            return new ReCaptchaValidationResult
            {
                Success = false,
                ErrorCodes = new[] { "network-error" }
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected error during reCAPTCHA validation: {ex.Message}");
            return new ReCaptchaValidationResult
            {
                Success = false,
                ErrorCodes = new[] { "unknown-error" }
            };
        }
    }
}

/// <summary>
/// Response from Google's reCAPTCHA siteverify API
/// </summary>
internal class ReCaptchaApiResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("challenge_ts")]
    public string? ChallengeTs { get; set; }

    [JsonPropertyName("hostname")]
    public string? Hostname { get; set; }

    [JsonPropertyName("error-codes")]
    public string[]? ErrorCodes { get; set; }

    [JsonPropertyName("score")]
    public double? Score { get; set; } // For reCAPTCHA v3

    [JsonPropertyName("action")]
    public string? Action { get; set; } // For reCAPTCHA v3
}

/// <summary>
/// Result of reCAPTCHA validation
/// </summary>
public class ReCaptchaValidationResult
{
    /// <summary>
    /// Whether the validation was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Timestamp of the challenge (ISO format)
    /// </summary>
    public string? ChallengeTimestamp { get; set; }

    /// <summary>
    /// Hostname of the site where the reCAPTCHA was solved
    /// </summary>
    public string? Hostname { get; set; }

    /// <summary>
    /// Error codes if validation failed
    /// Possible values:
    /// - missing-input-secret: The secret parameter is missing
    /// - invalid-input-secret: The secret parameter is invalid or malformed
    /// - missing-input-response: The response parameter is missing
    /// - invalid-input-response: The response parameter is invalid or malformed
    /// - bad-request: The request is invalid or malformed
    /// - timeout-or-duplicate: The response is no longer valid (expired or already used)
    /// </summary>
    public string[]? ErrorCodes { get; set; }

    /// <summary>
    /// Score for reCAPTCHA v3 (0.0 - 1.0, higher is more likely human)
    /// </summary>
    public double? Score { get; set; }
}
