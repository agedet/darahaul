import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import UserService from '@/services/user';
import type {
  IDriverOnboardingPayload,
  IMechanicOnboardingPayload,
} from '@/services/auth/types';
import { getDashboardByRole } from '@/utils/routeConfig';
import { requiresOnboarding } from '@/lib/roles';
import { useUserAuth } from '@/modules/authentication/providers/context/useAuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import { CustomPhoneInput } from '@/components/auth/CustomPhoneInput';
import { Loader2 } from 'lucide-react';

const validatePhoneNumber = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

type DriverFormState = Required<IDriverOnboardingPayload>;
type MechanicFormState = IMechanicOnboardingPayload;

const initialDriverForm: DriverFormState = {
  license_number: '',
  address: '',
  emergency_phone: '',
  date_of_birth: '',
  emergency_contact_name: '',
};

const initialMechanicForm: MechanicFormState = {
  specialty: '',
  certifications: '',
  years_of_experience: undefined,
  hourly_rate: undefined,
};

/**
 * Post-login onboarding for drivers and mechanics.
 * Collects the role-specific requirements stored by the backend
 * (drivers -> license/emergency info, mechanics -> specialty/rate).
 */
export default function Onboarding() {
  const { user, role, isLoading } = useUserAuth();
  const [driverForm, setDriverForm] =
    useState<DriverFormState>(initialDriverForm);
  const [mechanicForm, setMechanicForm] =
    useState<MechanicFormState>(initialMechanicForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isDriver = role === 'Driver';
  const isMechanic = role === 'Mechanic';

  const driverComplete = useMemo(
    () =>
      driverForm.license_number.trim().length > 0 &&
      driverForm.address.trim().length > 0 &&
      validatePhoneNumber(driverForm.emergency_phone) &&
      driverForm.date_of_birth.length > 0 &&
      driverForm.emergency_contact_name.trim().length > 0,
    [driverForm],
  );

  const mechanicComplete = useMemo(
    () =>
      (mechanicForm.specialty?.trim().length ?? 0) > 0 &&
      (mechanicForm.years_of_experience ?? 0) >= 0 &&
      mechanicForm.years_of_experience !== undefined &&
      mechanicForm.hourly_rate !== undefined &&
      Number(mechanicForm.hourly_rate) >= 0,
    [mechanicForm],
  );

  const canSubmit = isDriver ? driverComplete : mechanicComplete;

  const updateDriverField = <K extends keyof DriverFormState>(
    field: K,
    value: DriverFormState[K],
  ) => {
    setDriverForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsSubmitting(true);
    try {
      if (isDriver) {
        await UserService.completeOnboarding({
          driver_onboarding: driverForm,
        });
      } else if (isMechanic) {
        await UserService.completeOnboarding({
          mechanic_onboarding: {
            specialty: mechanicForm.specialty?.trim(),
            certifications: mechanicForm.certifications?.trim() || undefined,
            years_of_experience: mechanicForm.years_of_experience,
            hourly_rate: mechanicForm.hourly_rate,
          },
        });
      } else {
        setError('Onboarding is not available for your role.');
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] });
      navigate(getDashboardByRole(role), { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to complete onboarding',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !requiresOnboarding(role)) {
    return null;
  }

  return (
    <AuthLayout
      title={isDriver ? 'Complete Your Driver Profile' : 'Complete Your Mechanic Profile'}
      subtitle="Please provide the required details to finish setting up your account"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isDriver && (
          <>
            <FormInput
              label="Driver's License Number"
              value={driverForm.license_number}
              onChange={(value) => updateDriverField('license_number', value)}
              placeholder="DLS123456"
            />

            <FormInput
              label="Residential Address"
              value={driverForm.address}
              onChange={(value) => updateDriverField('address', value)}
              placeholder="123 Main Street, City"
            />

            <FormInput
              label="Emergency Contact Phone"
              value={driverForm.emergency_phone}
              onChange={(value) => updateDriverField('emergency_phone', value)}
              component={
                <CustomPhoneInput
                  value={driverForm.emergency_phone}
                  onChange={(value) =>
                    updateDriverField('emergency_phone', value || '')
                  }
                />
              }
            />

            <FormInput
              label="Emergency Contact Name"
              value={driverForm.emergency_contact_name}
              onChange={(value) =>
                updateDriverField('emergency_contact_name', value)
              }
              placeholder="Full name of emergency contact"
            />

            <FormInput
              label="Date of Birth"
              type="date"
              value={driverForm.date_of_birth}
              onChange={(value) => updateDriverField('date_of_birth', value)}
            />
          </>
        )}

        {isMechanic && (
          <>
            <FormInput
              label="Specialty"
              value={mechanicForm.specialty || ''}
              onChange={(value) =>
                setMechanicForm((current) => ({ ...current, specialty: value }))
              }
              placeholder="e.g. Engine Diagnostics, Brake Systems"
            />

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Certifications
                <span className="text-gray-500 ml-1 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <textarea
                value={mechanicForm.certifications || ''}
                onChange={(e) =>
                  setMechanicForm((current) => ({
                    ...current,
                    certifications: e.target.value,
                  }))
                }
                placeholder="List relevant certifications, e.g. ASE, manufacturer training"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors text-sm min-h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Years of Experience"
                type="number"
                value={
                  mechanicForm.years_of_experience !== undefined
                    ? String(mechanicForm.years_of_experience)
                    : ''
                }
                onChange={(value) =>
                  setMechanicForm((current) => ({
                    ...current,
                    years_of_experience:
                      value === '' ? undefined : Number(value),
                  }))
                }
                placeholder="5"
              />
              <FormInput
                label="Hourly Rate"
                type="number"
                value={
                  mechanicForm.hourly_rate !== undefined
                    ? String(mechanicForm.hourly_rate)
                    : ''
                }
                onChange={(value) =>
                  setMechanicForm((current) => ({
                    ...current,
                    hourly_rate: value === '' ? undefined : Number(value),
                  }))
                }
                placeholder="50.00"
              />
            </div>
          </>
        )}

        {error && <ErrorMessage message={error} />}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? 'Saving...' : 'Complete Setup'}
        </button>
      </form>
    </AuthLayout>
  );
}

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
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {component}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {!required && (
          <span className="text-gray-500 ml-1 text-xs font-normal">(Optional)</span>
        )}
      </label>
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

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700 font-medium">{message}</p>
    </div>
  );
}
