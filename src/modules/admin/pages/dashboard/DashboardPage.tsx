import { Building2, UserCircle, Users } from 'lucide-react';

const stats = [
  { label: 'Companies onboarded', value: '—', icon: Building2 },
  { label: 'Total users', value: '—', icon: Users },
  { label: 'Total customers', value: '—', icon: UserCircle },
];

export default function AdminDashboard() {
  return (
    <section className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-950">Platform Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor companies, users, and customers across the DaraHaul platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8EBFD]">
                <Icon className="h-5 w-5 text-[#4C4185]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-950">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
