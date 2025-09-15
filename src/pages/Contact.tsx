import React from 'react';
import { Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold">Contact</h2>
      <p className="mt-2 text-slate-300">Have feedback or want to tune levels? Get in touch.</p>

      <div className="mt-6 space-y-4">
        <div className="p-4 rounded-lg glass-card">
          <div className="flex items-center space-x-3 text-slate-200">
            <Mail size={18} />
            <div>
              <div className="text-sm">Email</div>
              <div className="text-xs text-slate-400">hello@applaa.example</div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg glass-card">
          <div className="flex items-center space-x-3 text-slate-200">
            <MapPin size={18} />
            <div>
              <div className="text-sm">Location</div>
              <div className="text-xs text-slate-400">Remote — Built with love</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}