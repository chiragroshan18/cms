import React from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuButton } from '../components/ui/NeuButton';

export function LandingView({ onSelectUser, onSelectAdmin }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neu-bg">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl space-y-6"
      >
        <NeuCard className="p-8 space-y-6 text-center">
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-neu neu-inset text-neu-primary mx-auto flex items-center justify-center font-bold text-3xl">
              CMS
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-neu-text">
              Complaint Management System
            </h1>
            <p className="text-sm text-neu-muted max-w-md mx-auto leading-relaxed">
              Select your destination portal to sign in or access your account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
            <NeuCard
              hoverable
              onClick={onSelectUser}
              className="p-6 flex flex-col items-center justify-between text-center space-y-4 hover:border-neu-primary/40 border border-transparent transition-all"
            >
              <div className="w-14 h-14 rounded-full neu-raised text-neu-primary flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neu-text">User Portal</h3>
                <p className="text-xs text-neu-muted mt-1">Submit, view, and track your complaints</p>
              </div>
              <NeuButton variant="primary" size="md" className="w-full mt-2" icon={ArrowRight}>
                Continue as User
              </NeuButton>
            </NeuCard>

            <NeuCard
              hoverable
              onClick={onSelectAdmin}
              className="p-6 flex flex-col items-center justify-between text-center space-y-4 hover:border-neu-primary/40 border border-transparent transition-all"
            >
              <div className="w-14 h-14 rounded-full neu-raised text-neu-primary flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-neu-text">Admin Portal</h3>
                <p className="text-xs text-neu-muted mt-1">Executive overview & complaint management</p>
              </div>
              <NeuButton variant="default" size="md" className="w-full mt-2" icon={ArrowRight}>
                Continue as Admin
              </NeuButton>
            </NeuCard>
          </div>
        </NeuCard>
      </motion.div>
    </div>
  );
}
