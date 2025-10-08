# 📚 **LMS BACKEND API DOCUMENTATION**
## **Chi Tiết API Backend Cho Frontend Team**

---

## 🎯 **Tổng Quan Dự Án**

### **Thông Tin Dự Án**
- **Tên dự án**: LMS Hàng Hải (Learning Management System)
- **Backend**: Spring Boot 3.5.6 + PostgreSQL
- **Frontend**: Angular (đang phát triển)
- **Phiên bản API**: v1.0
- **Base URL**: `http://localhost:8088/api/v1`

### **Kiến Trúc Chính**
```
Frontend (Angular) ↔️ REST API ↔️ Backend (Spring Boot) ↔️ PostgreSQL
                                      ↕️
                                 Vercel Blob (File Storage)
```

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

### **1. Đăng Ký (Register)**
```typescript
POST /api/v1/auth/register
Content-Type: application/json

interface RegisterRequest {
  username: string;    // required, 3-50 chars
  email: string;       // required, valid email
  password: string;    // required, min 6 chars
  fullName: string;    // required, max 100 chars
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT'; // optional, default STUDENT
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      email: string;
      fullName: string;
      role: string;
      enabled: boolean;
    };
  };
  timestamp: string;
}
```

### **2. Đăng Nhập (Login)**
```typescript
POST /api/v1/auth/login
Content-Type: application/json

interface LoginRequest {
  username: string; // username or email
  password: string;
}

// Response: AuthResponse (same as register)
```

### **3. Refresh Token**
```typescript
POST /api/v1/auth/refresh
Content-Type: application/json

interface RefreshRequest {
  refreshToken: string;
}

// Response: AuthResponse
```

### **4. Thông Tin Người Dùng Hiện Tại**
```typescript
GET /api/v1/auth/me
Authorization: Bearer {accessToken}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
}
```

### **5. Cập Nhật Profile**
```typescript
PUT /api/v1/auth/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

interface UpdateProfileRequest {
  fullName?: string; // max 100 chars
  email?: string;    // valid email format
}
```

### **6. Đổi Mật Khẩu**
```typescript
PUT /api/v1/auth/password
Authorization: Bearer {accessToken}
Content-Type: application/json

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // min 6 chars
}
```

---

## 🔑 **PASSWORD RESET (QUÊN MẬT KHẨU)**

### **1. Gửi OTP**
```typescript
POST /api/v1/auth/forgot-password
Content-Type: application/json

interface ForgotPasswordRequest {
  email: string; // required, valid email, must exist in system
}

interface ApiResponse {
  success: boolean;
  message: string; // "Mã OTP đã được gửi về email của bạn"
  timestamp: string;
}
```

### **2. Đặt Lại Mật Khẩu Với OTP**
```typescript
POST /api/v1/auth/reset-password
Content-Type: application/json

interface ResetPasswordRequest {
  email: string;     // required, valid email
  otpCode: string;   // required, exactly 6 digits
  newPassword: string; // required, min 6 chars
}

// Response: ApiResponse with "Mật khẩu đã được đặt lại thành công"
```

### **OTP Specifications**
- **Độ dài**: 6 chữ số
- **Thời hạn**: 10 phút
- **Sử dụng**: Chỉ dùng 1 lần
- **Bảo mật**: Liên kết với email cụ thể

---

## 👥 **USER MANAGEMENT (QUẢN LÝ NGƯỜI DÙNG)**

### **1. Lấy Danh Sách Người Dùng (Admin Only)**
```typescript
GET /api/v1/users?page=1&limit=10&search=keyword
Authorization: Bearer {adminToken}

interface PaginatedUsersResponse {
  success: boolean;
  data: UserSummary[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  timestamp: string;
}

interface UserSummary {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string; // 'ADMIN' | 'TEACHER' | 'STUDENT'
  enabled: boolean;
  createdAt: string; // ISO date
}
```

### **2. Tạo Người Dùng Mới (Admin Only)**
```typescript
POST /api/v1/users
Authorization: Bearer {adminToken}
Content-Type: application/json

interface CreateUserRequest {
  username: string;   // required, 3-50 chars
  email: string;      // required, valid email
  password: string;   // required, min 6 chars
  fullName: string;   // required, max 100 chars
  role: string;       // required, 'ADMIN' | 'TEACHER' | 'STUDENT'
}

interface UserDetail {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
}
```

### **3. Cập Nhật Người Dùng (Admin Only)**
```typescript
PUT /api/v1/users/{userId}
Authorization: Bearer {adminToken}
Content-Type: application/json

interface UpdateUserRequest {
  email?: string;     // valid email
  fullName?: string;  // max 100 chars
  role?: string;      // 'ADMIN' | 'TEACHER' | 'STUDENT'
  enabled?: boolean;
}
```

### **4. Xóa Người Dùng (Admin Only)**
```typescript
DELETE /api/v1/users/{userId}
Authorization: Bearer {adminToken}

// Response: success message
```

---

## 📊 **BULK USER IMPORT (IMPORT NGƯỜI DÙNG TỪ EXCEL)**

### **1. Upload File Excel**
```typescript
POST /api/v1/users/bulk-import
Authorization: Bearer {adminToken}
Content-Type: multipart/form-data

FormData:
- file: File (Excel .xlsx or .xls, max 10MB)
- defaultRole: string ('STUDENT' | 'TEACHER' | 'ADMIN')

interface BulkImportResponse {
  success: boolean;
  data: BulkImportResult;
  message: string;
  timestamp: string;
}

interface BulkImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[]; // detailed error messages
  importedUsers: UserDetail[];
}
```

### **2. Lấy Template Hướng Dẫn**
```typescript
GET /api/v1/users/bulk-import/template
Authorization: Bearer {adminToken}

interface TemplateResponse {
  success: boolean;
  data: string; // template instructions
  message: string;
  timestamp: string;
}
```

### **Excel File Format**
| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| Username | Email | Full Name | Department |
| nguyenvana | nguyenvana@student.edu.vn | Nguyễn Văn A | Khoa CNTT |
| tranthib | tranthib@student.edu.vn | Trần Thị B | Khoa Toán |

**Lưu ý:**
- Cột A, B, C: bắt buộc
- Cột D: tùy chọn
- Tất cả người dùng sẽ được gán role từ `defaultRole`
- Mật khẩu mặc định: `123456` (khuyến khích đổi)

---

## 📁 **FILE UPLOAD (UPLOAD TỆP)**

### **1. Upload File (Server-side)**
```typescript
POST /api/v1/files/upload
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

FormData:
- file: File
- type: string ('avatar' | 'course' | 'assignment' | 'document' | 'video' | 'audio')

interface FileUploadResponse {
  success: boolean;
  data: {
    fileName: string;
    originalFileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
  };
  timestamp: string;
}
```

### **2. Tạo Signed URL (Client-side Upload)**
```typescript
POST /api/v1/files/generate-upload-url
Authorization: Bearer {accessToken}
Content-Type: application/json

interface GenerateSignedUrlRequest {
  fileName: string;
  fileSize: number;
  type: string;
}

interface SignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    fileUrl: string;
    fileName: string;
    expiresAt: string;
  };
  timestamp: string;
}
```

### **3. Validate Upload**
```typescript
POST /api/v1/files/validate-upload
Authorization: Bearer {accessToken}
Content-Type: application/json

interface ValidateUploadRequest {
  fileUrl: string;
}
```

### **4. Xóa File**
```typescript
DELETE /api/v1/files/delete
Authorization: Bearer {accessToken}
Content-Type: application/json

interface DeleteFileRequest {
  fileUrl: string;
}
```

---

## 🏗️ **COURSE MANAGEMENT (QUẢN LÝ KHÓA HỌC)**

*TBD - Đang phát triển*

---

## 📝 **ASSIGNMENT MANAGEMENT (QUẢN LÝ BÀI TẬP)**

*TBD - Đang phát triển*

---

## 📊 **DATA TYPES & INTERFACES**

### **Common Response Format**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
```

### **Error Response Format**
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  // For validation errors:
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

### **User Roles**
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}
```

### **File Types**
```typescript
enum FileType {
  AVATAR = 'avatar',
  COURSE = 'course',
  ASSIGNMENT = 'assignment',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  GENERAL = 'general'
}
```

---

## 🔒 **SECURITY & AUTHORIZATION**

### **JWT Token Structure**
```typescript
interface JWTPayload {
  sub: string;        // user ID
  username: string;
  email: string;
  role: string;
  iat: number;        // issued at
  exp: number;        // expires at
}
```

### **Role-based Access Control**
- **ADMIN**: Full access to all endpoints
- **TEACHER**: Access to course/assignment management
- **STUDENT**: Access to enrolled courses and assignments

### **Protected Endpoints**
- Sử dụng `Authorization: Bearer {accessToken}` header
- Token expires sau 24 giờ
- Sử dụng refresh token để lấy access token mới

---

## ⚠️ **ERROR HANDLING**

### **HTTP Status Codes**
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

### **Common Error Messages**
```typescript
// Authentication Errors
"Thông tin đăng nhập không chính xác"
"Token không hợp lệ"
"Token đã hết hạn"

// Validation Errors
"Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
"Email đã tồn tại"
"Tên đăng nhập đã tồn tại"

// Permission Errors
"Access denied"
"Admin privileges required"

// File Upload Errors
"Kích thước file vượt quá giới hạn cho phép"
"Loại file không được hỗ trợ"
```

---

## 🧪 **TESTING EXAMPLES**

### **Authentication Flow**
```bash
# 1. Register
curl -X POST http://localhost:8088/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# 2. Login
curl -X POST http://localhost:8088/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# 3. Get current user
curl -X GET http://localhost:8088/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **Password Reset Flow**
```bash
# 1. Request OTP
curl -X POST http://localhost:8088/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Reset password with OTP
curl -X POST http://localhost:8088/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otpCode": "123456",
    "newPassword": "newpassword123"
  }'
```

### **Bulk Import Test**
```bash
# Upload Excel file
curl -X POST http://localhost:8088/api/v1/users/bulk-import \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@test_users.xlsx" \
  -F "defaultRole=STUDENT"
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Frontend Integration Tasks**
- [ ] Implement authentication service
- [ ] Create login/register forms
- [ ] Add JWT token management
- [ ] Implement password reset flow
- [ ] Create user management UI (admin)
- [ ] Implement bulk import UI
- [ ] Add file upload components
- [ ] Handle API errors gracefully
- [ ] Add loading states and progress indicators
- [ ] Implement role-based UI rendering

### **API Testing Checklist**
- [ ] All authentication endpoints working
- [ ] Password reset flow tested
- [ ] Bulk import with valid Excel file
- [ ] File upload to Vercel Blob
- [ ] Error handling for all edge cases
- [ ] Role-based access control verified

---

## 📞 **SUPPORT & CONTACT**

### **Backend Team**
- **Tech Stack**: Spring Boot, PostgreSQL, JWT, Vercel Blob
- **API Documentation**: Swagger UI at `/swagger-ui`
- **Database**: PostgreSQL with Flyway migrations

### **Frontend Team Integration Notes**
- Tất cả API responses đều có format thống nhất
- Sử dụng `success` field để check kết quả
- Handle cả `data` và error cases properly
- JWT tokens cần được refresh tự động
- File uploads sử dụng Vercel Blob cho scalability

### **Version History**
- **v1.0**: Authentication, User Management, Bulk Import, File Upload
- **Next**: Course Management, Assignments, Progress Tracking

---

**API Base URL**: `http://localhost:8088/api/v1`
**Swagger UI**: `http://localhost:8088/swagger-ui`
**Last Updated**: October 2025