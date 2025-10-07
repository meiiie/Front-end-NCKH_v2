import { Component, signal, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../../../api/types/auth.types';

// Step types for the multi-step flow
type ForgotPasswordStep = 'email' | 'otp' | 'reset';

// Typed form interfaces
type EmailForm = {
  email: FormControl<string>;
};

type OtpForm = {
  otp: FormControl<string>;
};

type ResetPasswordForm = {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
};

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <style>
      /* Floating Label Styles */
      .input-wrapper { position: relative; }
      .input-field {
        transition: all 0.2s ease;
        background: #ffffff;
      }
      .input-field:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }
      .input-label {
        position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
        background: white; padding: 2px 10px; color: #6B7280; font-size: 15px;
        pointer-events: none; transition: all 0.2s ease; border-radius: 12px;
      }
      .input-field:focus ~ .input-label,
      .input-field:not(:placeholder-shown) ~ .input-label {
        top: 0; transform: translateY(-50%); font-size: 12px; color: #8b5cf6;
        font-weight: 600; background: #F3F4F6; padding: 3px 12px; border-radius: 16px;
        box-shadow: 0 0 0 1px #D1D5DB; opacity: 1; visibility: visible;
      }
      .input-field:placeholder-shown ~ .input-label {
        opacity: 0; visibility: hidden;
      }

      /* Step Indicator */
      .step-indicator {
        display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 32px;
      }
      .step-circle {
        width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-weight: 600; font-size: 14px; transition: all 0.3s ease;
      }
      .step-active { background: #8b5cf6; color: white; }
      .step-completed { background: #10b981; color: white; }
      .step-inactive { background: #e5e7eb; color: #6b7280; }
      .step-line { width: 32px; height: 2px; background: #e5e7eb; transition: all 0.3s ease; }

      /* OTP Input */
      .otp-input {
        width: 48px; height: 48px; text-align: center; font-size: 20px; font-weight: 600;
        border: 2px solid #e5e7eb; border-radius: 12px; transition: all 0.2s ease;
      }
      .otp-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); outline: none; }
      .otp-input.filled { border-color: #10b981; background: #f0fdf4; }

      /* Button Styles */
      .btn-primary {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        transition: all 0.3s ease; position: relative; overflow: hidden;
      }
      .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        transform: translateY(-2px); box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
      }
      .btn-primary:active:not(:disabled) { transform: translateY(0); }

      /* Success Animation */
      @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .success-pulse { animation: successPulse 2s ease-in-out infinite; }
    </style>

    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
      <!-- Split Layout -->
      <div class="flex min-h-screen">
        <!-- Left Side - Hero (Purple Theme) -->
        <div class="hidden lg:flex lg:w-[38%] bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800 relative overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-[0.05]">
            <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="security-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="2" fill="white"/>
                  <circle cx="10" cy="10" r="8" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#security-pattern)"/>
            </svg>
          </div>

          <!-- Content -->
          <div class="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
            <div class="text-center max-w-sm">
              <!-- Icon -->
              <div class="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                <svg class="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>

              <!-- Title -->
              <h2 class="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Bảo mật tài khoản
              </h2>

              <!-- Description -->
              <p class="text-lg text-purple-100 leading-relaxed mb-8">
                Quy trình khôi phục mật khẩu an toàn với xác thực đa lớp
              </p>

              <!-- Features -->
              <div class="space-y-4">
                <div class="flex items-center gap-3 text-purple-100">
                  <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm">Xác thực email bảo mật</span>
                </div>
                <div class="flex items-center gap-3 text-purple-100">
                  <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm">Mã OTP 6 chữ số</span>
                </div>
                <div class="flex items-center gap-3 text-purple-100">
                  <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm">Mật khẩu mạnh</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Multi-step Form -->
        <div class="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16">
          <div class="w-full max-w-md mx-auto">
            <!-- Mobile Header -->
            <div class="lg:hidden text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg class="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h1 class="text-2xl font-bold text-gray-900">Khôi phục mật khẩu</h1>
            </div>

            <!-- Step Indicator -->
            <div class="step-indicator">
              <div class="step-circle" [class]="currentStep() === 'email' ? 'step-active' : (emailSent() ? 'step-completed' : 'step-inactive')">
                1
              </div>
              <div class="step-line" [style.background]="emailSent() ? '#10b981' : '#e5e7eb'"></div>
              <div class="step-circle" [class]="currentStep() === 'otp' ? 'step-active' : (otpSent() ? 'step-completed' : 'step-inactive')">
                2
              </div>
              <div class="step-line" [style.background]="otpSent() ? '#10b981' : '#e5e7eb'"></div>
              <div class="step-circle" [class]="currentStep() === 'reset' ? 'step-active' : (passwordReset() ? 'step-completed' : 'step-inactive')">
                3
              </div>
            </div>

            <!-- Step Content -->
            @if (currentStep() === 'email') {
              <!-- Step 1: Email Input -->
              <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Nhập email của bạn</h2>
                <p class="text-gray-600">Chúng tôi sẽ gửi mã OTP để xác thực</p>
              </div>

              <form [formGroup]="emailForm" (ngSubmit)="onEmailSubmit()" class="space-y-6">
                <div class="input-wrapper">
                  <input id="email" name="email" type="email" formControlName="email"
                         placeholder="Địa chỉ email" autocomplete="email" required
                         class="input-field block w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-base placeholder-gray-500 focus:placeholder-gray-400"
                         [class.border-red-400]="emailForm.get('email')?.invalid && emailForm.get('email')?.touched">
                  <label for="email" class="input-label">Email</label>
                </div>

                @if (emailForm.get('email')?.invalid && emailForm.get('email')?.touched) {
                  <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    @if (emailForm.get('email')?.errors?.['required']) {
                      Email là bắt buộc
                    } @else if (emailForm.get('email')?.errors?.['email'] || emailForm.get('email')?.errors?.['invalidEmail']) {
                      Email không hợp lệ
                    } @else if (emailForm.get('email')?.errors?.['commonTypo']) {
                      Kiểm tra lại địa chỉ email (có thể bị sai chính tả)
                    }
                  </p>
                }

                <button type="submit" [disabled]="emailForm.invalid || authService.isLoading()"
                        class="btn-primary w-full py-4 px-6 rounded-xl text-white font-semibold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (authService.isLoading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang gửi mã OTP...
                  } @else {
                    Gửi mã OTP
                  }
                </button>
              </form>
            }

            @else if (currentStep() === 'otp') {
              <!-- Step 2: OTP Verification -->
              <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Nhập mã OTP</h2>
                <p class="text-gray-600 mb-4">Mã OTP đã được gửi đến <strong>{{ lastEmailSent() }}</strong></p>
                <p class="text-sm text-purple-600 font-medium">Thời gian còn lại: {{ formatCountdown(countdown()) }}</p>
              </div>

              <form [formGroup]="otpForm" (ngSubmit)="onOtpSubmit()" class="space-y-6">
                <!-- OTP Input Fields -->
                <div class="flex justify-center gap-3">
                  @for (digit of otpDigits(); track $index) {
                    <input type="text" maxlength="1" [value]="digit"
                            (input)="onOtpInput($event, $index)" (keydown)="onOtpKeyDown($event, $index)"
                            (paste)="onOtpPaste($event, $index)"
                            class="otp-input" [class.filled]="digit" [id]="'otp-' + $index"
                            autocomplete="off" inputmode="numeric">
                  }
                </div>

                @if (otpError()) {
                  <div class="mt-2 text-center">
                    <p class="text-sm text-red-600 flex items-center justify-center gap-1 mb-3">
                      <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      {{ otpError() }}
                    </p>
                    <button type="button" (click)="requestNewOtp()"
                            class="text-sm text-purple-600 hover:text-purple-700 underline font-medium">
                      Yêu cầu mã OTP mới
                    </button>
                  </div>
                } @else if (otpForm.get('otp')?.invalid && otpForm.get('otp')?.touched) {
                  <p class="mt-2 text-sm text-red-600 flex items-center justify-center gap-1">
                    <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Mã OTP phải có 6 chữ số
                  </p>
                }

                <button type="submit" [disabled]="otpForm.invalid || authService.isLoading() || !!otpError()"
                        class="btn-primary w-full py-4 px-6 rounded-xl text-white font-semibold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (authService.isLoading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang xác thực...
                  } @else {
                    Xác thực mã OTP
                  }
                </button>

                <div class="text-center">
                  <button type="button" (click)="resendOTP()" [disabled]="countdown() > 0"
                          class="text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed">
                    @if (countdown() > 0) {
                      Gửi lại mã OTP ({{ formatCountdown(countdown()) }})
                    } @else {
                      Gửi lại mã OTP
                    }
                  </button>
                </div>
              </form>
            }

            @else if (currentStep() === 'reset') {
              <!-- Step 3: Password Reset -->
              <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Tạo mật khẩu mới</h2>
                <p class="text-gray-600">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              <form [formGroup]="resetPasswordForm" (ngSubmit)="onPasswordReset()" class="space-y-6">
                <!-- New Password -->
                <div class="input-wrapper">
                  <input id="password" name="password" type="password" formControlName="password"
                         placeholder="Mật khẩu mới" autocomplete="new-password" required
                         class="input-field block w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-base placeholder-gray-500 focus:placeholder-gray-400"
                         [class.border-red-400]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched">
                  <label for="password" class="input-label">Mật khẩu mới</label>
                </div>

                <!-- Confirm Password -->
                <div class="input-wrapper">
                  <input id="confirmPassword" name="confirmPassword" type="password" formControlName="confirmPassword"
                         placeholder="Xác nhận mật khẩu" autocomplete="new-password" required
                         class="input-field block w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-base placeholder-gray-500 focus:placeholder-gray-400"
                         [class]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched ? 'border-red-400' : ''">
                  <label for="confirmPassword" class="input-label">Xác nhận mật khẩu</label>
                </div>


                <!-- Validation Errors -->
                @if (resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched) {
                  <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    @if (resetPasswordForm.get('password')?.errors?.['required']) {
                      Mật khẩu mới là bắt buộc
                    } @else if (resetPasswordForm.get('password')?.errors?.['minlength']) {
                      Mật khẩu mới phải có ít nhất 6 ký tự
                    }
                  </p>
                }

                @if (resetPasswordForm.errors?.['passwordMismatch'] && resetPasswordForm.get('confirmPassword')?.touched) {
                  <p class="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    Mật khẩu xác nhận không khớp
                  </p>
                }

                <button type="submit" [disabled]="resetPasswordForm.invalid || authService.isLoading()"
                        class="btn-primary w-full py-4 px-6 rounded-xl text-white font-semibold text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  @if (authService.isLoading()) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Đang đặt lại mật khẩu...
                  } @else {
                    Đặt lại mật khẩu
                  }
                </button>
              </form>
            }

            @else if (passwordReset()) {
              <!-- Success State -->
              <div class="text-center">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 success-pulse">
                  <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Mật khẩu đã được đặt lại!</h2>
                <p class="text-gray-600 mb-8">
                  Bạn có thể sử dụng mật khẩu mới để đăng nhập vào tài khoản của mình.
                </p>
                <p class="text-sm text-gray-500 mb-6">
                  Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
                </p>
              </div>
            }

            <!-- Navigation -->
            @if (currentStep() !== 'email' && !passwordReset()) {
              <div class="mt-6 text-center">
                <button (click)="goBack()" class="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2 mx-auto">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Quay lại
                </button>
              </div>
            }

            <!-- Back to Login -->
            <div class="mt-8 text-center">
              <p class="text-sm text-gray-600">
                Nhớ mật khẩu?
                <a routerLink="/auth/login" class="font-semibold text-purple-600 hover:text-purple-700 transition-colors underline ml-1">
                  Đăng nhập
                </a>
              </p>
            </div>

            <!-- Security Notice -->
            <div class="mt-8 text-center">
              <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
                <span>Quy trình khôi phục bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Step management
  currentStep = signal<ForgotPasswordStep>('email');
  emailSent = signal(false);
  otpSent = signal(false);
  passwordReset = signal(false);
  lastEmailSent = signal('');
  countdown = signal(0);

  // Forms for each step
  emailForm!: FormGroup<EmailForm>;
  otpForm!: FormGroup<OtpForm>;
  resetPasswordForm!: FormGroup<ResetPasswordForm>;

  // OTP input handling
  otpDigits = signal<string[]>(['', '', '', '', '', '']);
  focusedIndex = signal<number>(0);
  otpError = signal<string>('');

  constructor() {
    this.initializeForms();
    this.setupCountdown();
  }

  private initializeForms(): void {
    // Email form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.emailValidator]]
    }) as FormGroup<EmailForm>;

    // OTP form
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    }) as FormGroup<OtpForm>;

    // Reset password form
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    }) as FormGroup<ResetPasswordForm>;
  }

  private setupCountdown(): void {
    // Auto-update countdown every second
    setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }

  // Step 1: Email submission
  async onEmailSubmit(): Promise<void> {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    try {
      const email = this.emailForm.get('email')?.value || '';

      // Call real API to send OTP
      const request: ForgotPasswordRequest = { email };
      await this.authService.forgotPassword(request);

      this.emailSent.set(true);
      this.lastEmailSent.set(email);
      this.currentStep.set('otp');
      this.countdown.set(600); // 10 minutes countdown (matches backend)

    } catch (error) {
      console.error('Email submission error:', error);
      // Error is handled by AuthService
    }
  }

  // Step 2: OTP verification
  async onOtpSubmit(): Promise<void> {
    const otpCode = this.otpDigits().join('');
    this.otpForm.get('otp')?.setValue(otpCode);

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    try {
      // Simulate OTP verification (since backend isn't connected yet)
      // In production, this would be a separate API call to verify OTP
      const isValidOtp = await this.verifyOtpCode(otpCode);

      if (isValidOtp) {
        this.otpError.set('');
        this.otpSent.set(true);
        this.currentStep.set('reset');
      } else {
        this.otpError.set('Mã OTP không hợp lệ. Vui lòng kiểm tra lại.');
        // Clear OTP fields and focus first input
        this.otpDigits.set(['', '', '', '', '', '']);
        this.focusOtpInput(0);
      }

    } catch (error) {
      console.error('OTP verification error:', error);
      this.otpError.set('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  }

  // Simulate OTP verification (replace with real API call when backend is ready)
  private async verifyOtpCode(otpCode: string): Promise<boolean> {
    // For demo purposes, accept any 6-digit code
    // In production, this would call the backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 80% success rate for testing
        resolve(otpCode.length === 6 && /^\d{6}$/.test(otpCode));
      }, 500); // Simulate network delay
    });
  }

  // Step 3: Password reset
  async onPasswordReset(): Promise<void> {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    try {
      const email = this.lastEmailSent();
      const otpCode = this.otpDigits().join('');
      const newPassword = this.resetPasswordForm.get('password')?.value || '';

      // Call real API to reset password
      const request: ResetPasswordRequest = {
        email,
        otpCode,
        newPassword
      };
      await this.authService.resetPassword(request);

      this.passwordReset.set(true);

      // Auto redirect to login after success
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);

    } catch (error) {
      console.error('Password reset error:', error);
      // Error is handled by AuthService
    }
  }

  // OTP input handling - Professional implementation
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Only allow digits

    // Handle paste operation
    if (value.length > 1) {
      this.handleOtpPaste(value);
      return;
    }

    // Update single digit
    const newDigits = [...this.otpDigits()];
    newDigits[index] = value;
    this.otpDigits.set(newDigits);

    // Clear any previous error
    this.otpError.set('');

    // Auto-focus next input or submit if complete
    if (value && index < 5) {
      this.focusOtpInput(index + 1);
    } else if (value && index === 5) {
      // All digits filled, auto-submit
      const completeOtp = newDigits.join('');
      if (completeOtp.length === 6) {
        this.autoSubmitOtp();
      }
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      const newDigits = [...this.otpDigits()];

      if (!input.value && index > 0) {
        // Move to previous input and clear it
        newDigits[index - 1] = '';
        this.otpDigits.set(newDigits);
        this.focusOtpInput(index - 1);
      } else if (input.value) {
        // Clear current input
        newDigits[index] = '';
        this.otpDigits.set(newDigits);
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      this.focusOtpInput(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      this.focusOtpInput(index + 1);
    }
  }

  onOtpPaste(event: ClipboardEvent, index: number): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    this.handleOtpPaste(pasteData, index);
  }

  private handleOtpPaste(value: string, startIndex: number = 0): void {
    const digits = value.replace(/\D/g, '').split('').slice(0, 6);
    const newDigits = [...this.otpDigits()];

    // Fill digits starting from the current position
    digits.forEach((digit, i) => {
      const targetIndex = startIndex + i;
      if (targetIndex < 6) {
        newDigits[targetIndex] = digit;
      }
    });

    this.otpDigits.set(newDigits);
    this.otpError.set('');

    // Focus next empty input or last filled input
    const nextEmptyIndex = newDigits.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    this.focusOtpInput(focusIndex);

    // Auto-submit if all digits are filled
    const completeOtp = newDigits.join('');
    if (completeOtp.length === 6) {
      setTimeout(() => this.autoSubmitOtp(), 100);
    }
  }

  private focusOtpInput(index: number): void {
    setTimeout(() => {
      const input = document.getElementById(`otp-${index}`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select(); // Select all text for better UX
      }
    }, 10);
  }

  private autoSubmitOtp(): void {
    const otpCode = this.otpDigits().join('');
    if (otpCode.length === 6 && /^\d{6}$/.test(otpCode)) {
      this.onOtpSubmit();
    }
  }

  resendOTP(): void {
    if (this.countdown() === 0) {
      // Resend OTP logic
      this.onEmailSubmit();
    }
  }

  requestNewOtp(): void {
    // Clear error and reset countdown
    this.otpError.set('');
    this.countdown.set(0);

    // Request new OTP
    this.onEmailSubmit();
  }

  goBack(): void {
    if (this.currentStep() === 'otp') {
      this.currentStep.set('email');
      this.otpDigits.set(['', '', '', '', '', '']);
      this.otpError.set('');
      this.otpForm.reset();
    } else if (this.currentStep() === 'reset') {
      this.currentStep.set('otp');
      this.otpError.set('');
      this.resetPasswordForm.reset();
    }
  }

  resetProcess(): void {
    this.currentStep.set('email');
    this.emailSent.set(false);
    this.otpSent.set(false);
    this.passwordReset.set(false);
    this.lastEmailSent.set('');
    this.countdown.set(0);
    this.otpDigits.set(['', '', '', '', '', '']);
    this.otpError.set('');

    this.emailForm.reset();
    this.otpForm.reset();
    this.resetPasswordForm.reset();
  }

  // Validators
  private emailValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const commonTypos = ['gmial.com', 'gmai.com', 'hotmai.com', 'yaho.com', 'outlok.com'];
    const domain = value.split('@')[1];
    if (domain && commonTypos.includes(domain.toLowerCase())) {
      return { commonTypo: true };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return { invalidEmail: true };
    }

    return null;
  }


  private passwordMatchValidator(group: FormGroup<ResetPasswordForm>): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }


  formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

}