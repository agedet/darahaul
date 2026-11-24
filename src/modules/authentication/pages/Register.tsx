import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import AuthService from '@/services/auth';
import type { IRegisterPayload } from '@/services/auth/types';
import { URLS } from '@/utils/routes';
import AuthLayout from '@/components/auth/AuthLayout';
import { CustomPhoneInput } from '@/components/auth/CustomPhoneInput';
import { storePendingVerificationEmail, setVerifyPurpose } from '@/utils/auth-storage';

// Validation helper functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

const validatePhoneNumber = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

interface SignUpFormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  dateOfBirth: string;
  state: string;
  country: string;
  termsAndConditions: boolean;
  agreeToTerms: boolean;
}

const initialForm: SignUpFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  dateOfBirth: '',
  state: '',
  country: '',
  termsAndConditions: false,
  agreeToTerms: false,
};

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<SignUpFormState>(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const updateField = <K extends keyof SignUpFormState>(
    field: K,
    value: SignUpFormState[K]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  // Step 1 Validation
  const isStep1Complete = useMemo(() => {
    const hasBasicFields =
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      validateEmail(form.email);
    const hasPassword =
      validatePassword(form.password) &&
      form.password === form.confirmPassword;
    return hasBasicFields && hasPassword;
  }, [form.firstName, form.lastName, form.email, form.password, form.confirmPassword]);

  // Step 2 Validation
  const isStep2Complete = useMemo(() => {
    const hasPersonalInfo =
      validatePhoneNumber(form.phoneNumber) &&
      form.dateOfBirth &&
      form.state.trim() &&
      form.country.trim();
    const hasAgreedToTerms = form.agreeToTerms;
    return hasPersonalInfo && hasAgreedToTerms;
  }, [form.phoneNumber, form.dateOfBirth, form.state, form.country, form.agreeToTerms]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.firstName.trim()) {
      setError('First name is required');
      return;
    }
    if (!form.lastName.trim()) {
      setError('Last name is required');
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!validatePassword(form.password)) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setCurrentStep(2);
    setError('');
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhoneNumber(form.phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!form.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }
    if (!form.state.trim()) {
      setError('State is required');
      return;
    }
    if (!form.country.trim()) {
      setError('Country is required');
      return;
    }
    if (!form.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: IRegisterPayload = {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        phone_number: form.phoneNumber,
        date_of_birth: form.dateOfBirth,
        state: form.state,
        country: form.country,
        terms_accepted: form.agreeToTerms,
      };

      const response = await AuthService.register(payload);
      storePendingVerificationEmail(response.user?.email || form.email);
      setVerifyPurpose('registration');
      navigate(URLS.VERIFY_OTP, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
    setError('');
  };

  return (
    <AuthLayout
      title="Create your DaraHaul Account"
      subtitle={currentStep === 1 ? 'Basic Information' : 'Personal Details'}
      maxWidth="md"
    >
      {/* Progress Indicator */}
      <div className="mb-8 flex items-center gap-2">
        <div className={`h-2 flex-1 rounded-full transition-colors ${
          currentStep >= 1 ? 'bg-primary' : 'bg-gray-200'
        }`} />
        <div className={`h-2 flex-1 rounded-full transition-colors ${
          currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'
        }`} />
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              type="text"
              value={form.firstName}
              onChange={(value) => updateField('firstName', value)}
              placeholder="John"
              required
            />
            <FormInput
              label="Last Name"
              type="text"
              value={form.lastName}
              onChange={(value) => updateField('lastName', value)}
              placeholder="Doe"
              required
            />
          </div>

          <FormInput
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(value) => updateField('email', value)}
            placeholder="john@example.com"
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) => updateField('password', value)}
            placeholder="At least 8 characters"
            required
          />

          <FormInput
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(value) => updateField('confirmPassword', value)}
            placeholder="Re-enter your password"
            required
          />

          {error && <ErrorMessage message={error} />}

          <button
            type="submit"
            disabled={!isStep1Complete}
            className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next Step
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <a href={URLS.LOGIN} className="text-primary hover:opacity-70 font-semibold">
              Sign In
            </a>
          </p>
        </form>
      )}

      {/* Step 2: Personal Details */}
      {currentStep === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <FormInput
            label="Phone Number"
            type="tel"
            value={form.phoneNumber}
            onChange={(value) => updateField('phoneNumber', value)}
            placeholder="+1 (555) 000-0000"
            required
            component={
              <CustomPhoneInput
                value={form.phoneNumber}
                onChange={(value) => updateField('phoneNumber', value || '')}
              />
            }
          />

          <FormInput
            label="Date of Birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="State"
              type="text"
              value={form.state}
              onChange={(value) => updateField('state', value)}
              placeholder="California"
              required
            />
            <FormInput
              label="Country"
              type="text"
              value={form.country}
              onChange={(value) => updateField('country', value)}
              placeholder="United States"
              required
            />
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="terms"
              checked={form.agreeToTerms}
              onChange={(e) => {
                updateField('agreeToTerms', e.target.checked);
                updateField('termsAndConditions', e.target.checked);
              }}
              className="mt-1 w-5 h-5 text-primary border-gray-300 rounded cursor-pointer focus:ring-primary"
            />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              <span>
                I agree to the {' '}
              <a href="#" className="text-primary hover:opacity-70 font-semibold underline">
                Terms and Conditions
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:opacity-70 font-semibold underline">
                Privacy Policy
              </a>
              </span>
            </label>
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
              disabled={!isStep2Complete || isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Signing Up...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

// Reusable Form Input Component
function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  component,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  component?: React.ReactNode;
}) {
  if (component) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">
            {label}
          </label>
          {required && <span className="text-red-500">*</span>}
        </div>
        {component}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-gray-700">
          {label}
        </label>
        {required && <span className="text-red-500">*</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
      />
    </div>
  );
}

// Error Message Component
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-700 font-medium">{message}</p>
    </div>
  );
}
