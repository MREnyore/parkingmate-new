using ServiceStack;
using ServiceStack.OrmLite;
using ParkingMate.ServiceModel;

namespace ParkingMate.ServiceInterface;

public class GuestServices : Service
{
    private readonly IReCaptchaService? _reCaptchaService;

    public GuestServices(IReCaptchaService? reCaptchaService = null)
    {
        _reCaptchaService = reCaptchaService;
    }

    public async Task<object> Post(ValidateGuestPlate request)
    {
        try
        {
            // Normalize license plate
            var normalizedPlate = request.LicensePlate.ToUpperInvariant();

            // Validate reCAPTCHA token
            if (_reCaptchaService != null)
            {
                var captchaResult = await _reCaptchaService.ValidateTokenAsync(request.CaptchaToken);

                if (!captchaResult.Success)
                {
                    Console.WriteLine($"reCAPTCHA validation failed for plate {normalizedPlate}. Error codes: {string.Join(", ", captchaResult.ErrorCodes ?? Array.Empty<string>())}");

                    return new ValidateGuestPlateResponse
                    {
                        Success = false,
                        IsFirstTime = false,
                        ErrorType = "captcha-failed",
                        ErrorMessage = "reCAPTCHA validation failed. Please try again or contact support if the problem persists."
                    };
                }

                Console.WriteLine($"reCAPTCHA validation successful for plate {normalizedPlate}");
            }
            else
            {
                Console.WriteLine($"Warning: reCAPTCHA service not configured. Skipping validation for plate {normalizedPlate}");
            }

            // Get the first organization
            var organization = Db.Select<Organization>().FirstOrDefault();
            if (organization == null)
            {
                throw new HttpError(System.Net.HttpStatusCode.InternalServerError, "No organization found");
            }
            var orgId = organization.Id;

            // 1. Check if plate exists in recent camera events
            var recentCameraEvent = Db.Select<CameraEvent>(ce =>
                ce.LicensePlate == normalizedPlate &&
                ce.OrgId == orgId &&
                ce.Direction == VehicleDirection.entry)
                .OrderByDescending(ce => ce.Timestamp)
                .FirstOrDefault();

            Console.WriteLine($"Recent: {recentCameraEvent}");
            if (recentCameraEvent == null)
            {
                return new ValidateGuestPlateResponse
                {
                    Success = false,
                    IsFirstTime = false,
                    ErrorType = "not-in-parking",
                    ErrorMessage = "This license plate was not detected in the parking lot. Please verify your plate number or contact customer support."
                };
            }

            // 2. Check if plate belongs to existing customer
            var customerCar = Db.Select<Car>(c =>
                c.LicensePlate == normalizedPlate &&
                c.OrgId == orgId)
                .FirstOrDefault();

            if (customerCar != null)
            {
                return new ValidateGuestPlateResponse
                {
                    Success = false,
                    IsFirstTime = false,
                    ErrorType = "customer-plate",
                    ErrorMessage = "This license plate is associated with a customer account. Guest parking is not available for customer plates."
                };
            }

            // 3. Fetch all guest entries for this plate (single DB query)
            var guests = Db.Select<Guest>(g =>
                g.LicensePlate == normalizedPlate &&
                g.OrgId == orgId &&
                (g.Status == GuestStatus.Confirmed || g.Status == GuestStatus.PendingConfirmation));

            // Check if plate already has a confirmed guest entry
            var confirmedGuest = guests.FirstOrDefault(g => g.Status == GuestStatus.Confirmed);
            if (confirmedGuest != null)
            {
                return new ValidateGuestPlateResponse
                {
                    Success = false,
                    IsFirstTime = false,
                    ErrorType = "already-used",
                    ErrorMessage = "One-time guest parking has already been used for this plate. Please pay for parking or contact customer support."
                };
            }

            // 4. Find pending guest entry
            var pendingGuest = guests.FirstOrDefault(g => g.Status == GuestStatus.PendingConfirmation);

            if (pendingGuest == null)
            {
                return new ValidateGuestPlateResponse
                {
                    Success = false,
                    IsFirstTime = false,
                    ErrorType = "not-in-parking",
                    ErrorMessage = "No pending guest entry found for this plate. Please ensure the vehicle has entered the parking lot."
                };
            }

            // Check if guest entry has expired
            if (pendingGuest.ExpiresAt < DateTime.UtcNow)
            {
                // Mark as expired
                pendingGuest.Status = GuestStatus.Expired;
                await Db.UpdateAsync(pendingGuest);

                return new ValidateGuestPlateResponse
                {
                    Success = false,
                    IsFirstTime = false,
                    ErrorType = "expired",
                    ErrorMessage = "The confirmation window has expired. Please contact customer support."
                };
            }

            // 5. Confirm the guest entry
            pendingGuest.Status = GuestStatus.Confirmed;
            pendingGuest.ConfirmedAt = DateTime.UtcNow;
            await Db.UpdateAsync(pendingGuest);

            // 6. Create a parking session for the guest
            await CreateGuestParkingSessionAsync(pendingGuest, recentCameraEvent);

            Console.WriteLine($"Guest parking confirmed for license plate: {normalizedPlate}");

            return new ValidateGuestPlateResponse
            {
                Success = true,
                validUntil = pendingGuest.CreatedAt.AddHours(24), // Example: valid for 4 hours from creation
                IsFirstTime = true
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error validating guest plate: {ex.Message}");
            return new ValidateGuestPlateResponse
            {
                Success = false,
                IsFirstTime = false,
                ErrorType = "unknown",
                ErrorMessage = "An unexpected error occurred. Please try again or contact support."
            };
        }
    }

    private async Task CreateGuestParkingSessionAsync(Guest guest, CameraEvent entryEvent)
    {
        // Get the parking lot for this camera (you may need to adjust this logic)
        var parkingLot = Db.Select<ParkingLot>(pl =>
            pl.OrgId == guest.OrgId &&
            pl.Status == ParkingLotStatus.active)
            .FirstOrDefault();

        if (parkingLot == null)
        {
            Console.WriteLine($"Warning: No active parking lot found for guest {guest.LicensePlate}");
            return;
        }

        var parkingSession = new ParkingSession
        {
            OrgId = guest.OrgId,
            CarId = null, // No car record for guests
            ParkingLotId = parkingLot.Id,
            CustomerId = null, // No customer for guests
            EntryEventId = entryEvent.EventId,
            EntryTime = entryEvent.Timestamp,
            Status = SessionStatus.active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await Db.InsertAsync(parkingSession);
        Console.WriteLine($"Created parking session for guest: {guest.LicensePlate}");
    }
}
