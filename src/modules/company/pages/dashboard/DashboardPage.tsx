import { useUserAuth } from '@/modules/authentication/providers/context/useAuthContext';

export default function AdminDashboard() {
  const { user } = useUserAuth();

  return (
    <section className="p-6">
      <h1 className="text-2xl font-semibold text-gray-950">
        Admin Dashboard
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Welcome back, {user?.firstName ?? 'there'}.
      </p>
    </section>
  );
}
