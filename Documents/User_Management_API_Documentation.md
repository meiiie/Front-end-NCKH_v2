# 📋 **USER MANAGEMENT API DOCUMENTATION - LMS BACKEND**
*Chi tiết API quản lý người dùng cho Frontend Team*

## 🎯 **Tổng Quan**

### **Chức năng chính:**
- ✅ **Xem danh sách người dùng** với phân trang
- ✅ **Tạo người dùng mới**
- ✅ **Cập nhật thông tin người dùng**
- ✅ **Vô hiệu hóa người dùng**
- ✅ **Import người dùng từ Excel**
- ✅ **Tìm kiếm người dùng**

### **Quyền truy cập:**
- 🔐 **Chỉ Admin** mới có thể sử dụng các API này
- ⚠️ **Cần JWT token** với role `ADMIN`

---

## 📊 **1. LẤY DANH SÁCH NGƯỜI DÙNG**

### **Endpoint:**
```
GET /api/v1/users
```

### **Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | `number` | ❌ No | `1` | Số trang (bắt đầu từ 1) |
| `limit` | `number` | ❌ No | `10` | Số lượng item/trang (max 100) |
| `search` | `string` | ❌ No | - | Tìm kiếm theo username, email, fullName |

### **Request Examples:**

#### **Lấy trang đầu tiên (10 users):**
```bash
GET /api/v1/users?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Tìm kiếm người dùng:**
```bash
GET /api/v1/users?page=1&limit=10&search=nguyen
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Lấy tất cả users (không phân trang - dành cho dropdown):**
```bash
GET /api/v1/users/list/all
Authorization: Bearer YOUR_JWT_TOKEN
```

#### **Lấy users có phân trang (nếu cần):**
```bash
GET /api/v1/users?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### **Response Format:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid-string",
      "username": "nguyenvana",
      "email": "nguyenvana@lms.com",
      "fullName": "Nguyễn Văn A",
      "role": "STUDENT",
      "enabled": true,
      "createdAt": "2025-10-08T10:00:00Z",
      "updatedAt": "2025-10-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "first": true,
    "last": false
  },
  "timestamp": "2025-10-08T10:00:00.123"
}
```

### **Pagination Info:**
- `page`: Trang hiện tại
- `limit`: Số item/trang
- `totalItems`: Tổng số users
- `totalPages`: Tổng số trang
- `first`: Có phải trang đầu không
- `last`: Có phải trang cuối không

---

## ➕ **2. TẠO NGƯỜI DÙNG MỚI**

### **Endpoint:**
```
POST /api/v1/users
```

### **Request Body:**
```json
{
  "username": "nguyenvana",
  "email": "nguyenvana@lms.com",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "role": "STUDENT"
}
```

### **Field Requirements:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `username` | `string` | ✅ Yes | 3-50 chars, unique |
| `email` | `string` | ✅ Yes | Valid email, unique |
| `password` | `string` | ✅ Yes | Min 6 chars |
| `fullName` | `string` | ❌ No | Max 100 chars |
| `role` | `string` | ✅ Yes | `ADMIN`, `TEACHER`, `STUDENT` |

### **Success Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid-string",
    "username": "nguyenvana",
    "email": "nguyenvana@lms.com",
    "fullName": "Nguyễn Văn A",
    "role": "STUDENT",
    "enabled": true,
    "createdAt": "2025-10-08T10:00:00Z",
    "updatedAt": "2025-10-08T10:00:00Z"
  },
  "timestamp": "2025-10-08T10:00:00.123"
}
```

---

## 📝 **3. CẬP NHẬT NGƯỜI DÙNG**

### **Endpoint:**
```
PUT /api/v1/users/{userId}
```

### **Request Body:**
```json
{
  "email": "newemail@lms.com",
  "fullName": "Nguyễn Văn A Updated",
  "role": "TEACHER",
  "enabled": true
}
```

### **Field Requirements:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | `string` | ❌ No | Valid email, unique |
| `fullName` | `string` | ❌ No | Max 100 chars |
| `role` | `string` | ❌ No | `ADMIN`, `TEACHER`, `STUDENT` |
| `enabled` | `boolean` | ❌ No | Account status |

### **Success Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-string",
    "username": "nguyenvana",
    "email": "newemail@lms.com",
    "fullName": "Nguyễn Văn A Updated",
    "role": "TEACHER",
    "enabled": true,
    "createdAt": "2025-10-08T10:00:00Z",
    "updatedAt": "2025-10-08T10:30:00Z"
  },
  "timestamp": "2025-10-08T10:30:00.123"
}
```

---

## ❌ **4. VÔ HIỆU HÓA NGƯỜI DÙNG**

### **Endpoint:**
```
DELETE /api/v1/users/{userId}
```

### **Success Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "timestamp": "2025-10-08T10:30:00.123"
}
```

---

## 📤 **5. IMPORT NGƯỜI DÙNG TỪ EXCEL**

### **5.1 Lấy Template Hướng Dẫn:**

#### **Endpoint:**
```
GET /api/v1/users/bulk-import/template
```

#### **Response:**
```json
{
  "success": true,
  "message": "Import template retrieved",
  "data": "Template Excel đơn giản chỉ cần 4 cột theo thứ tự:\n1. Username (bắt buộc) - Tên đăng nhập\n2. Email (bắt buộc) - Địa chỉ email\n3. Full Name (bắt buộc) - Họ tên đầy đủ\n4. Department (tùy chọn) - Phòng ban/Khoa\n\nVí dụ:\nnguyenvana, nguyenvana@student.edu.vn, Nguyễn Văn A, Khoa CNTT\ntranthib, tranthib@student.edu.vn, Trần Thị B, Khoa CNTT\n\nLưu ý: Tất cả người dùng sẽ được gán vai trò đã chọn trong form import.",
  "timestamp": "2025-10-08T10:30:00.123"
}
```

### **5.2 Upload File Excel:**

#### **Endpoint:**
```
POST /api/v1/users/bulk-import
Content-Type: multipart/form-data
```

#### **Form Data:**
- `file`: File Excel (.xlsx hoặc .xls)
- `defaultRole`: `STUDENT` | `TEACHER` | `ADMIN` (default: `STUDENT`)

#### **Request Example (curl):**
```bash
curl -X POST "http://localhost:8090/api/v1/users/bulk-import" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@users.xlsx" \
  -F "defaultRole=STUDENT"
```

#### **Success Response:**
```json
{
  "success": true,
  "message": "Bulk import completed",
  "data": {
    "totalRows": 5,
    "successfulImports": 4,
    "failedImports": 1,
    "errors": [
      "Lỗi ở dòng 3: Email đã tồn tại: duplicate@email.com"
    ],
    "importedUsers": [
      {
        "id": "uuid-string",
        "username": "nguyenvana",
        "email": "nguyenvana@lms.com",
        "fullName": "Nguyễn Văn A",
        "role": "STUDENT",
        "enabled": true,
        "createdAt": "2025-10-08T10:30:00Z",
        "updatedAt": "2025-10-08T10:30:00Z"
      }
    ]
  },
  "timestamp": "2025-10-08T10:30:00.123"
}
```

### **5.3 Excel Format Requirements:**

#### **Cấu trúc file Excel:**
| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| Username | Email | Full Name | Department |
| nguyenvana | nguyenvana@lms.com | Nguyễn Văn A | Khoa CNTT |
| tranthib | tranthib@lms.com | Trần Thị B | Khoa Toán |

#### **Quy tắc validation:**
- ✅ **Username**: Bắt buộc, unique, chỉ chứa a-z, 0-9, _, -
- ✅ **Email**: Bắt buộc, valid format, unique
- ✅ **Full Name**: Bắt buộc, max 100 ký tự
- ✅ **Department**: Tùy chọn
- ✅ **Password**: Tự động tạo `123456` (khuyên user đổi)

---

## 🔍 **6. LẤY CHI TIẾT NGƯỜI DÙNG**

### **Endpoint:**
```
GET /api/v1/users/{userId}
```

### **Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "username": "nguyenvana",
    "email": "nguyenvana@lms.com",
    "fullName": "Nguyễn Văn A",
    "role": "STUDENT",
    "enabled": true,
    "createdAt": "2025-10-08T10:00:00Z",
    "updatedAt": "2025-10-08T10:30:00Z"
  },
  "timestamp": "2025-10-08T10:30:00.123"
}
```

---

## ⚠️ **7. XỬ LÝ LỖI**

### **7.1 Authentication Errors:**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập tính năng này.",
  "timestamp": "2025-10-08T10:30:00.123"
}
```

### **7.2 Validation Errors:**
```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  "timestamp": "2025-10-08T10:30:00.123"
}
```

### **7.3 Business Logic Errors:**
```json
{
  "success": false,
  "message": "Username đã tồn tại",
  "timestamp": "2025-10-08T10:30:00.123"
}
```

---

## 🔧 **8. FRONTEND IMPLEMENTATION GUIDE**

### **8.1 TypeScript Interfaces:**

```typescript
// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationInfo;
  timestamp: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// User Types
export interface UserSummary {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserDetail extends UserSummary {}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT';
  enabled?: boolean;
}

export interface BulkImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importedUsers: UserSummary[];
}
```

### **8.2 Angular Service Implementation:**

```typescript
@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = '/api/v1/users';

  constructor(private http: HttpClient) {}

  // Get users with pagination
  getUsers(page: number = 1, limit: number = 10, search?: string): Observable<ApiResponse<UserSummary[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<UserSummary[]>>(this.apiUrl, { params });
  }

  // Get all users (no pagination - for dropdowns, etc.)
  getAllUsers(): Observable<ApiResponse<UserSummary[]>> {
    return this.http.get<ApiResponse<UserSummary[]>>(`${this.apiUrl}/list/all`);
  }

  // Create user
  createUser(user: CreateUserRequest): Observable<ApiResponse<UserDetail>> {
    return this.http.post<ApiResponse<UserDetail>>(this.apiUrl, user);
  }

  // Update user
  updateUser(userId: string, user: UpdateUserRequest): Observable<ApiResponse<UserDetail>> {
    return this.http.put<ApiResponse<UserDetail>>(`${this.apiUrl}/${userId}`, user);
  }

  // Delete user
  deleteUser(userId: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${userId}`);
  }

  // Bulk import
  bulkImportUsers(file: File, defaultRole: string = 'STUDENT'): Observable<ApiResponse<BulkImportResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('defaultRole', defaultRole);

    return this.http.post<ApiResponse<BulkImportResult>>(`${this.apiUrl}/bulk-import`, formData);
  }

  // Get import template
  getImportTemplate(): Observable<ApiResponse<string>> {
    return this.http.get<ApiResponse<string>>(`${this.apiUrl}/bulk-import/template`);
  }

  // Get user detail
  getUserDetail(userId: string): Observable<ApiResponse<UserDetail>> {
    return this.http.get<ApiResponse<UserDetail>>(`${this.apiUrl}/${userId}`);
  }
}
```

### **8.3 Usage Examples:**

```typescript
// Load users with pagination
loadUsers(page: number = 1, limit: number = 10) {
  this.userService.getUsers(page, limit, this.searchTerm).subscribe({
    next: (response) => {
      if (response.success && response.data) {
        this.users = response.data;
        this.pagination = response.pagination;
      }
    },
    error: (error) => {
      console.error('Error loading users:', error);
    }
  });
}

// Load ALL users (recommended for dropdowns, small datasets)
loadAllUsers() {
  this.userService.getAllUsers().subscribe({
    next: (response) => {
      if (response.success && response.data) {
        this.allUsers = response.data;
      }
    }
  });
}

// Alternative: Load users with high limit (not recommended for large datasets)
loadAllUsersAlternative() {
  this.userService.getUsers(1, 1000).subscribe({
    next: (response) => {
      if (response.success && response.data) {
        this.allUsers = response.data;
      }
    }
  });
}

// Bulk import
onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.userService.bulkImportUsers(file, 'STUDENT').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('Import successful:', response.data);
          this.loadUsers(); // Refresh list
        }
      }
    });
  }
}
```

---

## 📋 **9. TESTING CHECKLIST**

### **✅ API Endpoints:**
- [ ] `GET /api/v1/users` - List users with pagination
- [ ] `GET /api/v1/users/list/all` - List all users (no pagination)
- [ ] `POST /api/v1/users` - Create user
- [ ] `GET /api/v1/users/{id}` - Get user detail
- [ ] `PUT /api/v1/users/{id}` - Update user
- [ ] `DELETE /api/v1/users/{id}` - Delete user
- [ ] `POST /api/v1/users/bulk-import` - Bulk import
- [ ] `GET /api/v1/users/bulk-import/template` - Get template

### **✅ Pagination:**
- [ ] Default limit = 10 users per page
- [ ] Can set custom limit (max 100)
- [ ] Search functionality works
- [ ] Pagination info correct

### **✅ Validation:**
- [ ] Username uniqueness
- [ ] Email format and uniqueness
- [ ] Required fields validation
- [ ] Role validation

### **✅ Security:**
- [ ] JWT authentication required
- [ ] Admin role required
- [ ] CORS working

### **✅ Bulk Import:**
- [ ] Excel file upload
- [ ] Validation and error reporting
- [ ] Success/failure counts
- [ ] Template guidance

---

## 🚀 **10. PERFORMANCE NOTES**

### **Pagination Best Practices:**
- **Default limit**: 10 users (good for UX)
- **Max limit**: 100 users (prevent performance issues)
- **Search**: Server-side search for large datasets
- **Sorting**: Can add sort parameters if needed

### **Frontend Optimization:**
- **Lazy loading**: Load users on demand
- **Caching**: Cache user data locally
- **Debounce**: Debounce search input
- **Virtual scrolling**: For large user lists

---

## 📞 **SUPPORT**

**Backend Team**: API implementation complete and tested
**Frontend Team**: Use this documentation for integration
**Testing**: All endpoints verified with curl commands

**Version**: 1.0.0
**Last Updated**: October 2025
**Status**: ✅ Ready for Frontend Integration