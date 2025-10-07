 # 📋 **REGISTER API SPECIFICATION - LMS BACKEND**

## 🎯 **API Endpoint Overview**

### **Endpoint Details**
- **URL**: `POST /api/v1/auth/register`
- **Content-Type**: `application/json`
- **Authentication**: None required (public endpoint)
- **CORS**: Enabled for all origins

---

## 📝 **Request Format**

### **Request Body Structure**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "role": "STUDENT|TEACHER|ADMIN"
}
```

### **Field Specifications**

| Field | Type | Required | Validation Rules | Description |
|-------|------|----------|------------------|-------------|
| `username` | `string` | ✅ Yes | - Not blank<br>- Max 50 characters<br>- Unique in system | User's login username |
| `email` | `string` | ✅ Yes | - Not blank<br>- Valid email format<br>- Max 100 characters<br>- Unique in system | User's email address |
| `password` | `string` | ✅ Yes | - Not blank<br>- Minimum 6 characters | User's password (will be hashed) |
| `fullName` | `string` | ✅ Yes | - Not blank<br>- Max 100 characters | User's full display name |
| `role` | `string` | ❌ No | - Must be: `STUDENT`, `TEACHER`, or `ADMIN`<br>- Default: `STUDENT` | User's role in system |

---

## ✅ **Success Response (201 Created)**

### **Response Format**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9...",
  "user": {
    "id": "uuid-string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "STUDENT",
    "enabled": true
  }
}
```

### **Response Field Details**

| Field | Type | Description |
|-------|------|-------------|
| `accessToken` | `string` | JWT access token (24 hours expiry) |
| `refreshToken` | `string` | JWT refresh token (7 days expiry) |
| `user.id` | `string` | UUID of created user |
| `user.username` | `string` | User's username |
| `user.email` | `string` | User's email |
| `user.fullName` | `string` | User's full name |
| `user.role` | `string` | User's role (STUDENT/TEACHER/ADMIN) |
| `user.enabled` | `boolean` | Account status (always true for new users) |

---

## ❌ **Error Responses**

### **Validation Error (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  "errors": [
    {
      "field": "username",
      "message": "Tên đăng nhập không được để trống"
    },
    {
      "field": "email",
      "message": "Email phải đúng định dạng"
    }
  ]
}
```

### **Common Validation Errors**

| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| `username` | Empty/blank | `"Tên đăng nhập không được để trống"` |
| `username` | Too long (>50 chars) | `"Tên đăng nhập không được vượt quá 50 ký tự"` |
| `username` | Already exists | `"Username đã tồn tại"` |
| `email` | Empty/blank | `"Email không được để trống"` |
| `email` | Invalid format | `"Email phải đúng định dạng"` |
| `email` | Too long (>100 chars) | `"Email không được vượt quá 100 ký tự"` |
| `email` | Already exists | `"Email đã tồn tại"` |
| `password` | Empty/blank | `"Mật khẩu không được để trống"` |
| `password` | Too short (<6 chars) | `"Mật khẩu phải có ít nhất 6 ký tự"` |
| `fullName` | Empty/blank | `"Họ tên không được để trống"` |
| `fullName` | Too long (>100 chars) | `"Họ tên không được vượt quá 100 ký tự"` |
| `role` | Invalid value | `"Vai trò không hợp lệ"` |

### **Server Error (500 Internal Server Error)**
```json
{
  "message": "Lỗi hệ thống. Vui lòng thử lại sau."
}
```

---

## 🔧 **Frontend Implementation Requirements**

### **TypeScript Interface**
```typescript
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  enabled: boolean;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}
```

### **Frontend Validation Rules**
```typescript
// Client-side validation (recommended)
const usernameRules = [
  (v: string) => !!v || 'Tên đăng nhập là bắt buộc',
  (v: string) => v.length <= 50 || 'Tên đăng nhập không được vượt quá 50 ký tự'
];

const emailRules = [
  (v: string) => !!v || 'Email là bắt buộc',
  (v: string) => /.+@.+\..+/.test(v) || 'Email phải đúng định dạng',
  (v: string) => v.length <= 100 || 'Email không được vượt quá 100 ký tự'
];

const passwordRules = [
  (v: string) => !!v || 'Mật khẩu là bắt buộc',
  (v: string) => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự'
];

const fullNameRules = [
  (v: string) => !!v || 'Họ tên là bắt buộc',
  (v: string) => v.length <= 100 || 'Họ tên không được vượt quá 100 ký tự'
];
```

### **API Call Example**
```typescript
// Angular Service
register(userData: RegisterRequest): Observable<RegisterResponse> {
  return this.http.post<RegisterResponse>(
    `${this.apiUrl}/auth/register`,
    userData,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// React Hook
const registerUser = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};
```

---

## 🧪 **Testing Examples**

### **Valid Registration**
```bash
curl -X POST http://localhost:8088/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "fullName": "Test User",
    "role": "STUDENT"
  }'
```

### **Invalid Data Test**
```bash
curl -X POST http://localhost:8088/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "",
    "email": "invalid-email",
    "password": "123",
    "fullName": ""
  }'
```

### **Duplicate Username Test**
```bash
curl -X POST http://localhost:8088/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "new@example.com",
    "password": "TestPass123",
    "fullName": "New User"
  }'
```

---

## ⚠️ **Important Notes**

### **Security Considerations**
- Passwords are hashed using BCrypt before storage
- JWT tokens are generated immediately upon successful registration
- User accounts are enabled by default

### **Business Rules**
- Username and email must be unique across the system
- Role defaults to STUDENT if not specified
- All users start with enabled status

### **Error Handling**
- Frontend should handle both field-level and general errors
- Display specific validation messages to users
- Handle network errors gracefully

### **Rate Limiting**
- Consider implementing rate limiting for registration endpoint
- Frontend should prevent rapid successive registration attempts

---

## 📞 **Support**

For questions about this API specification:
- **Backend Team**: Check validation logic in `AuthenticationService.java`
- **Frontend Team**: Use the provided TypeScript interfaces
- **Testing**: Use the curl examples above for manual testing

**API Version**: v1.0
**Last Updated**: October 2025
**Status**: Ready for frontend integration