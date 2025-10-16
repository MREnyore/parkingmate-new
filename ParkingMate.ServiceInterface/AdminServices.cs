using ServiceStack;
using ServiceStack.OrmLite;
using ServiceStack.Auth;
using ParkingMate.ServiceModel;

namespace ParkingMate.ServiceInterface;

public class AdminServices : Service
{
    public object Post(SeedDatabase request)
    {
        try
        {
            // Check if data already exists (unless forcing)
            if (!request.Force)
            {
                var authRepo = TryResolve<IAuthRepository>();
                var existingAuthUsers = authRepo.GetUserAuths().Count();
                var existingCustomers = Db.Count<Customer>();

                if (existingAuthUsers > 1 || existingCustomers > 0) // > 1 to allow test user
                {
                    return new SeedDatabaseResponse
                    {
                        Success = false,
                        Message = "Database already contains data. Use Force=true to re-seed."
                    };
                }
            }

            // Get or create default organization
            var orgId = GetOrCreateDefaultOrganization();

            // Create admin user (vlad.crishan20@gmail.com)
            var adminUserId = CreateAdminUser(orgId, request.Force);

            // Create car for Lisa
            var carId = CreateCar(orgId, request.Force);

            // Create customer (Lisa)
            var customerId = CreateCustomer(orgId, carId, request.Force);

            // Create parking lot
            var parkingLotId = CreateParkingLot(orgId, request.Force);

            return new SeedDatabaseResponse
            {
                Success = true,
                Message = "Test data seeded successfully!",
                Data = new SeedDataSummary
                {
                    OrganizationId = orgId,
                    AdminUserId = adminUserId,
                    CustomerId = customerId,
                    CarId = carId,
                    ParkingLotId = parkingLotId
                }
            };
        }
        catch (Exception ex)
        {
            DeleteAllData();

            return new SeedDatabaseResponse
            {
                Success = false,
                Message = $"Error seeding database: {ex.Message}"
            };
        }
    }

    private void DeleteAllData()
    {
        Db.DeleteAll<ParkingLot>();
        Db.DeleteAll<Customer>();
        Db.DeleteAll<Car>();
        // Note: UserAuth records are managed by authRepo, not deleted here
        Db.DeleteAll<Organization>();
    }

    private Guid GetOrCreateDefaultOrganization()
    {
        var existingOrg = Db.Select<Organization>(x => x.Name == "Default Organization").FirstOrDefault();
        if (existingOrg != null)
        {
            return existingOrg.Id;
        }

        var defaultOrg = new Organization
        {
            Id = Guid.NewGuid(),
            Name = "Default Organization",
            Status = OrganizationStatus.active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        Db.Save(defaultOrg);
        return defaultOrg.Id;
    }

    private string CreateAdminUser(Guid orgId, bool force)
    {
        const string adminEmail = "vlad.crishan20@gmail.com";
        const string adminUsername = "vlad.crishan20";

        var authRepo = TryResolve<IAuthRepository>();

        if (force)
        {
            // Delete existing admin user if forcing
            var existingUser = authRepo.GetUserAuthByUserName(adminUsername);
            if (existingUser != null)
            {
                authRepo.DeleteUserAuth(existingUser.Id.ToString());
            }
        }

        // Check if user already exists
        var existing = authRepo.GetUserAuthByUserName(adminUsername);
        if (existing != null)
        {
            return existing.Id.ToString();
        }

        var adminUser = new UserAuth
        {
            UserName = adminUsername,
            Email = adminEmail,
            FirstName = "Vlad",
            LastName = "Crishan",
            DisplayName = "Vlad Crishan",
            Roles = new List<string> { "Admin" },
            Meta = new Dictionary<string, string>
            {
                ["OrgId"] = orgId.ToString(),
                ["Address"] = "123 Admin Street",
                ["PostalCode"] = "12345",
                ["City"] = "Admin City"
            }
        };

        var createdUser = authRepo.CreateUserAuth(adminUser, "1234");
        return createdUser.Id.ToString();
    }

    private Guid CreateCustomer(Guid orgId, Guid carId, bool force)
    {
        const string customerEmail = "vlad.crishan20@gmail.com";

        if (force)
        {
            Db.Delete<Customer>(x => x.Email == customerEmail);
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            OrgId = orgId,
            Name = "Lisa",
            Email = customerEmail,
            PhoneNumber = "+1-555-0123",
            Registered = false,
            Status = CustomerStatus.active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        Db.Save(customer);

        // Update the car to reference this customer as owner
        Db.UpdateOnly(() => new Car { OwnerId = customer.Id },
            where: car => car.Id == carId);

        return customer.Id;
    }

    private Guid CreateCar(Guid orgId, bool force)
    {
        const string licensePlate = "MAB1234";

        if (force)
        {
            Db.Delete<Car>(x => x.LicensePlate == licensePlate);
        }

        var car = new Car
        {
            Id = Guid.NewGuid(),
            OrgId = orgId,
            LicensePlate = licensePlate,
            Brand = "Toyota",
            Model = "Camry",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        Db.Save(car);

        return car.Id;
    }

    private Guid CreateParkingLot(Guid orgId, bool force)
    {
        const string parkingLotName = "Main Parking Lot";

        if (force)
        {
            Db.Delete<ParkingLot>(x => x.Name == parkingLotName && x.OrgId == orgId);
        }

        var parkingLot = new ParkingLot
        {
            Id = Guid.NewGuid(),
            OrgId = orgId,
            Name = parkingLotName,
            Location = "Downtown Area",
            MaxDurationMinutes = 120, // 2 hours
            ValidTimes = null,
            AccessMode = AccessMode.customer,
            MaxVehiclesPerUser = 2,
            PenaltyFee = 25.00m,
            Status = ParkingLotStatus.active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        Db.Save(parkingLot);
        return parkingLot.Id;
    }
}