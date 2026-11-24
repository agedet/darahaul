import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import AuthService from '@/services/auth';
import { URLS } from '@/utils/routes';
import AuthLayout from '@/components/auth/AuthLayout';
import { consumeAuthFlashMessage, getAuthErrorMessage, setVerifyPurpose, storePendingVerificationEmail } from '@/utils/auth-storage';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setSuccessMessage(consumeAuthFlashMessage() || '');
  }, []);

  const isFormValid = useMemo(() => {
    return validateEmail(email) && password.length >= 8;
  }, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AuthService.login({ email, password });

      // The backend always sends a login OTP to the user's email.
      const otpEmail = response.user?.email || email;
      storePendingVerificationEmail(otpEmail);
      setVerifyPurpose('login');

      const redirectUrl = searchParams.get('redirectUrl');
      const verifyUrl = redirectUrl
        ? `${URLS.VERIFY_OTP}?redirectUrl=${encodeURIComponent(redirectUrl)}`
        : URLS.VERIFY_OTP;

      navigate(verifyUrl);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to sign in'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your DaraHaul account"
      maxWidth="sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {successMessage && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <span className="text-red-500">*</span>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <span className="text-red-500">*</span>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="•••••••••••"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
            required
          />
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            to={URLS.FORGOT_PASSWORD}
            className="text-sm text-primary hover:opacity-70 font-semibold transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Sign Up Link */}
        {/* <p className="text-center text-sm text-gray-600 mt-4">
          Registered but didn&apos;t verify your email?{' '}
          <span className="text-gray-700">
            Sign in above and we&apos;ll send a new verification code.
          </span>
        </p> */}

        <p className="text-center text-sm text-gray-600 mt-4">
          Don&apos;t have an account?{' '}
          <Link
            to={URLS.SIGNUP}
            className="text-primary hover:opacity-70 font-semibold transition-colors"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
