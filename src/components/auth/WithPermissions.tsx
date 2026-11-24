import React from 'react';
import { PermissionGate } from './PermissionGate';

/**
 * Higher-order component version of PermissionGate
 *
 * Usage:
 * ```tsx
 * const AdminButton = withPermissions(['PDM', 'CTS'])(Button);
 * ```
 */
export const withPermissions = <P extends object>(
  permissions: string[],
  options?: { requireAll?: boolean; fallback?: React.ReactNode }
) => {
  return (Component: React.ComponentType<P>) => {
    const WrappedComponent: React.FC<P> = (props) => (
      <PermissionGate
        permissions={permissions}
        requireAll={options?.requireAll}
        fallback={options?.fallback}
      >
        <Component {...props} />
      </PermissionGate>
    );

    WrappedComponent.displayName = `withPermissions(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
  };
};
