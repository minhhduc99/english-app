import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function StatCard({ icon: Icon, iconColor, iconBgColor, title, value, change, changeType }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="text-sm text-gray-600 mb-1">{title}</div>
          <div className="text-3xl font-semibold text-gray-900">{value}</div>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  changeType === 'positive'
                    ? 'text-green-600'
                    : changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
