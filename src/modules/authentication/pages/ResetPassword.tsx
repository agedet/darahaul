import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import AuthService from '@/services/auth';
import { URLS } from '@/utils/routes';
import AuthLayout from '@/components/auth/AuthLayout';
import {
  clearPasswordResetEmail,
  getAuthErrorMessage,
  getPasswordResetEmail,
  maskEmail,
  setAuthFlashMessage,
} from '@/utils/auth-storage';

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export default function ResetPassword() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const otpCode = digits.join('');
  const isTokenComplete =
    otpCode.length === 6 && digits.every((digit) => digit !== '');
  const isPasswordValid = useMemo(() => {
    return validatePassword(newPassword) && newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const storedEmail = getPasswordResetEmail();
    if (!storedEmail) {
      navigate(URLS.FORGOT_PASSWORD, { replace: true });
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError('');
    setSuccess('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digitsOnly.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < digitsOnly.length && i < 6; i++) {
        newDigits[i] = digitsOnly[i];
      }
      setDigits(newDigits);
      setError('');
      setSuccess('');

      const nextEmptyIndex = newDigits.findIndex((d) => d === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Your reset session expired. Please request a new code.');
      return;
    }

    if (!isTokenComplete) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      // Verifying the OTP establishes the session cookie required by
      // the authenticated reset-password endpoint.
      await AuthService.verifyOtp({ email, otp: otpCode });
      setCurrentStep(2);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Invalid or expired reset code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      await AuthService.resetPassword({
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      // End the session created during OTP verification, then sign in fresh.
      try {
        await AuthService.logout();
      } catch {
        // Ignore logout failures — cookies may already be invalid.
      }

      clearPasswordResetEmail();
      setAuthFlashMessage('Password reset successfully. Please sign in.');
      navigate(URLS.LOGIN, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to reset password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email.trim()) {
      setError('Your reset session expired. Please request a new code.');
      return;
    }

    setResendDisabled(true);
    setError('');
    setSuccess('');

    try {
      const response = await AuthService.resendOtp(email);
      setSuccess(response.message);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendDisabled(false), 30000);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to resend reset code'));
      setResendDisabled(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
    setError('');
    setSuccess('');
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle={
        currentStep === 1
          ? 'Step 1 of 2: Enter Reset Code'
          : 'Step 2 of 2: Create New Password'
      }
      maxWidth="sm"
    >
      <div className="mb-8 flex items-center gap-2">
        <div
          className={`h-2 flex-1 rounded-full transition-colors ${
            currentStep >= 1
              ? 'bg-primary'
              : 'bg-gray-200'
          }`}
        />
        <div
          className={`h-2 flex-1 rounded-full transition-colors ${
            currentStep >= 2
              ? 'bg-primary'
              : 'bg-gray-200'
          }`}
        />
      </div>

      {currentStep === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Reset code sent to{' '}
              <span className="font-semibold text-gray-900">{maskEmail(email)}</span>
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Reset Code
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="flex gap-3 justify-center">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  placeholder="-"
                  className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border-2 focus:outline-none transition-colors ${
                    digit
                      ? 'border-primary bg-gray-100'
                      : 'border-gray-300 hover:border-gray-400 focus:border-primary'
                  }`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            disabled={!isTokenComplete || isSubmitting}
            className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Verifying...' : 'Next Step'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendDisabled}
                className="text-primary hover:opacity-70 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resendDisabled ? 'Resend in 30s' : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>
      )}

      {currentStep === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              New Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Confirm Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Re-enter your password"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
              required
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={!isPasswordValid || isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700 font-medium">{message}</p>
    </div>
  );
}
