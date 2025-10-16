using ServiceStack;

namespace ParkingMate.ServiceModel;

[Route("/api/datahub/entry", "POST")]
[Route("/api/data/camera-event", "POST")]
[Tag("Data Hub")]
public class CreateDatahubEntry : IPost, IReturn<CreateDatahubEntryResponse>
{
    public required string license_plate { get; set; }
    [Input(Type = "datetime-local")]
    public required DateTime timestamp { get; set; }
    public required string camera_id { get; set; }
    public string? location_name { get; set; }
    public string? image_base64 { get; set; }
    public required float confidence { get; set; }
    public required VehicleDirection direction { get; set; }
    public string? device_type { get; set; }
    public required string event_id { get; set; }
}

public class CreateDatahubEntryResponse
{
    public required CameraEvent CameraEvent { get; set; }
    public bool IsGuestEntry { get; set; }
    public string? GuestStatus { get; set; }  // pending-confirmation, confirmed, not-guest
    public ResponseStatus? ResponseStatus { get; set; }
}

[Route("/api/admin/seed-db", "POST")]
[Tag("Admin")]
public class SeedDatabase : IPost, IReturn<SeedDatabaseResponse>
{
    public bool Force { get; set; } = false; // Force re-seed even if data exists
}

public class SeedDatabaseResponse
{
    public string Message { get; set; } = "";
    public bool Success { get; set; }
    public SeedDataSummary? Data { get; set; }
    public ResponseStatus? ResponseStatus { get; set; }
}

public class SeedDataSummary
{
    public Guid OrganizationId { get; set; }
    public string AdminUserId { get; set; } = string.Empty; // ServiceStack UserAuth ID (string/int)
    public Guid CustomerId { get; set; }
    public Guid CarId { get; set; }
    public Guid ParkingLotId { get; set; }
}