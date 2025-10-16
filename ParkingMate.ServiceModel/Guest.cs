using ServiceStack;

namespace ParkingMate.ServiceModel;

[Route("/api/guest/validate-plate", "POST")]
[Tag("Guest")]
public class ValidateGuestPlate : IPost, IReturn<ValidateGuestPlateResponse>
{
    public required string LicensePlate { get; set; }
    public required string CaptchaToken { get; set; }
}

public class ValidateGuestPlateResponse
{
    public bool Success { get; set; }
    public bool IsFirstTime { get; set; }
    public DateTime? validUntil { get; set; } // New field to indicate validity period
    public string? ErrorType { get; set; }  // not-in-parking, already-used, customer-plate
    public string? ErrorMessage { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}
