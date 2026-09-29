'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, ShieldCheck } from 'lucide-react';
import { UserSession } from '@/types';

interface AdminHeaderProps {
  user: UserSession;
  storeName?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, storeName = 'Sahasra Fashion' }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between z-30">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Active Store:
        </span>
        <span className="text-sm font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg">
          {storeName}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-neutral-900 leading-tight">{user.name}</div>
            <div className="text-[10px] text-neutral-400 font-mono">Administrator</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out of Admin"
          className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};
