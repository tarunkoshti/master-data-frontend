import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return <span className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-slate-100 text-slate-700">UNKNOWN</span>;

  let colorClasses = '';

  switch (status.toLowerCase()) {
    case 'verified':
    case 'approved':
      colorClasses = 'bg-emerald-100 text-emerald-700';
      break;
    case 'rejected':
    case 'profile_deleted':
      colorClasses = 'bg-rose-100 text-rose-700';
      break;
    case 'pending':
    default:
      colorClasses = 'bg-amber-100 text-amber-700';
      break;
  }

  const formattedStatus = status.replace('_', ' ').toUpperCase();

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClasses}`}>
      {formattedStatus}
    </span>
  );
}
