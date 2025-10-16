using NUnit.Framework;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using ParkingMate.ServiceModel;

namespace ParkingMate.Tests;

[TestFixture]
public class DatabaseTests
{
    private IDbConnectionFactory? dbFactory;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        // Use in-memory SQLite for testing instead of PostgreSQL
        dbFactory = new OrmLiteConnectionFactory(":memory:", SqliteDialect.Provider);

        // Initialize tables (excluding User - now managed by ServiceStack's UserAuth)
        using var db = dbFactory.Open();
        db.CreateTableIfNotExists<Organization>();
        db.CreateTableIfNotExists<Customer>();
        db.CreateTableIfNotExists<ParkingLot>();
        db.CreateTableIfNotExists<Car>();
        db.CreateTableIfNotExists<CameraEvent>();
        db.CreateTableIfNotExists<ParkingSession>();
        db.CreateTableIfNotExists<Penalty>();
    }

    [Test]
    public void Can_CreateTables_Without_Errors()
    {
        using var db = dbFactory!.Open();

        // Verify tables exist by inserting test data
        var org = new Organization { Id = Guid.NewGuid(), Name = "Test Org" };
        db.Insert(org);

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            OrgId = org.Id,
            Name = "Test Customer"
        };
        db.Insert(customer);

        // Verify data was inserted
        Assert.That(db.Select<Organization>().Count, Is.EqualTo(1));
        Assert.That(db.Select<Customer>().Count, Is.EqualTo(1));

        // Note: User authentication is now handled by ServiceStack's UserAuth table
        // which is managed separately by OrmLiteAuthRepository
    }

    [Test]
    public void Can_Handle_ForeignKey_Relationships()
    {
        using var db = dbFactory!.Open();

        // Create organization
        var org = new Organization { Id = Guid.NewGuid(), Name = "Test Org 2" };
        db.Insert(org);

        // Create parking lot
        var parkingLot = new ParkingLot
        {
            Id = Guid.NewGuid(),
            OrgId = org.Id,
            Name = "Test Parking Lot",
            AccessMode = AccessMode.customer
        };
        db.Insert(parkingLot);

        // Create car
        var car = new Car
        {
            Id = Guid.NewGuid(),
            LicensePlate = "ABC123",
            Label = "Test Car"
        };
        db.Insert(car);

        // Create camera event
        var cameraEvent = new CameraEvent
        {
            EventId = Guid.NewGuid(),
            OrgId = org.Id,
            CameraId = Guid.NewGuid(),
            Direction = VehicleDirection.entry,
            Timestamp = DateTime.UtcNow,
            ParkingLotId = parkingLot.Id
        };
        db.Insert(cameraEvent);

        // Verify relationships
        var events = db.Select<CameraEvent>(x => x.ParkingLotId == parkingLot.Id);
        Assert.That(events.Count, Is.EqualTo(1));
    }
}