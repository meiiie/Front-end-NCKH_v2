# Backend API Requirements Report - LMS Maritime Admin System

## 📋 Issue Summary

**Date**: October 9, 2025
**Frontend Build**: ✅ Successfully compiled and deployed
**Backend Connection**: ❌ ERR_CONNECTION_REFUSED on port 8090
**Error Details**: `GET http://localhost:8090/api/v1/users?page=1&limit=10 net::ERR_CONNECTION_REFUSED`

## 🎯 Problem Statement

The frontend admin system has been successfully updated to use real backend APIs, but the backend server is not running or not accessible on the expected port (8090). The frontend is attempting to connect to the backend but receiving connection refused errors.

## 🔧 Required Backend APIs

Based on the frontend implementation, the following APIs must be implemented in the Spring Boot backend:

### 1. User Management APIs

#### GET /api/v1/users - List Users with Pagination
```http
GET /api/v1/users?page=1&limit=10&search=optional_search_term
Authorization: Bearer {jwt_token}
```

**Request Parameters:**
- `page` (integer): Page number (1-based)
- `limit` (integer): Items per page
- `search` (string, optional): Search term for filtering users

**Response Format:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "role": "ADMIN|TEACHER|STUDENT",
      "enabled": true,
      "createdAt": "2025-10-09T00:00:00.000Z",
      "updatedAt": "2025-10-09T00:00:00.000Z"
    }
  ],
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "page": 1,
    "limit": 10,
    "first": true,
    "last": false
  }
}
```

#### POST /api/v1/users - Create User
```http
POST /api/v1/users
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "nguyenvana",
  "email": "nguyenvana@student.edu.vn",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "role": "STUDENT"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "generated_id",
    "username": "nguyenvana",
    "email": "nguyenvana@student.edu.vn",
    "fullName": "Nguyễn Văn A",
    "role": "STUDENT",
    "enabled": true,
    "createdAt": "2025-10-09T00:00:00.000Z",
    "updatedAt": "2025-10-09T00:00:00.000Z"
  }
}
```

#### PUT /api/v1/users/{id} - Update User
```http
PUT /api/v1/users/{user_id}
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newemail@student.edu.vn",
  "fullName": "Nguyễn Văn B",
  "role": "TEACHER",
  "enabled": true
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "user_id",
    "username": "nguyenvana",
    "email": "newemail@student.edu.vn",
    "fullName": "Nguyễn Văn B",
    "role": "TEACHER",
    "enabled": true,
    "createdAt": "2025-10-09T00:00:00.000Z",
    "updatedAt": "2025-10-09T00:00:00.000Z"
  }
}
```

#### DELETE /api/v1/users/{id} - Delete User
```http
DELETE /api/v1/users/{user_id}
Authorization: Bearer {jwt_token}
```

**Response Format:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 2. Bulk Import APIs

#### POST /api/v1/users/bulk-import - Bulk Import Users
```http
POST /api/v1/users/bulk-import
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Excel file (.xlsx or .xls)
- `defaultRole`: "STUDENT" | "TEACHER" | "ADMIN"

**Response Format:**
```json
{
  "success": true,
  "message": "Bulk import completed",
  "data": {
    "totalRows": 100,
    "successfulImports": 95,
    "failedImports": 5,
    "errors": [
      "Lỗi ở dòng 10: Email đã tồn tại",
      "Lỗi ở dòng 25: Tên đăng nhập không hợp lệ"
    ],
    "importedUsers": [
      {
        "id": "generated_id",
        "username": "user1",
        "email": "user1@email.com",
        "fullName": "User One",
        "role": "STUDENT",
        "enabled": true,
        "createdAt": "2025-10-09T00:00:00.000Z",
        "updatedAt": "2025-10-09T00:00:00.000Z"
      }
    ]
  }
}
```

#### GET /api/v1/users/bulk-import/template - Get Import Template
```http
GET /api/v1/users/bulk-import/template
Authorization: Bearer {jwt_token}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Import template retrieved",
  "data": "Template Excel đơn giản chỉ cần 4 cột theo thứ tự:\n1. Username (bắt buộc) - Tên đăng nhập\n2. Email (bắt buộc) - Địa chỉ email\n3. Full Name (bắt buộc) - Họ tên đầy đủ\n4. Department (tùy chọn) - Phòng ban/Khoa\n\nVí dụ:\nnguyenvana, nguyenvana@student.edu.vn, Nguyễn Văn A, Khoa CNTT\ntranthib, tranthib@student.edu.vn, Trần Thị B, Khoa CNTT"
}
```

## 📊 Excel Import Format

The bulk import expects Excel files with the following columns (in order):

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| Username | Email | Full Name | Department |
| nguyenvana | nguyenvana@student.edu.vn | Nguyễn Văn A | Khoa CNTT |
| tranthib | tranthib@student.edu.vn | Trần Thị B | Khoa CNTT |

**Validation Rules:**
- Username: Required, alphanumeric + underscore/hyphen, unique
- Email: Required, valid email format, unique
- Full Name: Required, max 100 characters
- Department: Optional
- All users in the file get the same role specified in the `defaultRole` parameter

## 🔐 Authentication & Security

### JWT Token Requirements
- All API endpoints require `Authorization: Bearer {jwt_token}` header
- Token should be validated on each request
- Admin role required for all user management operations

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:4200"); // Angular dev server
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
    department VARCHAR(100),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🚀 Server Configuration

### Application Properties
```properties
# Server Configuration
server.port=8090

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/lms_maritime
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

## 🧪 Testing Checklist

### API Endpoints to Test:
- [ ] GET /api/v1/users (with pagination and search)
- [ ] POST /api/v1/users (create user)
- [ ] PUT /api/v1/users/{id} (update user)
- [ ] DELETE /api/v1/users/{id} (delete user)
- [ ] POST /api/v1/users/bulk-import (bulk import)
- [ ] GET /api/v1/users/bulk-import/template (template)

### Validation Tests:
- [ ] JWT authentication required
- [ ] Admin role authorization
- [ ] Input validation (email format, required fields)
- [ ] Unique constraints (username, email)
- [ ] File upload limits and validation
- [ ] CORS headers

## 📞 Immediate Action Required

1. **Start Backend Server**: Ensure Spring Boot application is running on port 8090
2. **Database Setup**: Create users table with proper schema
3. **Implement APIs**: All listed endpoints must be implemented
4. **CORS Configuration**: Allow requests from `http://localhost:4200`
5. **JWT Integration**: Ensure authentication middleware is working

## 🔍 Error Resolution

The current error `ERR_CONNECTION_REFUSED` indicates:
- Backend server is not running
- Wrong port configuration
- Firewall/network issues

**Quick Check Commands:**
```bash
# Check if port 8090 is in use
netstat -ano | findstr :8090

# Check Java processes
jps -l

# Check Spring Boot logs for startup errors
tail -f logs/spring.log
```

## 📋 Next Steps

1. Backend team implements the required APIs
2. Test individual endpoints with Postman
3. Start frontend and verify connection
4. Test all CRUD operations
5. Test bulk import functionality
6. Performance testing with large datasets

---

**Report Generated**: October 9, 2025
**Frontend Status**: ✅ Ready for backend integration
**Backend Status**: ❌ APIs not implemented/not running
**Priority**: HIGH - Blocking admin functionality