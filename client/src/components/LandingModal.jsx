import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuButton } from '../components/ui/NeuButton';

export function LandingModal({ onSelectUser, onSelectAdmin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg space-y-6"
      >
        <NeuCard className="p-8 space-y-6 text-center">
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-neu neu-inset text-neu-primary mx-auto flex items-center justify-center font-bold text-2xl">
              CMS
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-neu-text">
              Complaint Management System
            </h1>
            <p className="text-xs text-neu-muted max-w-sm mx-auto">
              Please select your destination portal to continue to the application.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <NeuCard
              hoverable
              onClick={onSelectUser}
              className="p-5 flex flex-col items-center justify-between text-center space-y-4 hover:border-neu-primary/40 border border-transparent transition-all"
            >
              <div className="w-12 h-12 rounded-full neu-raised text-neu-primary flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neu-text">User Portal</h3>
                <p className="text-[11px] text-neu-muted mt-1">Submit, view, and track your complaints</p>
              </div>
              <NeuButton variant="primary" size="sm" className="w-full mt-2" icon={ArrowRight}>
                Continue as User
              </NeuButton>
            </NeuCard>

            <NeuCard
              hoverable
              onClick={onSelectAdmin}
              className="p-5 flex flex-col items-center justify-between text-center space-y-4 hover:border-neu-primary/40 border border-transparent transition-all"
            >
              <div className="w-12 h-12 rounded-full neu-raised text-neu-primary flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neu-text">Admin Portal</h3>
                <p className="text-[11px] text-neu-muted mt-1">Executive overview & complaint management</p>
              </div>
              <NeuButton variant="default" size="sm" className="w-full mt-2" icon={ArrowRight}>
                Continue as Admin
              </NeuButton>
            </NeuCard>
          </div>
        </NeuCard>
      </motion.div>
    </div>
  );
}
