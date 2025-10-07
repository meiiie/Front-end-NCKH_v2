# 📧 **PASSWORD RESET API SPECIFICATION - LMS BACKEND**

## 🎯 **API Overview**

### **Password Reset Flow**
1. **Forgot Password**: User requests OTP via email
2. **Email Delivery**: OTP sent to user's email (6-digit code, 10-minute expiry)
3. **OTP Verification**: User enters OTP + new password
4. **Password Update**: Password reset and OTP marked as used

### **Security Features**
- ✅ **OTP Generation**: 6-digit random secure codes
- ✅ **Expiry Protection**: 10-minute validity window
- ✅ **Single Use**: Each OTP can only be used once
- ✅ **Email Verification**: OTP must match the requesting email
- ✅ **Rate Limiting Ready**: Prepared for rate limiting implementation

---

## 📧 **FORGOT PASSWORD API**

### **Endpoint Details**
- **URL**: `POST /api/v1/auth/forgot-password`
- **Content-Type**: `application/json`
- **Authentication**: None required (public endpoint)
- **CORS**: Enabled for all origins

### **Request Format**
```json
{
  "email": "string"
}
```

### **Field Specifications**

| Field | Type | Required | Validation Rules | Description |
|-------|------|----------|------------------|-------------|
| `email` | `string` | ✅ Yes | - Not blank<br>- Valid email format<br>- Must exist in system | User's registered email address |

### **Success Response (200 OK)**
```json
{
  "data": "Mã OTP đã được gửi về email của bạn",
  "pagination": null,
  "message": null
}
```

### **Error Responses**

#### **User Not Found (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Không tìm thấy tài khoản với email này",
  "errors": null
}
```

#### **Invalid Email Format (400 Bad Request)**
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

#### **Server Error (500 Internal Server Error)**
```json
{
  "statusCode": 500,
  "message": "Lỗi hệ thống. Vui lòng thử lại sau."
}
```

---

## 🔐 **RESET PASSWORD API**

### **Endpoint Details**
- **URL**: `POST /api/v1/auth/reset-password`
- **Content-Type**: `application/json`
- **Authentication**: None required (public endpoint)
- **CORS**: Enabled for all origins

### **Request Format**
```json
{
  "email": "string",
  "otpCode": "string",
  "newPassword": "string"
}
```

### **Field Specifications**

| Field | Type | Required | Validation Rules | Description |
|-------|------|----------|------------------|-------------|
| `email` | `string` | ✅ Yes | - Not blank<br>- Valid email format<br>- Must match OTP email | User's registered email address |
| `otpCode` | `string` | ✅ Yes | - Not blank<br>- Exactly 6 digits<br>- Must be valid and unused | 6-digit OTP from email |
| `newPassword` | `string` | ✅ Yes | - Not blank<br>- Minimum 6 characters | New password for the account |

### **Success Response (200 OK)**
```json
{
  "data": "Mật khẩu đã được đặt lại thành công",
  "pagination": null,
  "message": null
}
```

### **Error Responses**

#### **Invalid OTP (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Mã OTP không hợp lệ hoặc đã hết hạn",
  "errors": null
}
```

#### **Email Mismatch (400 Bad Request)**
```json
{
  "statusCode": 400,
  "message": "Email không khớp với mã OTP",
  "errors": null
}
```

#### **Validation Errors (400 Bad Request)**
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

## 📧 **EMAIL TEMPLATE**

### **OTP Email Content**
```
Subject: Mã xác nhận đặt lại mật khẩu - LMS Hàng Hải

Xin chào [User's Full Name],

Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản LMS Hàng Hải.

Mã xác nhận của bạn là: [6-DIGIT-OTP-CODE]

Mã này sẽ hết hạn sau 10 phút.

Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.

Trân trọng,
Đội ngũ LMS Hàng Hải
```

### **Email Specifications**
- **Sender**: `hungkhp888@gmail.com`
- **Subject**: `Mã xác nhận đặt lại mật khẩu - LMS Hàng Hải`
- **Content-Type**: `text/plain; charset=UTF-8`
- **Language**: Vietnamese
- **OTP Format**: 6-digit numeric code

---

## 🔧 **FRONTEND IMPLEMENTATION**

### **TypeScript Interfaces**
```typescript
// API Request Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

// API Response Types
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

// Error Response Types
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
// Password Reset Service
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
// Custom Hook for Password Reset
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
// Forgot Password Form Validation
const emailRules = [
  (v: string) => !!v || 'Email là bắt buộc',
  (v: string) => /.+@.+\..+/.test(v) || 'Email phải đúng định dạng',
];

// Reset Password Form Validation
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

## 🧪 **TESTING EXAMPLES**

### **Forgot Password - Success**
```bash
curl -X POST http://localhost:8088/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected: {"data":"Mã OTP đã được gửi về email của bạn"}
```

### **Forgot Password - User Not Found**
```bash
curl -X POST http://localhost:8088/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'

# Expected: {"statusCode":400,"message":"Không tìm thấy tài khoản với email này"}
```

### **Reset Password - Success**
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

### **Reset Password - Invalid OTP**
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

## ⚠️ **IMPORTANT NOTES**

### **Security Considerations**
- **OTP Expiry**: Codes expire after 10 minutes
- **Single Use**: Each OTP can only be used once
- **Rate Limiting**: Consider implementing rate limiting (not currently active)
- **Password Requirements**: Minimum 6 characters (same as registration)

### **User Experience**
- **Email Delivery**: May take 1-2 minutes for Gmail
- **OTP Validity**: Clearly communicate 10-minute expiry
- **Case Sensitivity**: OTP codes are case-sensitive
- **Resend Option**: Consider implementing OTP resend functionality

### **Error Handling**
- **Network Errors**: Handle connection failures gracefully
- **Invalid OTP**: Clear error messages for expired/invalid codes
- **Email Not Found**: Generic message to prevent email enumeration
- **Validation Errors**: Show specific field-level errors

### **Production Considerations**
- **Email Queue**: Use message queue for email delivery in production
- **OTP Storage**: Consider Redis for better performance
- **Logging**: Log password reset attempts for security audit
- **Monitoring**: Monitor OTP delivery success rates

---

## 📞 **SUPPORT**

For questions about this API specification:
- **Backend Team**: Check `AuthenticationService.java` and `EmailService.java`
- **Frontend Team**: Use the provided TypeScript interfaces and examples
- **Testing**: Use the curl examples above for manual testing

**API Version**: v1.0
**Last Updated**: October 2025
**Status**: Ready for frontend integration