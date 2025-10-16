using ServiceStack.DataAnnotations;

namespace ParkingMate.ServiceModel;

// Enums
public enum OrganizationStatus
{
    active,
    inactive
}

public enum CustomerStatus
{
    active,
    inactive
}


public enum AccessMode
{
    customer,
    guest
}

public enum ParkingLotStatus
{
    active,
    inactive,
    maintenance
}

public enum SessionStatus
{
    active,
    completed,
    expired,
    penalized
}

public enum PenaltyStatus
{
    pending,
    paid,
    waived
}

public enum VehicleDirection
{
    entry,
    exit
}

// Database Models
[Alias("organizations")]
public class Organization
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [Required]
    public required string Name { get; set; }

    [Default("'active'")]
    public OrganizationStatus Status { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

// Note: Admin users are now managed via ServiceStack's UserAuth table (OrmLiteAuthRepository)
// Multi-tenant support is achieved through UserAuth.Meta["OrgId"]

[Alias("customers")]
public class Customer
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [Required]
    public required string Name { get; set; }

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    [Default("false")]
    public bool Registered { get; set; }

    [Default("'active'")]
    public CustomerStatus Status { get; set; }

    [Default("'active'")]
    public string? MembershipStatus { get; set; }

    public DateTime? MembershipExpiryDate { get; set; }

    public string? Address { get; set; }

    public string? PostalCode { get; set; }

    public string? City { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("parking_lots")]
public class ParkingLot
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [Required]
    public required string Name { get; set; }

    public string? Location { get; set; }

    public int? MaxDurationMinutes { get; set; }

    public string? ValidTimes { get; set; }

    [Required]
    public AccessMode AccessMode { get; set; }

    public int? MaxVehiclesPerUser { get; set; }

    [CustomField("NUMERIC(10,2)")]
    public decimal? PenaltyFee { get; set; }

    [Default("'active'")]
    public ParkingLotStatus Status { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("cars")]
public class Car
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [References(typeof(Customer))]
    [ForeignKey(typeof(Customer), OnDelete = "CASCADE")]
    [Required]
    public Guid OwnerId { get; set; }

    [Index]
    public string? LicensePlate { get; set; }

    public string? Label { get; set; }

    public string? Brand { get; set; }

    public string? Model { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("camera_events")]
public class CameraEvent
{
    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [PrimaryKey]
    public Guid EventId { get; set; }

    [Required]
    public Guid CameraId { get; set; }

    public string? LocationName { get; set; }

    public string? ImageBase64 { get; set; }

    [CustomField("REAL CHECK (confidence >= 0.0 AND confidence <= 1.0)")]
    public float? Confidence { get; set; }

    [Required]
    public VehicleDirection Direction { get; set; }

    public string? DeviceType { get; set; }

    [Index]
    public string? LicensePlate { get; set; }

    [References(typeof(ParkingLot))]
    [ForeignKey(typeof(ParkingLot), OnDelete = "SET NULL")]
    public Guid? ParkingLotId { get; set; }

    [Required]
    [Index]
    public DateTime Timestamp { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("parking_sessions")]
public class ParkingSession
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [References(typeof(Car))]
    [ForeignKey(typeof(Car), OnDelete = "SET NULL")]
    public Guid? CarId { get; set; }

    [References(typeof(ParkingLot))]
    [ForeignKey(typeof(ParkingLot), OnDelete = "CASCADE")]
    public Guid ParkingLotId { get; set; }

    [References(typeof(Customer))]
    [ForeignKey(typeof(Customer), OnDelete = "SET NULL")]
    public Guid? CustomerId { get; set; }

    [References(typeof(CameraEvent))]
    [ForeignKey(typeof(CameraEvent), OnDelete = "CASCADE")]
    public Guid EntryEventId { get; set; }

    [References(typeof(CameraEvent))]
    [ForeignKey(typeof(CameraEvent), OnDelete = "SET NULL")]
    public Guid? ExitEventId { get; set; }

    [Required]
    [Index]
    public DateTime EntryTime { get; set; }

    public DateTime? ExitTime { get; set; }

    [Default("'active'")]
    [Index]
    public SessionStatus Status { get; set; }

    [CustomField("NUMERIC(10,2)")]
    public decimal? PenaltyAmount { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("penalties")]
public class Penalty
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [References(typeof(ParkingSession))]
    [ForeignKey(typeof(ParkingSession), OnDelete = "CASCADE")]
    public Guid ParkingSessionId { get; set; }

    [Required]
    [CustomField("NUMERIC(10,2)")]
    public decimal Amount { get; set; }

    public string? Reason { get; set; }

    [Default("'pending'")]
    [Index]
    public PenaltyStatus Status { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime IssuedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("registration_tokens")]
public class RegistrationToken
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [Required]
    public required string Email { get; set; }

    [Required]
    [Index(Unique = true)]
    public required string Token { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    [Default("false")]
    public bool Used { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("otp_tokens")]
public class OtpToken
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [Required]
    public required string Email { get; set; }

    [Required]
    public required string Code { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    [Default("false")]
    public bool Used { get; set; }

    public string? Purpose { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}

[Alias("refresh_tokens")]
public class RefreshTokenEntity
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Customer))]
    [ForeignKey(typeof(Customer), OnDelete = "CASCADE")]
    [Required]
    public Guid CustomerId { get; set; }

    [Index]
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiresAt { get; set; }

    [Default("false")]
    public bool IsRevoked { get; set; }

    public string? DeviceInfo { get; set; }

    public string? IpAddress { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime UpdatedAt { get; set; }
}

public enum GuestStatus
{
    PendingConfirmation,
    Confirmed,
    Expired
}

[Alias("guests")]
public class Guest
{
    [PrimaryKey]
    [Default("uuid_generate_v4()")]
    public Guid Id { get; set; }

    [References(typeof(Organization))]
    [ForeignKey(typeof(Organization), OnDelete = "CASCADE")]
    public Guid OrgId { get; set; }

    [Required]
    [Index]
    public required string LicensePlate { get; set; }

    [References(typeof(CameraEvent))]
    [ForeignKey(typeof(CameraEvent), OnDelete = "SET NULL")]
    public Guid? CameraEventId { get; set; }

    [Default("'PendingConfirmation'")]
    [Index]
    public GuestStatus Status { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    [Required]
    public DateTime ExpiresAt { get; set; }

    [Default("CURRENT_TIMESTAMP")]
    public DateTime CreatedAt { get; set; }
}