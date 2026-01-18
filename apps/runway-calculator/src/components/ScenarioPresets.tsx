'use client';

import { trackToolUse } from '@/lib/analytics';

interface Scenario {
  id: string;
  name: string;
  description: string;
  values: {
    cashBalance: string;
    monthlyBurn: string;
    monthlyRevenue: string;
    burnGrowthRate: string;
    revenueGrowthRate: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: 'typical-saas',
    name: 'Typical SaaS',
    description: 'Seed-funded with MRR',
    values: {
      cashBalance: '1000000',
      monthlyBurn: '80000',
      monthlyRevenue: '20000',
      burnGrowthRate: '3',
      revenueGrowthRate: '15',
    },
  },
  {
    id: 'pre-revenue',
    name: 'Pre-Revenue',
    description: 'Building product, no revenue',
    values: {
      cashBalance: '500000',
      monthlyBurn: '40000',
      monthlyRevenue: '0',
      burnGrowthRate: '5',
      revenueGrowthRate: '0',
    },
  },
  {
    id: 'bootstrapped',
    name: 'Bootstrapped',
    description: 'Revenue-funded, lean',
    values: {
      cashBalance: '100000',
      monthlyBurn: '15000',
      monthlyRevenue: '12000',
      burnGrowthRate: '2',
      revenueGrowthRate: '8',
    },
  },
  {
    id: 'series-a',
    name: 'Series A',
    description: 'Growth stage, scaling',
    values: {
      cashBalance: '5000000',
      monthlyBurn: '250000',
      monthlyRevenue: '100000',
      burnGrowthRate: '5',
      revenueGrowthRate: '12',
    },
  },
];

interface ScenarioPresetsProps {
  onSelect: (values: Scenario['values']) => void;
  className?: string;
}

export function ScenarioPresets({ onSelect, className = '' }: ScenarioPresetsProps) {
  const handleSelect = (scenario: Scenario) => {
    trackToolUse('runway_calculator', 'scenario_preset', { scenario: scenario.id });
    onSelect(scenario.values);
  };

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-400 mb-2">Quick Start Scenarios</h3>
      <div className="grid grid-cols-2 gap-2">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleSelect(scenario)}
            className="text-left p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
          >
            <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
              {scenario.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{scenario.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
