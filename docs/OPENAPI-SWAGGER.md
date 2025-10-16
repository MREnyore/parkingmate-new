# 🚀 ParkingMate API - OpenAPI/Swagger Documentation

## **✅ ServiceStack OpenAPI/Swagger Integration Enabled**

Your ParkingMate API now has full OpenAPI/Swagger support! ServiceStack provides excellent built-in capabilities for API documentation and testing.

---

## **📋 Available Documentation Endpoints**

### **1. OpenAPI Specification (JSON)**
```
GET https://localhost:5001/openapi
```
- **Format**: OpenAPI 3.0 JSON specification
- **Use**: Import into Postman, Insomnia, or other API clients
- **Content**: Complete API schema with all endpoints, models, and responses

### **2. Swagger UI**
```
GET https://localhost:5001/swagger-ui/
```
- **Interactive Documentation**: Test APIs directly in browser
- **Authentication Support**: JWT token authentication
- **Request/Response Examples**: Live API testing

### **3. ServiceStack UI (Enhanced)**
```
GET https://localhost:5001/ui
```
- **Native ServiceStack Interface**: Rich API explorer
- **Auto-generated Forms**: Interactive request builders
- **Real-time Testing**: Execute APIs with authentication

### **4. Metadata Endpoints**
```
GET https://localhost:5001/metadata           # HTML metadata page
GET https://localhost:5001/metadata?format=json  # JSON metadata
GET https://localhost:5001/types/typescript   # TypeScript DTOs
GET https://localhost:5001/types/csharp      # C# DTOs
```

---

## **🔐 API Authentication in Swagger**

### **JWT Authentication Setup:**
1. **Get JWT Token**:
   ```http
   POST /auth/customer-authenticate
   POST /auth/verify-otp
   ```

2. **Use in Swagger UI**:
   - Click "Authorize" button
   - Enter: `Bearer YOUR_JWT_TOKEN_HERE`
   - All subsequent requests will include the token

3. **Use in OpenAPI Clients**:
   ```http
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiI...
   ```

---

## **📚 API Endpoints Documentation**

### **🔑 Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/validate-registration-token` | Validate registration token | ❌ |
| `POST` | `/auth/register-customer` | Register new customer | ❌ |
| `POST` | `/auth/customer-authenticate` | Send OTP to customer email | ❌ |
| `POST` | `/auth/verify-otp` | Verify OTP and get JWT token | ❌ |
| `POST` | `/auth/customer/logout` | Customer logout | ✅ JWT |

### **👤 Customer Data Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/customer/info` | Get customer info + cars | ✅ JWT |
| `PUT` | `/customer/info` | Update customer information | ✅ JWT |

### **🚗 Car Management Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/customer/cars` | Add new car | ✅ JWT |
| `PUT` | `/customer/cars/{CarId}` | Update car information | ✅ JWT |
| `DELETE` | `/customer/cars/{CarId}` | Remove car | ✅ JWT |

### **👨‍💼 Admin Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signin` | Admin login | ❌ |

> **Note**: Admin user management (CRUD operations) endpoints are not yet implemented. Admin users are currently managed via ServiceStack's `UserAuth` table using `OrmLiteAuthRepository`. Future implementation will provide API endpoints for admin user management.

### **📊 Data Processing Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/data/camera-event` | Process camera event | ✅ Session |

---

## **🎯 Enhanced OpenAPI Features**

### **1. Rich API Descriptions**
- **Endpoint Descriptions**: Clear purpose and functionality
- **Parameter Validation**: Format requirements and constraints
- **Response Codes**: Detailed HTTP status code documentation
- **Error Handling**: Comprehensive error response examples

### **2. Request/Response Models**
```json
// Example: GetCustomerInfo Response
{
  "customerId": "57f0deab-61df-4172-a474-1bcdc07cb846",
  "name": "Lisa",
  "email": "vlad.crishan20@gmail.com",
  "phoneNumber": "+1-555-0123",
  "isRegistered": true,
  "status": "active",
  "cars": [
    {
      "carId": "car-guid-here",
      "licensePlate": "ABC123",
      "brand": "Toyota",
      "model": "Camry",
      "owner": {
        "ownerId": "57f0deab-61df-4172-a474-1bcdc07cb846",
        "ownerName": "Lisa",
        "ownerEmail": "vlad.crishan20@gmail.com"
      },
      "createdAt": "2025-09-27T15:49:18Z",
      "updatedAt": "2025-09-27T15:49:18Z"
    }
  ],
  "totalCars": 1,
  "createdAt": "2025-09-27T15:49:18Z",
  "updatedAt": "2025-09-27T15:49:18Z"
}
```

### **3. Validation Rules**
- **Email Format**: `format: "email"`
- **OTP Code**: `pattern: "^[0-9]{6}$"`
- **Required Fields**: Clearly marked
- **Field Descriptions**: Helpful context for each parameter

---

## **🛠️ Integration Examples**

### **1. Postman Integration**
```bash
# Import OpenAPI spec into Postman
1. Open Postman
2. Click "Import"
3. Enter URL: https://localhost:5001/openapi
4. Postman will auto-generate collection with all endpoints
```

### **2. Frontend SDK Generation**
```bash
# Generate TypeScript client
curl https://localhost:5001/types/typescript > parkingmate-api.d.ts

# Generate C# client
curl https://localhost:5001/types/csharp > ParkingMateClient.cs
```

### **3. API Testing**
```bash
# Test with curl using OpenAPI spec
curl -X POST https://localhost:5001/auth/customer-authenticate \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## **🎨 ServiceStack UI Features**

### **Enhanced API Explorer**
- **Auto-generated Forms**: No manual request building
- **Authentication Integration**: Seamless JWT token handling  
- **Response Formatting**: Pretty-printed JSON responses
- **Error Handling**: Clear error messages and status codes
- **Request History**: Track previous API calls

### **Development Benefits**
- **Live Documentation**: Always up-to-date with code changes
- **Interactive Testing**: Test APIs without external tools
- **Type Safety**: Generated DTOs ensure type correctness
- **Multi-format Support**: JSON, XML, CSV, JSV response formats

---

## **🚀 Getting Started**

### **1. Access Swagger UI**
```
Open: https://localhost:5001/swagger-ui/
```

### **2. Test Authentication Flow**
1. **Sign In**: `POST /auth/customer-authenticate`
2. **Verify OTP**: `POST /auth/verify-otp`
3. **Copy JWT Token**: From response
4. **Authorize**: Click "Authorize" in Swagger UI
5. **Test Protected Endpoints**: `GET /customer/info`

### **3. Explore ServiceStack UI**
```
Open: https://localhost:5001/ui
```

---

## **📈 Benefits of ServiceStack OpenAPI**

✅ **Auto-generated Documentation** - Always in sync with code  
✅ **Interactive Testing** - Test APIs directly in browser  
✅ **Client SDK Generation** - TypeScript, C#, and more  
✅ **Postman Integration** - Import specs directly  
✅ **Rich Metadata** - Comprehensive API information  
✅ **Authentication Support** - JWT and session auth  
✅ **Multi-format Responses** - JSON, XML, CSV support  
✅ **Type Safety** - Generated DTOs prevent errors  

Your ParkingMate API now has enterprise-grade documentation and testing capabilities! 🎉
