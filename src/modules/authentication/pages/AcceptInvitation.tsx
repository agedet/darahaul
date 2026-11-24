import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import Api from '@/utils/api';
import AuthLayout from '@/components/auth/AuthLayout';
import { URLS } from '@/utils/routes';
import { ROLE_DISPLAY_NAMES, normalizeRole } from '@/lib/roles';

interface InvitationDetails {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  expires_at: string;
}

const getErrorMessage = (err: unknown, fallback: string) => {
  const data = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(data)) return data[0];
  if (typeof data === 'string') return data;
  return fallback;
};

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadError('This invitation link is invalid or incomplete.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    Api.get<InvitationDetails>(`/invitations/validate/${encodeURIComponent(token)}`)
      .then((data) => {
        if (!cancelled) setInvitation(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(getErrorMessage(err, 'This invitation link is invalid or has expired.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const normalizedRole = invitation ? normalizeRole(invitation.role) : null;
  const roleLabel = normalizedRole
    ? ROLE_DISPLAY_NAMES[normalizedRole]
    : invitation?.role ?? '';

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = passwordsMatch && password.length >= 8 && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await Api.post('/invitations/accept', { token, password });
      setAccepted(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to accept invitation'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (accepted) {
    return (
      <AuthLayout
        title="Invitation Accepted"
        subtitle="Your account has been created successfully."
        maxWidth="sm"
      >
        <div className="space-y-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              Welcome aboard{invitation?.first_name ? `, ${invitation.first_name}` : ''}! You
              can now sign in with your email and the password you just set.
            </p>
          </div>
          <Link
            to={URLS.LOGIN}
            className="block w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all text-center"
          >
            Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout title="Accept Invitation" maxWidth="sm">
        <p className="text-sm text-gray-600 text-center">Validating your invitation...</p>
      </AuthLayout>
    );
  }

  if (loadError || !invitation) {
    return (
      <AuthLayout
        title="Invalid Invitation"
        subtitle="We couldn't validate this invitation link."
        maxWidth="sm"
      >
        <div className="space-y-6">
          {loadError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">{loadError}</p>
            </div>
          )}
          <p className="text-sm text-gray-600">
            Please contact the person who invited you to request a new invitation, or{' '}
            <Link to={URLS.LOGIN} className="text-primary hover:opacity-70 font-semibold">
              go to sign in
            </Link>
            .
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Accept Invitation"
      subtitle={`You've been invited to join Darahaul as ${roleLabel}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
          <p className="text-sm text-gray-600">
            Invitation for{' '}
            <span className="font-semibold text-gray-900">
              {invitation.first_name} {invitation.last_name}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Email:{' '}
            <span className="font-semibold text-gray-900">{invitation.email}</span>
          </p>
          <p className="text-sm text-gray-600">
            Role:{' '}
            <span className="font-semibold text-gray-900">{roleLabel}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Create Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
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
