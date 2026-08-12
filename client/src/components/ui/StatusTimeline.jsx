import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, UserCheck, PlayCircle, ShieldCheck } from 'lucide-react';
import { StatusBadge } from './NeuUtils';

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STEP_ICONS = {
  PENDING: Clock,
  ASSIGNED: UserCheck,
  IN_PROGRESS: PlayCircle,
  RESOLVED: CheckCircle2,
  CLOSED: ShieldCheck,
};

export function StatusTimeline({ currentStatus, history = [] }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="w-full neu-inset p-4 rounded-neu overflow-x-auto">
        <div className="flex items-center justify-between min-w-[420px] sm:min-w-0 gap-2">
          {STATUS_STEPS.map((step, idx) => {
            const isPassed = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = STEP_ICONS[step];

            return (
              <div key={step} className="flex flex-col items-center z-10 min-w-[60px] text-center shrink-0">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                    backgroundColor: isPassed ? '#4f46e5' : '#e6e8ec',
                    color: isPassed ? '#ffffff' : '#718096',
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    isPassed ? 'shadow-md' : 'neu-raised-sm'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </motion.div>
                <span className={`text-[10px] sm:text-[11px] uppercase font-semibold mt-1.5 whitespace-nowrap ${isPassed ? 'text-neu-primary font-bold' : 'text-neu-muted'}`}>
                  {step.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History Log Timeline */}
      <div className="space-y-3 pl-2">
        <h4 className="text-xs font-semibold text-neu-muted uppercase tracking-wider">Audit Log & Status History</h4>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-xs text-neu-muted italic">No status history recorded yet.</p>
          ) : (
            history.map((h, i) => (
              <motion.div
                key={h.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3.5 rounded-neu neu-raised text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={h.new_status} />
                    <span className="font-semibold text-neu-text">by {h.changed_by}</span>
                  </div>
                  <span className="text-[10px] text-neu-muted">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                </div>
                {h.remark && <p className="text-neu-muted text-[11px] pt-1">{h.remark}</p>}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
