# 🔐 Authentication API Documentation

## Base URL
```
Development: http://localhost:8000/api/users
Production: https://api.poolcrest.com/api/users
```

## Authentication Headers
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 📍 Authentication Endpoints

### 1. Register New User
**POST** `/auth/register/`

Create a new user account.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "company_name": "Acme Inc" // Optional
}
```

#### Response (201 Created)
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "is_active": true,
    "is_email_verified": false,
    "date_joined": "2025-08-12T10:00:00Z",
    "profile": {
      "full_name": "John Doe",
      "phone": "+1234567890",
      "role": "customer",
      "status": "active"
    }
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "message": "Registration successful"
}
```

#### Error Response (400 Bad Request)
```json
{
  "email": ["A user with this email already exists."],
  "password": ["This password is too common."],
  "password_confirm": ["Password confirmation does not match."]
}
```

---

### 2. Login
**POST** `/auth/login/`

Authenticate user and receive JWT tokens.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Response (200 OK)
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "is_staff": false
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Error Response (401 Unauthorized)
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### 3. Logout
**POST** `/auth/logout/` 🔒

Logout user and blacklist the refresh token.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Response (200 OK)
```json
{
  "detail": "Successfully logged out"
}
```

---

### 4. Refresh Access Token
**POST** `/auth/refresh/`

Get a new access token using the refresh token.

#### Request Body
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Response (200 OK)
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." // New refresh token if ROTATE_REFRESH_TOKENS is enabled
}
```

---

### 5. Get Current User
**GET** `/auth/me/` 🔒

Get the authenticated user's information.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Response (200 OK)
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "username": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "is_active": true,
  "is_email_verified": false,
  "last_login": "2025-08-12T10:00:00Z",
  "date_joined": "2025-08-01T10:00:00Z",
  "failed_login_attempts": 0,
  "is_account_locked": false,
  "profile": {
    "user_id": "uuid-here",
    "user_email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "customer",
    "status": "active",
    "avatar_url": null,
    "address": "123 Main St, City, ST 12345",
    "company_name": "Acme Inc",
    "timezone": "America/New_York",
    "language_preference": "en",
    "notification_preferences": {
      "email_notifications": true,
      "sms_notifications": false,
      "appointment_reminders": true
    },
    "preferred_contact_method": "email",
    "is_staff_member": false,
    "customer_since": "2025-08-01",
    "created_at": "2025-08-01T10:00:00Z",
    "updated_at": "2025-08-12T10:00:00Z"
  }
}
```

---

### 6. Update Current User
**PATCH** `/auth/me/update/` 🔒

Update the authenticated user's information.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body (all fields optional)
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "newemail@example.com"
}
```

#### Response (200 OK)
```json
{
  // Updated user object (same as GET /auth/me/)
}
```

---

### 7. Change Password
**POST** `/auth/me/change-password/` 🔒

Change the authenticated user's password.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePass456!",
  "new_password_confirm": "NewSecurePass456!"
}
```

#### Response (200 OK)
```json
{
  "message": "Password changed successfully"
}
```

---

### 8. Request Password Reset
**POST** `/auth/password-reset/`

Request a password reset email.

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK)
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

---

### 9. Confirm Password Reset
**POST** `/auth/password-reset/confirm/`

Reset password using the token from email.

#### Request Body
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass789!",
  "new_password_confirm": "NewSecurePass789!"
}
```

#### Response (200 OK)
```json
{
  "message": "Password reset successful"
}
```

---

## 🔑 Token Information

### Token Lifetimes
- **Access Token**: 60 minutes (1 hour)
- **Refresh Token**: 7 days

### Token Structure
JWT tokens contain the following claims:
```json
{
  "token_type": "access",
  "exp": 1692000000,  // Expiration timestamp
  "iat": 1691996400,  // Issued at timestamp
  "jti": "unique-token-id",
  "user_id": "user-uuid",
  "email": "user@example.com",
  "role": "customer",
  "full_name": "John Doe"
}
```

---

## 🚨 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request - validation errors |
| 401 | Unauthorized - invalid credentials or expired token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not found |
| 429 | Too many requests - rate limited |
| 500 | Internal server error |

---

## 🔄 Frontend Integration Example (React)

```javascript
// auth.service.js
const API_BASE = 'http://localhost:8000/api/users';

class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
    
    throw new Error('Login failed');
  }
  
  async register(userData) {
    const response = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    }
    
    const errors = await response.json();
    throw errors;
  }
  
  async getCurrentUser() {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${API_BASE}/auth/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // Token might be expired, try to refresh
    if (response.status === 401) {
      await this.refreshToken();
      return this.getCurrentUser();
    }
    
    throw new Error('Failed to get user');
  }
  
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      return data;
    }
    
    // Refresh failed, redirect to login
    this.logout();
    throw new Error('Session expired');
  }
  
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  
  getAuthHeader() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export default new AuthService();
```

---

## 📝 Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)
- Cannot contain common patterns (e.g., "123", "password")
- Cannot contain user's personal information

---

## 🔒 Security Notes

1. **HTTPS Required**: Always use HTTPS in production
2. **Token Storage**: Store tokens securely (httpOnly cookies preferred over localStorage in production)
3. **CORS**: Configure CORS properly for your frontend domain
4. **Rate Limiting**: Authentication endpoints are rate-limited to prevent brute force
5. **Token Rotation**: Refresh tokens are rotated on use for additional security

---

## 📧 Contact

For API support or questions:
- Email: api@poolcrest.com
- Documentation: https://api.poolcrest.com/docs
