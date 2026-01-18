'use client';

import { trackPaidProductClick, trackCTAClick } from '@/lib/analytics';

interface ConditionalCTAProps {
  runwayMonths: number;
  className?: string;
}

export function ConditionalCTA({ runwayMonths, className = '' }: ConditionalCTAProps) {
  const getCTAConfig = () => {
    if (runwayMonths <= 6) {
      return {
        title: 'Need Fundraising Help?',
        description: 'Your runway is critical. Get expert guidance on your pitch and fundraising strategy.',
        buttonText: 'Get Fundraising Help Now',
        href: 'https://idealift.ai?utm_source=runway_calculator&utm_medium=free-tool&utm_campaign=critical_runway',
        product: 'idealift',
        ctaId: 'critical_runway_cta',
        bgClass: 'bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30',
        buttonClass: 'bg-red-600 hover:bg-red-700',
      };
    }
    if (runwayMonths <= 12) {
      return {
        title: 'Plan Your Fundraise',
        description: 'Build your fundraising timeline and pitch strategy before you need capital urgently.',
        buttonText: 'Build Your Timeline',
        href: 'https://idealift.ai?utm_source=runway_calculator&utm_medium=free-tool&utm_campaign=moderate_runway',
        product: 'idealift',
        ctaId: 'moderate_runway_cta',
        bgClass: 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/30',
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
      };
    }
    return {
      title: 'Track Your Metrics',
      description: 'Monitor your runway, MRR, and key metrics with automated monthly insights.',
      buttonText: 'Get Monthly Checkups',
      href: 'https://idealift.ai?utm_source=runway_calculator&utm_medium=free-tool&utm_campaign=healthy_runway',
      product: 'idealift',
      ctaId: 'healthy_runway_cta',
      bgClass: 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30',
      buttonClass: 'bg-green-600 hover:bg-green-700',
    };
  };

  const config = getCTAConfig();

  const handleClick = () => {
    trackPaidProductClick(config.product, config.ctaId);
    trackCTAClick(config.ctaId, config.href);
    window.open(config.href, '_blank');
  };

  return (
    <div className={`rounded-xl p-6 border ${config.bgClass} ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{config.title}</h3>
          <p className="text-sm text-gray-300">{config.description}</p>
        </div>
        <button
          onClick={handleClick}
          className={`whitespace-nowrap px-6 py-2.5 rounded-lg font-medium text-white transition-colors ${config.buttonClass}`}
        >
          {config.buttonText}
        </button>
      </div>
    </div>
  );
}
