# 🔐 ParkingMate API - Refresh Token Authentication

## **✅ Production-Ready Authentication System Implemented**

Your ParkingMate API now has a **complete refresh token authentication system** that follows industry best practices for security and user experience.

---

## **🎯 Authentication Flow Overview**

### **Enhanced Authentication Flow:**
```
1. Customer Sign In → OTP → Access Token + Refresh Token
2. Use Access Token for API calls (30 minutes)
3. When Access Token expires → Use Refresh Token to get new tokens
4. Validate tokens for security checks
5. Logout revokes refresh tokens
```

### **Security Benefits:**
✅ **Short-lived Access Tokens** (30 minutes) - Reduced security risk  
✅ **Long-lived Refresh Tokens** (30 days) - Better user experience  
✅ **Token Rotation** - New tokens on each refresh  
✅ **Token Revocation** - Can invalidate compromised tokens  
✅ **Device Tracking** - Monitor user sessions  
✅ **Audit Trail** - Track authentication patterns  

---

## **🔑 New Authentication Endpoints**

### **1. Enhanced OTP Verification**
```http
POST /auth/verify-otp
```
**Response:**
```json
{
  "success": true,
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiI...",
  "refreshToken": "base64-encoded-refresh-token",
  "accessTokenExpiresAt": "2025-09-27T20:30:00Z",
  "refreshTokenExpiresAt": "2025-10-27T19:30:00Z",
  "email": "customer@example.com",
  "name": "Customer Name",
  "isRegisteredCustomer": true
}
```

### **2. Refresh Access Token**
```http
POST /auth/refresh-token
```
**Request:**
```json
{
  "token": "base64-encoded-refresh-token"
}
```
**Response:**
```json
{
  "success": true,
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-refresh-token",
  "accessTokenExpiresAt": "2025-09-27T21:00:00Z",
  "refreshTokenExpiresAt": "2025-10-27T20:00:00Z"
}
```

### **3. Validate Access Token**
```http
POST /auth/validate-auth-token
```
**Request:**
```json
{
  "accessToken": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiI..."
}
```
**Response:**
```json
{
  "isValid": true,
  "customerId": "57f0deab-61df-4172-a474-1bcdc07cb846",
  "email": "customer@example.com",
  "expiresAt": "2025-09-27T20:30:00Z"
}
```

### **4. Enhanced Logout**
```http
POST /auth/customer/logout
```
**Request:**
```json
{
  "refreshToken": "base64-encoded-refresh-token"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## **🗄️ Database Schema**

### **New RefreshToken Table:**
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    device_info TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_customer_id ON refresh_tokens(customer_id);
```

### **Token Management Features:**
- **Automatic Expiration** - Tokens expire after 30 days
- **Revocation Support** - Can invalidate tokens immediately
- **Device Tracking** - Store user agent and IP address
- **Audit Trail** - Track creation and update times
- **Cascade Deletion** - Tokens removed when customer deleted

---

## **🔒 Security Features**

### **1. Token Lifecycle Management**
- **Access Tokens**: 30 minutes (short-lived for security)
- **Refresh Tokens**: 30 days (long-lived for UX)
- **Automatic Rotation**: New tokens issued on refresh
- **Old Token Revocation**: Previous tokens invalidated

### **2. Device and Session Tracking**
```csharp
public class RefreshTokenEntity
{
    public Guid CustomerId { get; set; }     // Link to customer
    public string Token { get; set; }        // Unique refresh token
    public DateTime ExpiresAt { get; set; }  // Expiration time
    public bool IsRevoked { get; set; }      // Revocation status
    public string DeviceInfo { get; set; }   // User agent tracking
    public string IpAddress { get; set; }    // IP address tracking
}
```

### **3. Security Validations**
- **Token Uniqueness** - Each refresh token is unique
- **Expiration Checks** - Automatic expiry validation
- **Revocation Checks** - Blocked revoked tokens
- **Customer Validation** - Verify token ownership

---

## **🚀 Client Implementation Guide**

### **Frontend JavaScript Example:**
```javascript
class ParkingMateAuth {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.accessTokenExpiry = localStorage.getItem('accessTokenExpiry');
    }

    async signIn(email) {
        const response = await fetch('/auth/customer-authenticate', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
        return response.json();
    }

    async validateToken(accessToken) {
        const response = await fetch('/auth/validate-auth-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken })
        });
        
        if (data.success) {
            this.storeTokens(data);
        }
        return data;
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch('/auth/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: this.refreshToken })
        });

        const data = await response.json();
        if (data.success) {
            this.storeTokens(data);
        }
        return data;
    }

    async apiCall(url, options = {}) {
        // Check if access token is expired
        if (this.isAccessTokenExpired()) {
            await this.refreshAccessToken();
        }

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    storeTokens(data) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.accessTokenExpiry = data.accessTokenExpiresAt;
        
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        localStorage.setItem('accessTokenExpiry', this.accessTokenExpiry);
    }

    isAccessTokenExpired() {
        if (!this.accessTokenExpiry) return true;
        return new Date() >= new Date(this.accessTokenExpiry);
    }

    async logout() {
        await fetch('/auth/customer/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: this.refreshToken })
        });
        
        this.clearTokens();
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.accessTokenExpiry = null;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessTokenExpiry');
    }
}
```

---

## **📱 Mobile App Integration**

### **Token Storage Recommendations:**
- **iOS**: Use Keychain Services for secure token storage
- **Android**: Use EncryptedSharedPreferences
- **React Native**: Use react-native-keychain
- **Flutter**: Use flutter_secure_storage

### **Background Token Refresh:**
```javascript
// Set up automatic token refresh
setInterval(async () => {
    if (auth.isAccessTokenExpired()) {
        try {
            await auth.refreshAccessToken();
        } catch (error) {
            // Redirect to login if refresh fails
            auth.clearTokens();
            redirectToLogin();
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes
```

---

## **🔍 Testing the Implementation**

### **1. Test Authentication Flow:**
```bash
# 1. Sign in
curl -X POST https://localhost:5001/auth/customer-authenticate \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify OTP
curl -X POST https://localhost:5001/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'

# 3. Use access token
curl -X GET https://localhost:5001/customer/info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Refresh token
curl -X POST https://localhost:5001/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_REFRESH_TOKEN"}'

# 5. Validate token
curl -X POST https://localhost:5001/auth/validate-auth-token \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "Bearer YOUR_ACCESS_TOKEN"}'
```

### **2. Test Files Available:**
- `test-refresh-tokens.http` - Complete flow testing
- `test-customer-crud-fixed.http` - API endpoint testing

---

## **🎯 Benefits Achieved**

### **Security Improvements:**
✅ **Reduced Attack Surface** - Short-lived access tokens  
✅ **Token Revocation** - Can invalidate compromised tokens  
✅ **Device Management** - Track and manage user sessions  
✅ **Audit Capabilities** - Monitor authentication patterns  

### **User Experience Improvements:**
✅ **Seamless Authentication** - No frequent re-login  
✅ **Background Refresh** - Transparent token renewal  
✅ **Multi-Device Support** - Independent token management  
✅ **Graceful Logout** - Proper session termination  

### **Developer Experience:**
✅ **Industry Standard** - OAuth 2.0 refresh token pattern  
✅ **ServiceStack Integration** - Leverages existing JWT infrastructure  
✅ **Comprehensive APIs** - Full token lifecycle management  
✅ **Testing Support** - Complete test scenarios provided  

---

## **🚀 Production Considerations**

### **Environment Configuration:**
```json
{
  "JWT": {
    "AccessTokenExpiryMinutes": 30,
    "RefreshTokenExpiryDays": 30,
    "SecretKey": "your-production-secret-key"
  },
  "Security": {
    "RequireHttps": true,
    "EnableTokenRotation": true,
    "MaxRefreshTokensPerUser": 5
  }
}
```

### **Monitoring and Alerts:**
- Track token refresh rates
- Monitor failed authentication attempts
- Alert on suspicious token usage patterns
- Log device and location changes

Your ParkingMate API now has **enterprise-grade authentication** that provides both security and excellent user experience! 🎉
