using ServiceStack;
using ServiceStack.OrmLite;
using ParkingMate.ServiceModel;
using System.Text.RegularExpressions;

namespace ParkingMate.ServiceInterface;

public class DataHubServices : Service
{
    private readonly IEmailService? _emailService;

    public DataHubServices(IEmailService? emailService = null)
    {
        _emailService = emailService;
    }

    public async Task<object> Post(CreateDatahubEntry request)
    {
        ValidateDatahubRequest(request.license_plate, request.confidence);

        // Get the first available organization (should be seeded via admin/seed-db)
        var orgId = GetFirstOrganizationId();

        var cameraEvent = new CameraEvent
        {
            EventId = Guid.Parse(request.event_id),
            LicensePlate = request.license_plate.ToUpperInvariant(),
            Timestamp = request.timestamp,
            CameraId = Guid.Parse(request.camera_id),
            LocationName = request.location_name,
            ImageBase64 = request.image_base64,
            Confidence = request.confidence,
            Direction = request.direction,
            DeviceType = request.device_type,
            CreatedAt = DateTime.UtcNow,
            OrgId = orgId
        };

        Db.Save(cameraEvent);

        // Check if this is a customer or guest entry
        var (isGuest, guestStatus) = await HandleVehicleEntryAsync(cameraEvent);

        return new CreateDatahubEntryResponse
        {
            CameraEvent = cameraEvent,
            IsGuestEntry = isGuest,
            GuestStatus = guestStatus
        };
    }

    private Guid GetFirstOrganizationId()
    {
        var organization = Db.Select<Organization>().FirstOrDefault();
        if (organization == null)
        {
            throw new HttpError(System.Net.HttpStatusCode.InternalServerError, "No organizations found. Please run the database seeding first via POST /admin/seed-db");
        }
        return organization.Id;
    }

    private static void ValidateDatahubRequest(string licensePlate, float confidence)
    {
        // Validate license plate format (basic validation - adjust pattern as needed)
        if (string.IsNullOrWhiteSpace(licensePlate))
        {
            throw HttpError.BadRequest("License plate is required");
        }

        // Remove spaces and validate format (alphanumeric, 2-10 characters)
        var cleanedPlate = licensePlate.Replace(" ", "");
        if (!Regex.IsMatch(cleanedPlate, @"^[A-Z0-9]{2,10}$", RegexOptions.IgnoreCase))
        {
            throw HttpError.BadRequest("License plate must be alphanumeric and between 2-10 characters (spaces will be removed)");
        }

        // Validate confidence range
        if (confidence < 0.0f || confidence > 1.0f)
        {
            throw HttpError.BadRequest("Confidence must be between 0.0 and 1.0");
        }
    }

    private async Task<(bool isGuest, string? guestStatus)> HandleVehicleEntryAsync(CameraEvent cameraEvent)
    {
        try
        {
            // Check if this is a registered customer vehicle
            var car = Db.Select<Car>(x => x.LicensePlate == cameraEvent.LicensePlate && x.OrgId == cameraEvent.OrgId)
                .FirstOrDefault();

            if (car != null)
            {
                // This is a customer vehicle, send email notification
                await SendEmailNotificationAsync(cameraEvent, car);
                return (false, "not-guest");
            }

            // Not a customer vehicle - check if it's already a guest
            var existingGuest = Db.Select<Guest>(g =>
                g.LicensePlate == cameraEvent.LicensePlate &&
                g.OrgId == cameraEvent.OrgId &&
                g.Status == GuestStatus.Confirmed)
                .FirstOrDefault();

            if (existingGuest != null)
            {
                Console.WriteLine($"License plate {cameraEvent.LicensePlate} is already a confirmed guest. No new guest entry created.");
                return (true, "already-confirmed");
            }

            // Check if there's already a pending guest entry
            var pendingGuest = Db.Select<Guest>(g =>
                g.LicensePlate == cameraEvent.LicensePlate &&
                g.OrgId == cameraEvent.OrgId &&
                g.Status == GuestStatus.PendingConfirmation &&
                g.ExpiresAt > DateTime.UtcNow)
                .FirstOrDefault();

            if (pendingGuest != null)
            {
                Console.WriteLine($"License plate {cameraEvent.LicensePlate} already has a pending guest confirmation.");
                return (true, "pending-confirmation");
            }

            // Create new guest entry with pending confirmation
            var newGuest = new Guest
            {
                OrgId = cameraEvent.OrgId,
                LicensePlate = cameraEvent.LicensePlate!,
                CameraEventId = cameraEvent.EventId,
                Status = GuestStatus.PendingConfirmation,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30), // 30 minutes to confirm
                CreatedAt = DateTime.UtcNow
            };

            await Db.InsertAsync(newGuest);
            Console.WriteLine($"Created pending guest entry for license plate: {cameraEvent.LicensePlate}");

            return (true, "pending-confirmation");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error handling vehicle entry: {ex.Message}");
            return (false, "error");
        }
    }

    private async Task SendEmailNotificationAsync(CameraEvent cameraEvent, Car car)
    {
        try
        {
            if (_emailService == null)
            {
                return;
            }

            // Find the customer owner (OwnerId is now required)
            var customer = Db.SelectByIds<Customer>(new[] { car.OwnerId })
                .FirstOrDefault();

            if (customer == null || string.IsNullOrWhiteSpace(customer.Email))
            {
                Console.WriteLine($"No customer email found for car owner ID: {car.OwnerId}");
                return;
            }

            if (customer.Registered)
            {
                // Customer is already registered, no need to send registration token
                Console.WriteLine($"Customer {customer.Email} is already registered.");
                return;
            }

            // Create registration token if customer is not registered
            string? registrationToken = await CreateRegistrationTokenAsync(customer.OrgId, customer.Email);

            // Send email notification
            var emailSent = await _emailService.SendVehicleDetectionEmailWithTokenAsync(customer.Email, customer.Name, registrationToken);

            if (emailSent)
            {
                Console.WriteLine($"Email notification sent to {customer.Email} for license plate {cameraEvent.LicensePlate}");
            }
            else
            {
                Console.WriteLine($"Failed to send email notification to {customer.Email} for license plate {cameraEvent.LicensePlate}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error sending email notification: {ex.Message}");
        }
    }

    private async Task<string> CreateRegistrationTokenAsync(Guid orgId, string email)
    {
        // Generate a secure random token
        var tokenBytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        var token = Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");

        // Save to database
        var registrationToken = new RegistrationToken
        {
            OrgId = orgId,
            Email = email,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(48)
        };

        await Db.InsertAsync(registrationToken);
        return token;
    }
}