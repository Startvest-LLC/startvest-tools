import { ChecklistTemplate, TemplateType } from './types';

export const LAUNCH_TEMPLATES: ChecklistTemplate[] = [
  {
    id: 'saas',
    name: 'SaaS Product Launch',
    description: 'Complete checklist for launching a SaaS application',
    icon: '🚀',
    items: [
      // Pre-Launch - Branding & Marketing
      { id: 'saas-001', text: 'Finalize product name and domain', category: 'pre-launch', critical: true },
      { id: 'saas-002', text: 'Create brand guidelines (logo, colors, typography)', category: 'pre-launch' },
      { id: 'saas-003', text: 'Design and build landing page', category: 'pre-launch', critical: true },
      { id: 'saas-004', text: 'Set up email capture / waitlist', category: 'pre-launch' },
      { id: 'saas-005', text: 'Write compelling value proposition', category: 'pre-launch', critical: true },
      { id: 'saas-006', text: 'Create social media profiles', category: 'pre-launch' },
      { id: 'saas-007', text: 'Prepare demo video or product tour', category: 'pre-launch' },
      { id: 'saas-008', text: 'Write launch announcement blog post', category: 'pre-launch' },

      // Pre-Launch - Legal & Compliance
      { id: 'saas-009', text: 'Draft Terms of Service', category: 'pre-launch', critical: true },
      { id: 'saas-010', text: 'Draft Privacy Policy', category: 'pre-launch', critical: true },
      { id: 'saas-011', text: 'Set up GDPR/CCPA compliance (cookie consent, data deletion)', category: 'pre-launch' },
      { id: 'saas-012', text: 'Register business entity if needed', category: 'pre-launch' },

      // Pre-Launch - Pricing & Billing
      { id: 'saas-013', text: 'Define pricing tiers and features', category: 'pre-launch', critical: true },
      { id: 'saas-014', text: 'Set up payment processing (Stripe, etc.)', category: 'pre-launch', critical: true },
      { id: 'saas-015', text: 'Create pricing page', category: 'pre-launch' },
      { id: 'saas-016', text: 'Test subscription flows end-to-end', category: 'pre-launch', critical: true },
      { id: 'saas-017', text: 'Set up invoicing and receipts', category: 'pre-launch' },

      // Pre-Launch - Technical
      { id: 'saas-018', text: 'Set up production environment', category: 'pre-launch', critical: true },
      { id: 'saas-019', text: 'Configure SSL certificates', category: 'pre-launch', critical: true },
      { id: 'saas-020', text: 'Set up error monitoring (Sentry, etc.)', category: 'pre-launch' },
      { id: 'saas-021', text: 'Configure analytics (GA4, Mixpanel, etc.)', category: 'pre-launch' },
      { id: 'saas-022', text: 'Set up status page', category: 'pre-launch' },
      { id: 'saas-023', text: 'Test authentication and authorization', category: 'pre-launch', critical: true },
      { id: 'saas-024', text: 'Set up database backups', category: 'pre-launch', critical: true },
      { id: 'saas-025', text: 'Configure CDN for static assets', category: 'pre-launch' },

      // Launch Day
      { id: 'saas-026', text: 'Final smoke test all critical paths', category: 'launch-day', critical: true },
      { id: 'saas-027', text: 'Post launch announcement on social media', category: 'launch-day' },
      { id: 'saas-028', text: 'Send email to waitlist', category: 'launch-day' },
      { id: 'saas-029', text: 'Submit to Product Hunt', category: 'launch-day' },
      { id: 'saas-030', text: 'Post in relevant communities (Reddit, HN, etc.)', category: 'launch-day' },
      { id: 'saas-031', text: 'Monitor error logs actively', category: 'launch-day', critical: true },
      { id: 'saas-032', text: 'Have support team on standby', category: 'launch-day' },
      { id: 'saas-033', text: 'Monitor server performance and scaling', category: 'launch-day' },
      { id: 'saas-034', text: 'Respond to comments and questions', category: 'launch-day' },

      // Post-Launch
      { id: 'saas-035', text: 'Set up user feedback collection', category: 'post-launch' },
      { id: 'saas-036', text: 'Monitor churn and engagement metrics', category: 'post-launch' },
      { id: 'saas-037', text: 'Respond to early user feedback', category: 'post-launch', critical: true },
      { id: 'saas-038', text: 'Create onboarding email sequence', category: 'post-launch' },
      { id: 'saas-039', text: 'Build knowledge base / help docs', category: 'post-launch' },
      { id: 'saas-040', text: 'Plan first iteration based on feedback', category: 'post-launch' },
      { id: 'saas-041', text: 'Set up customer success outreach', category: 'post-launch' },
      { id: 'saas-042', text: 'Analyze launch metrics and write retrospective', category: 'post-launch' },
    ],
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Launch',
    description: 'Launch checklist for iOS and Android applications',
    icon: '📱',
    items: [
      // Pre-Launch - App Store Preparation
      { id: 'mobile-001', text: 'Create Apple Developer account ($99/year)', category: 'pre-launch', critical: true },
      { id: 'mobile-002', text: 'Create Google Play Developer account ($25 one-time)', category: 'pre-launch', critical: true },
      { id: 'mobile-003', text: 'Design app icon (all required sizes)', category: 'pre-launch', critical: true },
      { id: 'mobile-004', text: 'Create app screenshots for all device sizes', category: 'pre-launch', critical: true },
      { id: 'mobile-005', text: 'Write compelling app description', category: 'pre-launch', critical: true },
      { id: 'mobile-006', text: 'Research and select keywords (ASO)', category: 'pre-launch' },
      { id: 'mobile-007', text: 'Create app preview video', category: 'pre-launch' },
      { id: 'mobile-008', text: 'Prepare promotional graphics for feature requests', category: 'pre-launch' },

      // Pre-Launch - Technical
      { id: 'mobile-009', text: 'Set up crash reporting (Firebase Crashlytics, etc.)', category: 'pre-launch', critical: true },
      { id: 'mobile-010', text: 'Configure analytics (Firebase, Amplitude, etc.)', category: 'pre-launch' },
      { id: 'mobile-011', text: 'Test on multiple device sizes and OS versions', category: 'pre-launch', critical: true },
      { id: 'mobile-012', text: 'Set up push notification infrastructure', category: 'pre-launch' },
      { id: 'mobile-013', text: 'Configure deep linking', category: 'pre-launch' },
      { id: 'mobile-014', text: 'Test in-app purchases (if applicable)', category: 'pre-launch', critical: true },
      { id: 'mobile-015', text: 'Verify app permissions are minimal and justified', category: 'pre-launch' },
      { id: 'mobile-016', text: 'Test offline functionality', category: 'pre-launch' },

      // Pre-Launch - Legal & Compliance
      { id: 'mobile-017', text: 'Create Privacy Policy (required for stores)', category: 'pre-launch', critical: true },
      { id: 'mobile-018', text: 'Create Terms of Service', category: 'pre-launch' },
      { id: 'mobile-019', text: 'Fill out App Privacy details (Apple)', category: 'pre-launch', critical: true },
      { id: 'mobile-020', text: 'Complete Data Safety form (Google)', category: 'pre-launch', critical: true },
      { id: 'mobile-021', text: 'Ensure COPPA compliance if targeting children', category: 'pre-launch' },

      // Pre-Launch - Marketing
      { id: 'mobile-022', text: 'Create landing page / website', category: 'pre-launch' },
      { id: 'mobile-023', text: 'Set up social media presence', category: 'pre-launch' },
      { id: 'mobile-024', text: 'Prepare press kit', category: 'pre-launch' },
      { id: 'mobile-025', text: 'Reach out to app review sites', category: 'pre-launch' },

      // Launch Day
      { id: 'mobile-026', text: 'Submit app for review (allow 1-7 days)', category: 'launch-day', critical: true },
      { id: 'mobile-027', text: 'Coordinate release timing (both stores if possible)', category: 'launch-day' },
      { id: 'mobile-028', text: 'Post launch announcement on social media', category: 'launch-day' },
      { id: 'mobile-029', text: 'Send launch email to waitlist', category: 'launch-day' },
      { id: 'mobile-030', text: 'Submit to Product Hunt', category: 'launch-day' },
      { id: 'mobile-031', text: 'Monitor crash reports actively', category: 'launch-day', critical: true },
      { id: 'mobile-032', text: 'Monitor app store reviews', category: 'launch-day' },
      { id: 'mobile-033', text: 'Be ready to release hotfix if needed', category: 'launch-day' },

      // Post-Launch
      { id: 'mobile-034', text: 'Respond to all app store reviews', category: 'post-launch' },
      { id: 'mobile-035', text: 'Analyze user behavior in analytics', category: 'post-launch' },
      { id: 'mobile-036', text: 'Set up A/B testing for store listing', category: 'post-launch' },
      { id: 'mobile-037', text: 'Plan and prioritize feature updates', category: 'post-launch' },
      { id: 'mobile-038', text: 'Request ratings from engaged users', category: 'post-launch' },
      { id: 'mobile-039', text: 'Monitor and improve retention metrics', category: 'post-launch' },
    ],
  },
  {
    id: 'open-source',
    name: 'Open Source Project',
    description: 'Launch checklist for open source libraries and tools',
    icon: '🔓',
    items: [
      // Pre-Launch - Repository Setup
      { id: 'oss-001', text: 'Choose an appropriate license (MIT, Apache, GPL, etc.)', category: 'pre-launch', critical: true },
      { id: 'oss-002', text: 'Write comprehensive README with examples', category: 'pre-launch', critical: true },
      { id: 'oss-003', text: 'Create CONTRIBUTING.md guide', category: 'pre-launch' },
      { id: 'oss-004', text: 'Add CODE_OF_CONDUCT.md', category: 'pre-launch' },
      { id: 'oss-005', text: 'Set up issue templates', category: 'pre-launch' },
      { id: 'oss-006', text: 'Set up pull request templates', category: 'pre-launch' },
      { id: 'oss-007', text: 'Create CHANGELOG.md', category: 'pre-launch' },
      { id: 'oss-008', text: 'Add .gitignore appropriate for project type', category: 'pre-launch' },

      // Pre-Launch - Documentation
      { id: 'oss-009', text: 'Write installation instructions', category: 'pre-launch', critical: true },
      { id: 'oss-010', text: 'Document API/usage with examples', category: 'pre-launch', critical: true },
      { id: 'oss-011', text: 'Set up documentation site (if needed)', category: 'pre-launch' },
      { id: 'oss-012', text: 'Add badges (build status, npm version, etc.)', category: 'pre-launch' },

      // Pre-Launch - Quality & CI
      { id: 'oss-013', text: 'Write tests with good coverage', category: 'pre-launch', critical: true },
      { id: 'oss-014', text: 'Set up CI/CD pipeline (GitHub Actions, etc.)', category: 'pre-launch' },
      { id: 'oss-015', text: 'Configure linting and formatting', category: 'pre-launch' },
      { id: 'oss-016', text: 'Set up semantic versioning', category: 'pre-launch' },
      { id: 'oss-017', text: 'Test on multiple platforms/versions if applicable', category: 'pre-launch' },

      // Pre-Launch - Publishing
      { id: 'oss-018', text: 'Create package manager account (npm, PyPI, etc.)', category: 'pre-launch', critical: true },
      { id: 'oss-019', text: 'Reserve package name', category: 'pre-launch', critical: true },
      { id: 'oss-020', text: 'Set up automated publishing workflow', category: 'pre-launch' },

      // Launch Day
      { id: 'oss-021', text: 'Publish first stable version (1.0.0)', category: 'launch-day', critical: true },
      { id: 'oss-022', text: 'Post on Hacker News', category: 'launch-day' },
      { id: 'oss-023', text: 'Post on Reddit (relevant subreddits)', category: 'launch-day' },
      { id: 'oss-024', text: 'Tweet/post announcement', category: 'launch-day' },
      { id: 'oss-025', text: 'Submit to newsletters (JavaScript Weekly, etc.)', category: 'launch-day' },
      { id: 'oss-026', text: 'Add to awesome-* lists if applicable', category: 'launch-day' },
      { id: 'oss-027', text: 'Monitor GitHub issues for first users', category: 'launch-day' },

      // Post-Launch
      { id: 'oss-028', text: 'Respond to issues and PRs promptly', category: 'post-launch', critical: true },
      { id: 'oss-029', text: 'Welcome first-time contributors', category: 'post-launch' },
      { id: 'oss-030', text: 'Tag good first issues for newcomers', category: 'post-launch' },
      { id: 'oss-031', text: 'Write blog post about the project', category: 'post-launch' },
      { id: 'oss-032', text: 'Set up GitHub Sponsors or Open Collective', category: 'post-launch' },
      { id: 'oss-033', text: 'Plan roadmap based on community feedback', category: 'post-launch' },
    ],
  },
  {
    id: 'marketplace',
    name: 'Marketplace / E-commerce',
    description: 'Launch checklist for online marketplaces and stores',
    icon: '🛒',
    items: [
      // Pre-Launch - Platform Setup
      { id: 'market-001', text: 'Choose and set up e-commerce platform', category: 'pre-launch', critical: true },
      { id: 'market-002', text: 'Configure payment gateway (Stripe, PayPal, etc.)', category: 'pre-launch', critical: true },
      { id: 'market-003', text: 'Set up shipping options and rates', category: 'pre-launch', critical: true },
      { id: 'market-004', text: 'Configure tax settings by region', category: 'pre-launch', critical: true },
      { id: 'market-005', text: 'Set up inventory management', category: 'pre-launch' },
      { id: 'market-006', text: 'Configure order notification emails', category: 'pre-launch' },

      // Pre-Launch - Catalog
      { id: 'market-007', text: 'Add all products with descriptions', category: 'pre-launch', critical: true },
      { id: 'market-008', text: 'Upload high-quality product images', category: 'pre-launch', critical: true },
      { id: 'market-009', text: 'Set up product categories and filters', category: 'pre-launch' },
      { id: 'market-010', text: 'Configure product variants (size, color, etc.)', category: 'pre-launch' },
      { id: 'market-011', text: 'Write SEO-optimized product titles and descriptions', category: 'pre-launch' },
      { id: 'market-012', text: 'Set up related products / cross-selling', category: 'pre-launch' },

      // Pre-Launch - Legal & Trust
      { id: 'market-013', text: 'Create return and refund policy', category: 'pre-launch', critical: true },
      { id: 'market-014', text: 'Create shipping policy', category: 'pre-launch', critical: true },
      { id: 'market-015', text: 'Create Privacy Policy', category: 'pre-launch', critical: true },
      { id: 'market-016', text: 'Create Terms of Service', category: 'pre-launch', critical: true },
      { id: 'market-017', text: 'Add trust badges and security seals', category: 'pre-launch' },
      { id: 'market-018', text: 'Set up SSL certificate', category: 'pre-launch', critical: true },

      // Pre-Launch - Marketing
      { id: 'market-019', text: 'Set up email marketing (Klaviyo, Mailchimp, etc.)', category: 'pre-launch' },
      { id: 'market-020', text: 'Create abandoned cart email sequence', category: 'pre-launch' },
      { id: 'market-021', text: 'Set up Google Analytics and e-commerce tracking', category: 'pre-launch' },
      { id: 'market-022', text: 'Install Facebook Pixel / conversion tracking', category: 'pre-launch' },
      { id: 'market-023', text: 'Create social media accounts', category: 'pre-launch' },
      { id: 'market-024', text: 'Plan launch promotion / discount', category: 'pre-launch' },

      // Pre-Launch - Testing
      { id: 'market-025', text: 'Test complete checkout flow', category: 'pre-launch', critical: true },
      { id: 'market-026', text: 'Test on mobile devices', category: 'pre-launch', critical: true },
      { id: 'market-027', text: 'Test payment processing (use test mode)', category: 'pre-launch', critical: true },
      { id: 'market-028', text: 'Test shipping calculations', category: 'pre-launch' },
      { id: 'market-029', text: 'Test order confirmation emails', category: 'pre-launch' },

      // Launch Day
      { id: 'market-030', text: 'Switch payment gateway to live mode', category: 'launch-day', critical: true },
      { id: 'market-031', text: 'Announce launch on social media', category: 'launch-day' },
      { id: 'market-032', text: 'Send launch email to subscribers', category: 'launch-day' },
      { id: 'market-033', text: 'Activate launch promotion/discount', category: 'launch-day' },
      { id: 'market-034', text: 'Monitor orders in real-time', category: 'launch-day', critical: true },
      { id: 'market-035', text: 'Be ready for customer support inquiries', category: 'launch-day' },
      { id: 'market-036', text: 'Monitor inventory levels', category: 'launch-day' },

      // Post-Launch
      { id: 'market-037', text: 'Follow up with first customers for reviews', category: 'post-launch' },
      { id: 'market-038', text: 'Analyze conversion rate and drop-off points', category: 'post-launch' },
      { id: 'market-039', text: 'Set up retargeting ads', category: 'post-launch' },
      { id: 'market-040', text: 'Create post-purchase email sequence', category: 'post-launch' },
      { id: 'market-041', text: 'Plan and schedule regular promotions', category: 'post-launch' },
      { id: 'market-042', text: 'Set up loyalty / rewards program', category: 'post-launch' },
    ],
  },
];

export function getTemplate(id: TemplateType): ChecklistTemplate | undefined {
  return LAUNCH_TEMPLATES.find(t => t.id === id);
}
