# 📧 **PASSWORD RESET API DOCUMENTATION - LMS HÀNG HẢI**

## 🎯 **Tổng Quan API**

### **Luồng Xử Lý Quên Mật Khẩu**
1. **Frontend gọi API quên mật khẩu** → Backend tạo OTP 6 chữ số
2. **OTP được lưu vào database** với thời hạn 10 phút
3. **Email gửi OTP** đến người dùng (HTML template chuyên nghiệp)
4. **Người dùng nhập OTP + mật khẩu mới** → Backend xác thực và cập nhật

### **Tính Năng Bảo Mật**
- ✅ **OTP 6 chữ số** ngẫu nhiên, bảo mật cao
- ✅ **Thời hạn 10 phút** cho mỗi OTP
- ✅ **Sử dụng 1 lần** - mỗi OTP chỉ dùng được 1 lần
- ✅ **Xác thực email** - OTP phải khớp với email yêu cầu
- ✅ **Rate limiting** - sẵn sàng cho việc giới hạn tốc độ

---

## 📋 **API ENDPOINTS CHI TIẾT**

### **1. POST /api/v1/auth/forgot-password**
**Mục đích:** Yêu cầu gửi OTP về email để đặt lại mật khẩu

#### **Request Body**
```json
{
  "email": "string"
}
```

#### **Validation Rules**
| Field | Type | Required | Rules | Description |
|-------|------|----------|-------|-------------|
| `email` | `string` | ✅ Yes | - Not blank<br>- Valid email format<br>- Must exist in system | Email đã đăng ký của người dùng |

#### **Success Response (200 OK)**
```json
{
  "data": "Mã OTP đã được gửi về email của bạn",
  "pagination": null,
  "message": null
}
```

#### **Error Responses**

**400 Bad Request - User Not Found:**
```json
{
  "statusCode": 400,
  "message": "Không tìm thấy tài khoản với email này",
  "errors": null
}
```

**400 Bad Request - Invalid Email:**
```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  "errors": [
    {
      "field": "email",
      "message": "Email phải đúng định dạng"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Lỗi hệ thống. Vui lòng thử lại sau."
}
```

### **2. POST /api/v1/auth/reset-password**
**Mục đích:** Xác nhận OTP và đặt lại mật khẩu mới

#### **Request Body**
```json
{
  "email": "string",
  "otpCode": "string",
  "newPassword": "string"
}
```

#### **Validation Rules**
| Field | Type | Required | Rules | Description |
|-------|------|----------|-------|-------------|
| `email` | `string` | ✅ Yes | - Not blank<br>- Valid email format<br>- Must match OTP email | Email đã dùng để yêu cầu OTP |
| `otpCode` | `string` | ✅ Yes | - Not blank<br>- Exactly 6 digits<br>- Must be valid and unused | Mã OTP 6 chữ số từ email |
| `newPassword` | `string` | ✅ Yes | - Not blank<br>- Minimum 6 characters | Mật khẩu mới cho tài khoản |

#### **Success Response (200 OK)**
```json
{
  "data": "Mật khẩu đã được đặt lại thành công",
  "pagination": null,
  "message": null
}
```

#### **Error Responses**

**400 Bad Request - Invalid OTP:**
```json
{
  "statusCode": 400,
  "message": "Mã OTP không hợp lệ hoặc đã hết hạn",
  "errors": null
}
```

**400 Bad Request - Email Mismatch:**
```json
{
  "statusCode": 400,
  "message": "Email không khớp với mã OTP",
  "errors": null
}
```

**400 Bad Request - Validation Errors:**
```json
{
  "statusCode": 400,
  "message": "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  "errors": [
    {
      "field": "otpCode",
      "message": "Mã OTP phải là 6 chữ số"
    },
    {
      "field": "newPassword",
      "message": "Mật khẩu mới phải có ít nhất 6 ký tự"
    }
  ]
}
```

---

## 🔧 **FRONTEND INTEGRATION**

### **TypeScript Interfaces**

#### **API Request Types**
```typescript
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}
```

#### **API Response Types**
```typescript
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}
```

### **Service Implementation**
```typescript
export class PasswordResetService {
  private readonly apiUrl = '/api/v1/auth';

  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    const response = await fetch(`${this.apiUrl}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<string>> {
    const response = await fetch(`${this.apiUrl}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new Error(errorData.message);
    }

    return response.json();
  }
}
```

### **React Hook Example**
```typescript
export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await passwordResetService.forgotPassword(email);
      setSuccess(response.data || 'OTP sent successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await passwordResetService.resetPassword(data);
      setSuccess(response.data || 'Password reset successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    forgotPassword,
    resetPassword,
    loading,
    error,
    success,
  };
};
```

### **Form Validation Rules**
```typescript
const emailRules = [
  (v: string) => !!v || 'Email là bắt buộc',
  (v: string) => /.+@.+\..+/.test(v) || 'Email phải đúng định dạng',
];

const otpRules = [
  (v: string) => !!v || 'Mã OTP là bắt buộc',
  (v: string) => /^\d{6}$/.test(v) || 'Mã OTP phải là 6 chữ số',
];

const passwordRules = [
  (v: string) => !!v || 'Mật khẩu mới là bắt buộc',
  (v: string) => v.length >= 6 || 'Mật khẩu phải có ít nhất 6 ký tự',
];
```

---

## 🧪 **TESTING VỚI CURL**

### **Test Forgot Password - Success**
```bash
curl -X POST http://localhost:8088/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected: {"data":"Mã OTP đã được gửi về email của bạn"}
```

### **Test Forgot Password - User Not Found**
```bash
curl -X POST http://localhost:8088/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'

# Expected: {"statusCode":400,"message":"Không tìm thấy tài khoản với email này"}
```

### **Test Reset Password - Success**
```bash
curl -X POST http://localhost:8088/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otpCode":"123456",
    "newPassword":"newpassword123"
  }'

# Expected: {"data":"Mật khẩu đã được đặt lại thành công"}
```

### **Test Reset Password - Invalid OTP**
```bash
curl -X POST http://localhost:8088/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "otpCode":"000000",
    "newPassword":"newpassword123"
  }'

# Expected: {"statusCode":400,"message":"Mã OTP không hợp lệ hoặc đã hết hạn"}
```

---

## 📧 **EMAIL TEMPLATE SPECIFICATION**

### **Thông Tin Email**
- **From:** hungkhp888@gmail.com
- **Subject:** Mã xác nhận đặt lại mật khẩu - LMS Hàng Hải
- **Content-Type:** text/html; charset=UTF-8
- **Language:** Vietnamese
- **OTP Format:** 6-digit numeric code
- **Expiry:** 10 minutes

### **Email Template Features**
- **Professional Design:** Maritime theme với gradient xanh dương
- **Responsive Layout:** Mobile-friendly với media queries
- **SVG Icons:** Custom SVG icons thay vì emoji
- **Typography:** Be Vietnam Pro font cho tiếng Việt
- **Color Scheme:** Xanh dương thống nhất (#2563eb, #1e40af, #3b82f6)
- **Security Sections:** Warning và security notes rõ ràng

### **OTP Display**
- **Color:** Xanh dương đậm (#1e40af)
- **Background:** Gradient xanh dương nhẹ
- **Border:** 3px solid xanh dương (#3b82f6)
- **Font:** 48px, letter-spacing 12px, monospace
- **Shadow:** Xanh dương shadow effect

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### **Bảo Mật**
- OTP hết hạn sau 10 phút
- Mỗi OTP chỉ sử dụng được 1 lần
- Email phải khớp với OTP đã yêu cầu
- Mật khẩu mới tối thiểu 6 ký tự

### **User Experience**
- Email có thể mất 1-2 phút để đến Gmail
- Thông báo rõ ràng về thời hạn 10 phút
- Hướng dẫn bảo mật chi tiết
- Error messages bằng tiếng Việt

### **Error Handling**
- Xử lý network errors gracefully
- Validation errors chi tiết theo field
- Generic messages để tránh email enumeration
- Clear user feedback

### **Production Considerations**
- Sử dụng message queue cho email delivery
- Redis cho OTP storage (performance)
- Logging cho security audit
- Monitoring success rates

---

## 🔄 **USER FLOW IMPLEMENTATION**

### **Step 1: Forgot Password Form**
```typescript
const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const { forgotPassword, loading, error, success } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPassword(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Nhập email của bạn"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
      </button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  );
};
```

### **Step 2: OTP Verification Form**
```typescript
const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    otpCode: '',
    newPassword: '',
  });
  const { resetPassword, loading, error, success } = usePasswordReset();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        placeholder="Email"
        required
      />
      <input
        type="text"
        value={formData.otpCode}
        onChange={handleChange('otpCode')}
        placeholder="Mã OTP (6 chữ số)"
        maxLength={6}
        required
      />
      <input
        type="password"
        value={formData.newPassword}
        onChange={handleChange('newPassword')}
        placeholder="Mật khẩu mới"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  );
};
```

---

## 📞 **HỖ TRỢ**

**API Version:** v1.0
**Base URL:** `http://localhost:8088/api/v1/auth`
**Content-Type:** `application/json`
**Authentication:** None required (public endpoints)

**Team Backend:** Kiểm tra `AuthenticationService.java` và `EmailService.java`
**Team Frontend:** Sử dụng TypeScript interfaces và examples được cung cấp
**Testing:** Sử dụng curl examples để test manual

**Last Updated:** October 2025
**Status:** Ready for frontend integration