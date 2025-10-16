using ServiceStack;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using ServiceStack.Auth;
using ParkingMate.ServiceModel;
using System.Data;

namespace ParkingMate.ServiceInterface;

[Authenticate]
public class CustomerDataServices : Service
{
    private readonly IDbConnectionFactory _dbFactory;

    public CustomerDataServices(IDbConnectionFactory dbFactory)
    {
        _dbFactory = dbFactory;
    }

    public object Get(GetCustomerInfo request)
    {
        var session = SessionAs<AuthUserSession>();
        
        if (session?.IsAuthenticated != true || !session.UserName?.StartsWith("customer:") == true)
        {
            throw HttpError.Unauthorized("Customer authentication required");
        }

        var customerId = Guid.Parse(session.UserAuthId);
        var customer = Db.SelectByIds<Customer>(new[] { customerId }).FirstOrDefault();

        if (customer == null)
        {
            throw HttpError.NotFound("Customer not found");
        }

        // Get all cars owned by this customer
        var cars = Db.Select<Car>(c => c.OwnerId == customerId);

        var customerCars = cars.Select(car => new CustomerCarInfo
        {
            CarId = car.Id,
            LicensePlate = car.LicensePlate,
            Label = car.Label,
            Brand = car.Brand,
            Model = car.Model,
            Owner = new CarOwnerInfo
            {
                OwnerId = customer.Id,
                OwnerName = customer.Name,
                OwnerEmail = customer.Email
            },
            CreatedAt = car.CreatedAt,
            UpdatedAt = car.UpdatedAt
        }).ToList();

        return new GetCustomerInfoResponse
        {
            CustomerId = customer.Id,
            Name = customer.Name,
            Email = customer.Email,
            PhoneNumber = customer.PhoneNumber,
            IsRegistered = customer.Registered,
            Status = customer.Status,
            MembershipStatus = customer.MembershipStatus,
            MembershipExpiryDate = customer.MembershipExpiryDate,
            Address = customer.Address,
            PostalCode = customer.PostalCode,
            City = customer.City,
            Cars = customerCars,
            TotalCars = customerCars.Count,
            CreatedAt = customer.CreatedAt,
            UpdatedAt = customer.UpdatedAt
        };
    }


    public object Put(UpdateCustomerInfo request)
    {
        var session = SessionAs<AuthUserSession>();
        
        if (session?.IsAuthenticated != true || !session.UserName?.StartsWith("customer:") == true)
        {
            throw HttpError.Unauthorized("Customer authentication required");
        }

        var customerId = Guid.Parse(session.UserAuthId);
        var customer = Db.SelectByIds<Customer>(new[] { customerId }).FirstOrDefault();

        if (customer == null)
        {
            throw HttpError.NotFound("Customer not found");
        }

        // Update fields that are provided
        bool hasUpdates = false;
        
        if (!string.IsNullOrWhiteSpace(request.Name))
        {
            customer.Name = request.Name;
            hasUpdates = true;
        }
        
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            customer.PhoneNumber = request.PhoneNumber;
            hasUpdates = true;
        }
        
        if (!string.IsNullOrWhiteSpace(request.MembershipStatus))
        {
            customer.MembershipStatus = request.MembershipStatus;
            hasUpdates = true;
        }
        
        if (request.MembershipExpiryDate.HasValue)
        {
            customer.MembershipExpiryDate = request.MembershipExpiryDate;
            hasUpdates = true;
        }
        
        if (!string.IsNullOrWhiteSpace(request.Address))
        {
            customer.Address = request.Address;
            hasUpdates = true;
        }
        
        if (!string.IsNullOrWhiteSpace(request.PostalCode))
        {
            customer.PostalCode = request.PostalCode;
            hasUpdates = true;
        }
        
        if (!string.IsNullOrWhiteSpace(request.City))
        {
            customer.City = request.City;
            hasUpdates = true;
        }

        if (hasUpdates)
        {
            customer.UpdatedAt = DateTime.UtcNow;
            Db.Update(customer);
        }

        return new UpdateCustomerInfoResponse
        {
            Success = true,
            Message = "Customer information updated successfully",
            CustomerInfo = new GetCustomerInfoResponse
            {
                CustomerId = customer!.Id,
                Name = customer.Name,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                IsRegistered = customer.Registered,
                Status = customer.Status,
                MembershipStatus = customer.MembershipStatus,
                MembershipExpiryDate = customer.MembershipExpiryDate,
                Address = customer.Address,
                PostalCode = customer.PostalCode,
                City = customer.City,
                CreatedAt = customer.CreatedAt,
                UpdatedAt = customer.UpdatedAt
            }
        };
    }

    public object Post(AddCustomerCar request)
    {
        var session = SessionAs<AuthUserSession>();
        
        if (session?.IsAuthenticated != true || !session.UserName?.StartsWith("customer:") == true)
        {
            throw HttpError.Unauthorized("Customer authentication required");
        }

        var customerId = Guid.Parse(session.UserAuthId);
        
        // Verify customer exists
        var customer = Db.SelectByIds<Customer>(new[] { customerId }).FirstOrDefault();
        if (customer == null)
        {
            throw HttpError.NotFound("Customer not found");
        }

        // Check if license plate already exists for this organization
        var existingCar = Db.Select<Car>(c => 
            c.OrgId == customer.OrgId && 
            c.LicensePlate == request.LicensePlate).FirstOrDefault();
        
        if (existingCar != null)
        {
            throw HttpError.Conflict("A car with this license plate already exists in the system");
        }

        // Create new car - ALWAYS with an owner (current authenticated customer)
        var newCar = new Car
        {
            OrgId = customer.OrgId,
            OwnerId = customerId, // Required: Cars must have owners
            LicensePlate = request.LicensePlate,
            Label = request.Label,
            Brand = request.Brand,
            Model = request.Model,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        Db.Insert(newCar);

        return new AddCustomerCarResponse
        {
            Success = true,
            Message = "Car added successfully",
            CarInfo = new CustomerCarInfo
            {
                CarId = newCar.Id,
                LicensePlate = newCar.LicensePlate,
                Label = newCar.Label,
                Brand = newCar.Brand,
                Model = newCar.Model,
                Owner = new CarOwnerInfo
                {
                    OwnerId = customer.Id,
                    OwnerName = customer.Name,
                    OwnerEmail = customer.Email
                },
                CreatedAt = newCar.CreatedAt,
                UpdatedAt = newCar.UpdatedAt
            }
        };
    }

    public object Put(UpdateCustomerCar request)
    {
        var session = SessionAs<AuthUserSession>();
        
        if (session?.IsAuthenticated != true || !session.UserName?.StartsWith("customer:") == true)
        {
            throw HttpError.Unauthorized("Customer authentication required");
        }

        var customerId = Guid.Parse(session.UserAuthId);
        
        // Verify customer exists
        var customer = Db.SelectByIds<Customer>(new[] { customerId }).FirstOrDefault();
        if (customer == null)
        {
            throw HttpError.NotFound("Customer not found");
        }

        // Get the car and verify ownership
        var car = Db.SelectByIds<Car>(new[] { request.CarId }).FirstOrDefault();
        if (car == null)
        {
            throw HttpError.NotFound("Car not found");
        }

        if (car.OwnerId != customerId)
        {
            throw HttpError.Forbidden("You can only update your own cars");
        }

        // Check if license plate already exists for another car in this organization
        if (!string.IsNullOrWhiteSpace(request.LicensePlate) && request.LicensePlate != car.LicensePlate)
        {
            var existingCar = Db.Select<Car>(c => 
                c.OrgId == customer.OrgId && 
                c.LicensePlate == request.LicensePlate &&
                c.Id != request.CarId).FirstOrDefault();
            
            if (existingCar != null)
            {
                throw HttpError.Conflict("A car with this license plate already exists in the system");
            }
        }

        // Update fields that are provided
        bool hasUpdates = false;

        if (!string.IsNullOrWhiteSpace(request.LicensePlate))
        {
            car.LicensePlate = request.LicensePlate;
            hasUpdates = true;
        }

        if (request.Label != null)
        {
            car.Label = request.Label;
            hasUpdates = true;
        }

        if (!string.IsNullOrWhiteSpace(request.Brand))
        {
            car.Brand = request.Brand;
            hasUpdates = true;
        }

        if (!string.IsNullOrWhiteSpace(request.Model))
        {
            car.Model = request.Model;
            hasUpdates = true;
        }

        if (hasUpdates)
        {
            car.UpdatedAt = DateTime.UtcNow;
            Db.Update(car);
        }

        return new UpdateCustomerCarResponse
        {
            Success = true,
            Message = "Car updated successfully",
            CarInfo = new CustomerCarInfo
            {
                CarId = car.Id,
                LicensePlate = car.LicensePlate,
                Label = car.Label,
                Brand = car.Brand,
                Model = car.Model,
                Owner = new CarOwnerInfo
                {
                    OwnerId = customer.Id,
                    OwnerName = customer.Name,
                    OwnerEmail = customer.Email
                },
                CreatedAt = car.CreatedAt,
                UpdatedAt = car.UpdatedAt
            }
        };
    }

    public object Delete(DeleteCustomerCar request)
    {
        var session = SessionAs<AuthUserSession>();
        
        if (session?.IsAuthenticated != true || !session.UserName?.StartsWith("customer:") == true)
        {
            throw HttpError.Unauthorized("Customer authentication required");
        }

        var customerId = Guid.Parse(session.UserAuthId);
        
        // Get the car and verify ownership
        var car = Db.SelectByIds<Car>(new[] { request.CarId }).FirstOrDefault();
        if (car == null)
        {
            throw HttpError.NotFound("Car not found");
        }

        if (car.OwnerId != customerId)
        {
            throw HttpError.Forbidden("You can only delete your own cars");
        }

        // Check if car is referenced in any active parking sessions
        var activeSessions = Db.Select<ParkingSession>(s => 
            s.CarId == request.CarId && 
            s.Status == SessionStatus.active).Any();
        
        if (activeSessions)
        {
            throw HttpError.Conflict("Cannot delete car with active parking sessions. Please complete or cancel active sessions first.");
        }

        // Since OwnerId is now required, we perform a hard delete
        // But first, we need to handle any historical parking sessions by setting CarId to null
        Db.Update<ParkingSession>(new { CarId = (Guid?)null }, 
                                  where: s => s.CarId == request.CarId);
        
        // Now we can safely delete the car
        Db.DeleteById<Car>(request.CarId);

        return new DeleteCustomerCarResponse
        {
            Success = true,
            Message = "Car removed successfully"
        };
    }
}
