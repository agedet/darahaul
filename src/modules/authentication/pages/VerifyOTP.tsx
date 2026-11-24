import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import AuthService from '@/services/auth';
import { URLS } from '@/utils/routes';
import AuthLayout from '@/components/auth/AuthLayout';
import { getDashboardByRole } from '@/utils/routeConfig';
import { normalizeRole, requiresOnboarding } from '@/lib/roles';
import {
  clearPendingVerificationEmail,
  clearVerifyPurpose,
  getAuthErrorMessage,
  getPendingVerificationEmail,
  getVerifyPurpose,
  maskEmail,
  storePendingVerificationEmail,
} from '@/utils/auth-storage';

export default function VerifyOTP() {
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initializedRef = useRef(false);

  const verifyPurpose = getVerifyPurpose();
  const isRegistrationFlow = verifyPurpose === 'registration';

  const otpCode = digits.join('');
  const isComplete = otpCode.length === 6 && digits.every((d) => d !== '');

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const pendingEmail = getPendingVerificationEmail();
    if (!pendingEmail) {
      navigate(URLS.LOGIN, { replace: true });
      return;
    }
    setEmail(pendingEmail);
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

      const nextEmptyIndex = newDigits.findIndex((d) => d === '');
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const resolveDestination = async (): Promise<string> => {
    const session = await AuthService.getSession();
    const role = normalizeRole(session.role);

    if (requiresOnboarding(role) && !session.onboardingCompleted) {
      return URLS.ONBOARDING;
    }

    const redirectUrl = searchParams.get('redirectUrl');
    if (redirectUrl && redirectUrl.startsWith('/')) {
      return redirectUrl;
    }

    return getDashboardByRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isComplete) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!email.trim()) {
      setError('Session expired. Please sign in again.');
      return;
    }

    setIsSubmitting(true);
    try {
      await AuthService.verifyOtp({ email, otp: otpCode });

      clearPendingVerificationEmail();
      clearVerifyPurpose();
      await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });

      const destination = await resolveDestination();
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to verify code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setError('');
    setSuccess('');

    try {
      if (!email.trim()) {
        setError('Session expired. Please sign in again.');
        setResendDisabled(false);
        return;
      }

      const response = await AuthService.resendOtp(email);
      setSuccess(response.message);
      storePendingVerificationEmail(email);

      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendDisabled(false), 30000);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to resend verification code'));
      setResendDisabled(false);
    }
  };

  const canSubmit = isComplete && !!email;

  if (!email) {
    return null;
  }

  return (
    <AuthLayout
      title={isRegistrationFlow ? 'Verify Your Account' : 'Verify Sign In'}
      subtitle="Enter the 6-digit code sent to your email"
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Verification code sent to{' '}
            <span className="font-semibold text-gray-900">
              {maskEmail(email)}
            </span>
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Verification Code
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

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
        </button>

        <p className="text-center text-sm text-gray-600">
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

        <p className="text-center text-sm text-gray-600">
          <Link
            to={isRegistrationFlow ? URLS.SIGNUP : URLS.LOGIN}
            className="text-primary hover:opacity-70 font-semibold transition-colors"
          >
            {isRegistrationFlow ? 'Back to Sign Up' : 'Back to Sign In'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
