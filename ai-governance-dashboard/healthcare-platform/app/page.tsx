import { Activity, Users, Calendar, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    {
      name: 'Total Patients',
      value: '2,543',
      change: '+12.5%',
      icon: Users,
      color: 'bg-healing-teal',
    },
    {
      name: 'Appointments Today',
      value: '24',
      change: '+4.2%',
      icon: Calendar,
      color: 'bg-info',
    },
    {
      name: 'Active Cases',
      value: '156',
      change: '-2.1%',
      icon: Activity,
      color: 'bg-warning',
    },
    {
      name: 'Patient Satisfaction',
      value: '94%',
      change: '+1.8%',
      icon: TrendingUp,
      color: 'bg-success',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-deep-slate mb-2">
          Dashboard
        </h1>
        <p className="text-soft-sage">
          Welcome back, Dr. Smith. Here's your overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.change.startsWith('+')
                      ? 'text-success'
                      : 'text-error'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-deep-slate mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-soft-sage">{stat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-deep-slate mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              patient: 'Sarah Johnson',
              action: 'Appointment scheduled',
              time: '10 minutes ago',
            },
            {
              patient: 'Michael Chen',
              action: 'Lab results uploaded',
              time: '1 hour ago',
            },
            {
              patient: 'Emily Davis',
              action: 'Prescription renewed',
              time: '2 hours ago',
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div>
                <p className="font-medium text-deep-slate">
                  {activity.patient}
                </p>
                <p className="text-sm text-soft-sage">{activity.action}</p>
              </div>
              <span className="text-sm text-soft-sage">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HIPAA Compliance Notice */}
      <div className="mt-8 bg-healing-teal/10 border border-healing-teal/20 rounded-lg p-4">
        <p className="text-sm text-deep-slate">
          <span className="font-semibold">HIPAA Compliance:</span> This session
          will automatically expire after 15 minutes of inactivity to protect
          patient data. You will receive a warning 2 minutes before expiration.
        </p>
      </div>
    </div>
  );
}
