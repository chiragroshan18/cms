import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function StatCounter({ value, duration = 1.2 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = Number(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setDisplayValue(Math.floor(progress * endValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span className="font-bold tracking-tight">{displayValue}</span>;
}

export function StatusBadge({ status, priority }) {
  if (priority) {
    const priorityColors = {
      LOW: 'bg-slate-200 text-slate-700 border-slate-300',
      MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200 font-bold animate-pulse',
    }[priority] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${priorityColors}`}>
        {priority}
      </span>
    );
  }

  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
    ASSIGNED: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    IN_PROGRESS: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    CLOSED: 'bg-gray-200 text-gray-700 border-gray-300',
  }[status] || 'bg-gray-100 text-gray-800';

  const formatStatus = status ? status.replace('_', ' ') : 'UNKNOWN';

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors}`}>
      {formatStatus}
    </span>
  );
}

export function SkeletonLoader({ className = '' }) {
  return (
    <div
      className={`neu-inset animate-pulse bg-neu-muted/10 rounded-neu ${className}`}
    />
  );
}
