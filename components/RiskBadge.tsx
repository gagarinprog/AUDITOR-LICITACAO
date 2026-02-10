import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

interface RiskBadgeProps {
  label: string;
  details: string;
  citation: string;
  status: 'critical' | 'warning' | 'success';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ label, details, citation, status }) => {
  let colorClass = "bg-gray-50 text-gray-700 border-gray-200";
  let Icon = CheckCircle;

  if (status === 'critical') {
    colorClass = "bg-red-50 text-red-700 border-red-200";
    Icon = XCircle;
  } else if (status === 'warning') {
    colorClass = "bg-amber-50 text-amber-800 border-amber-200";
    Icon = AlertTriangle;
  } else if (status === 'success') {
    colorClass = "bg-green-50 text-green-700 border-green-200";
    Icon = CheckCircle;
  }

  return (
    <div className={`flex flex-col h-full border rounded-xl p-5 ${colorClass} shadow-sm transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center gap-2 font-bold mb-3 uppercase text-xs tracking-wider opacity-90">
        <Icon size={18} strokeWidth={2.5} />
        {label}
      </div>
      <p className="text-sm font-medium leading-relaxed mb-4 flex-grow">{details || "Não especificado"}</p>
      
      {citation && (
        <div className="mt-auto pt-3 border-t border-black/5 flex items-center gap-1.5 text-xs opacity-75 font-mono">
            <Search size={12} />
            <span>Ref: {citation}</span>
        </div>
      )}
    </div>
  );
};