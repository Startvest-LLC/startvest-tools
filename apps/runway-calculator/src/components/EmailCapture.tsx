'use client';

import { useState } from 'react';
import { trackToolUse } from '@/lib/analytics';

interface EmailCaptureProps {
  className?: string;
}

export function EmailCapture({ className = '' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    setStatus('loading');
    trackToolUse('runway_calculator', 'email_capture_attempt', { source: 'monthly_checkups' });

    try {
      const response = await fetch('https://idealift.startvest.ai/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'runway_calculator',
          tags: ['free_tools', 'runway_calculator', 'monthly_checkups'],
        }),
      });

      if (response.ok) {
        setStatus('success');
        trackToolUse('runway_calculator', 'email_capture_success', { source: 'monthly_checkups' });
        setEmail('');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className={`bg-green-900/30 rounded-xl p-6 border border-green-500/30 ${className}`}>
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <h3 className="font-semibold text-green-400">You're subscribed!</h3>
            <p className="text-sm text-gray-300">Watch your inbox for monthly runway checkups and founder insights.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/5 rounded-xl p-6 border border-white/10 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <svg className="w-6 h-6 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <div>
          <h3 className="font-semibold text-white">Get Monthly Runway Checkups</h3>
          <p className="text-sm text-gray-400 mt-1">
            Free monthly email with runway tips, benchmarks, and founder insights. No spam, unsubscribe anytime.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          placeholder="you@startup.com"
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
      )}
    </div>
  );
}
