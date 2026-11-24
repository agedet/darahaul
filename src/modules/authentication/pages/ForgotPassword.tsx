import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import AuthService from '@/services/auth';
import { URLS } from '@/utils/routes';
import AuthLayout from '@/components/auth/AuthLayout';
import {
  getAuthErrorMessage,
  storePasswordResetEmail,
} from '@/utils/auth-storage';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isFormValid = useMemo(() => {
    return validateEmail(email);
  }, [email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await AuthService.forgotPassword(email);
      storePasswordResetEmail(email);
      setSuccess(
        response.message ||
          'If an account exists with this email, a password reset code has been sent.',
      );

      setTimeout(() => {
        navigate(URLS.RESET_PASSWORD, { replace: true });
      }, 1500);
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Failed to send reset code'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset code"
      maxWidth="sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
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

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Sending Reset Code...' : 'Send Reset Code'}
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Remember your password?{' '}
          <Link
            to={URLS.LOGIN}
            className="text-primary hover:opacity-70 font-semibold transition-colors"
          >
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
