'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { trackSignupClick, trackPaidProductClick, trackCTAClick } from '@/lib/analytics';

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  trackingType: 'signup' | 'paid_product' | 'cta';
  trackingSource: string;
  trackingProduct?: string;
  external?: boolean;
}

export function TrackedLink({
  href,
  children,
  className,
  trackingType,
  trackingSource,
  trackingProduct,
  external = false,
}: TrackedLinkProps) {
  const handleClick = () => {
    switch (trackingType) {
      case 'signup':
        trackSignupClick(trackingSource);
        break;
      case 'paid_product':
        trackPaidProductClick(trackingProduct || 'unknown', trackingSource);
        break;
      case 'cta':
        trackCTAClick(trackingSource, href);
        break;
    }
  };

  if (external) {
    return (
      <a
        href={href}
        className={className}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
