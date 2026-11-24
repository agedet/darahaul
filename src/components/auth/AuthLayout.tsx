import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
};

/**
 * AuthLayout Component
 * Provides a consistent gradient background and centered form container
 * for all authentication pages (signup, login, verification, onboarding)
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'md',
}) => {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
      
      {/* Decorative Blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-gray-200 to-gray-300 rounded-full opacity-20 blur-3xl" />
      
      {/* Content Container */}
      <div className="relative flex items-center justify-center min-h-screen px-4 py-8 sm:py-12">
        <div className={`w-full ${maxWidthClasses[maxWidth]}`}>
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl backdrop-blur-sm p-8 sm:p-10">
            {/* Header */}
            {title && (
              <div className="mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-950">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 text-gray-600 text-base sm:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            
            {/* Form Content */}
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
