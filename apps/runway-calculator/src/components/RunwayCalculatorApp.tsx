'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { trackExport } from '@/lib/analytics';
import { ShareButtons } from './ShareButtons';
import { ScenarioPresets } from './ScenarioPresets';
import { ConditionalCTA } from './ConditionalCTA';
import { EmailCapture } from './EmailCapture';
import { decodeRunwayState, generateShareableUrl, type RunwayState } from '@/lib/url-state';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';

interface RunwayData {
  month: number;
  label: string;
  cash: number;
  burn: number;
  revenue: number;
  netBurn: number;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function RunwayCalculatorApp() {
  const [cashBalance, setCashBalance] = useState<string>('500000');
  const [monthlyBurn, setMonthlyBurn] = useState<string>('50000');
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>('10000');
  const [burnGrowthRate, setBurnGrowthRate] = useState<string>('2');
  const [revenueGrowthRate, setRevenueGrowthRate] = useState<string>('10');
  const [projectionMonths, setProjectionMonths] = useState<string>('24');
  const printRef = useRef<HTMLDivElement>(null);

  // Load state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (encoded) {
      const state = decodeRunwayState(encoded);
      if (state) {
        setCashBalance(state.cashBalance);
        setMonthlyBurn(state.monthlyBurn);
        setMonthlyRevenue(state.monthlyRevenue);
        setBurnGrowthRate(state.burnGrowthRate);
        setRevenueGrowthRate(state.revenueGrowthRate);
        setProjectionMonths(state.projectionMonths);
      }
    }
  }, []);

  // Generate shareable URL
  const shareableUrl = useMemo(() => {
    const state: RunwayState = {
      cashBalance,
      monthlyBurn,
      monthlyRevenue,
      burnGrowthRate,
      revenueGrowthRate,
      projectionMonths,
    };
    return generateShareableUrl(state);
  }, [cashBalance, monthlyBurn, monthlyRevenue, burnGrowthRate, revenueGrowthRate, projectionMonths]);

  // Handle scenario preset selection
  const handleScenarioSelect = (values: {
    cashBalance: string;
    monthlyBurn: string;
    monthlyRevenue: string;
    burnGrowthRate: string;
    revenueGrowthRate: string;
  }) => {
    setCashBalance(values.cashBalance);
    setMonthlyBurn(values.monthlyBurn);
    setMonthlyRevenue(values.monthlyRevenue);
    setBurnGrowthRate(values.burnGrowthRate);
    setRevenueGrowthRate(values.revenueGrowthRate);
  };

  const calculations = useMemo(() => {
    const cash = parseFloat(cashBalance) || 0;
    const burn = parseFloat(monthlyBurn) || 0;
    const revenue = parseFloat(monthlyRevenue) || 0;
    const burnGrowth = (parseFloat(burnGrowthRate) || 0) / 100;
    const revenueGrowth = (parseFloat(revenueGrowthRate) || 0) / 100;
    const months = parseInt(projectionMonths) || 24;

    const data: RunwayData[] = [];
    let currentCash = cash;
    let currentBurn = burn;
    let currentRevenue = revenue;
    let runwayMonths = 0;
    let zeroCashDate: Date | null = null;
    let foundZero = false;

    const today = new Date();

    for (let i = 0; i <= months; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const label = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const netBurn = currentBurn - currentRevenue;

      data.push({
        month: i,
        label,
        cash: Math.max(0, currentCash),
        burn: currentBurn,
        revenue: currentRevenue,
        netBurn: netBurn,
      });

      if (currentCash > 0 && !foundZero) {
        runwayMonths = i;
        if (currentCash - netBurn <= 0) {
          foundZero = true;
          zeroCashDate = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
        }
      }

      currentCash -= netBurn;
      currentBurn *= 1 + burnGrowth;
      currentRevenue *= 1 + revenueGrowth;
    }

    if (!foundZero && currentCash > 0) {
      runwayMonths = months;
    }

    // Calculate when to start fundraising (6 months before runway ends)
    const fundraiseStartMonth = Math.max(0, runwayMonths - 6);
    const fundraiseDate = new Date(today.getFullYear(), today.getMonth() + fundraiseStartMonth, 1);

    // Calculate months to profitability
    let profitabilityMonth: number | null = null;
    let currentBurnCheck = burn;
    let currentRevenueCheck = revenue;
    for (let i = 0; i <= 60; i++) {
      if (currentRevenueCheck >= currentBurnCheck) {
        profitabilityMonth = i;
        break;
      }
      currentBurnCheck *= 1 + burnGrowth;
      currentRevenueCheck *= 1 + revenueGrowth;
    }

    const initialNetBurn = burn - revenue;
    const defaultRunway = initialNetBurn > 0 ? Math.floor(cash / initialNetBurn) : Infinity;

    return {
      data,
      runwayMonths: foundZero ? runwayMonths : (currentCash > 0 ? months : runwayMonths),
      zeroCashDate,
      fundraiseDate,
      fundraiseStartMonth,
      profitabilityMonth,
      initialNetBurn,
      defaultRunway,
      willReachProfitability: profitabilityMonth !== null && (profitabilityMonth < runwayMonths || !foundZero),
    };
  }, [cashBalance, monthlyBurn, monthlyRevenue, burnGrowthRate, revenueGrowthRate, projectionMonths]);

  const handlePrint = () => {
    trackExport('print', 'runway_calculator');
    window.print();
  };

  const exportToMarkdown = () => {
    trackExport('markdown', 'runway_calculator');
    const cash = parseFloat(cashBalance) || 0;
    const burn = parseFloat(monthlyBurn) || 0;
    const revenue = parseFloat(monthlyRevenue) || 0;

    let md = `# Startup Runway Analysis\n\n`;
    md += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    md += `## Financial Inputs\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Current Cash Balance | ${formatFullCurrency(cash)} |\n`;
    md += `| Monthly Burn Rate | ${formatFullCurrency(burn)} |\n`;
    md += `| Monthly Revenue | ${formatFullCurrency(revenue)} |\n`;
    md += `| Net Monthly Burn | ${formatFullCurrency(calculations.initialNetBurn)} |\n`;
    md += `| Burn Growth Rate | ${burnGrowthRate}% |\n`;
    md += `| Revenue Growth Rate | ${revenueGrowthRate}% |\n\n`;

    md += `## Runway Analysis\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| **Runway (Months)** | **${calculations.runwayMonths}** |\n`;
    if (calculations.zeroCashDate) {
      md += `| Zero Cash Date | ${calculations.zeroCashDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} |\n`;
    }
    md += `| Start Fundraising By | ${calculations.fundraiseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} |\n`;
    if (calculations.profitabilityMonth !== null) {
      md += `| Months to Profitability | ${calculations.profitabilityMonth} |\n`;
    }
    md += `\n`;

    md += `## Recommendations\n\n`;
    if (calculations.runwayMonths <= 6) {
      md += `- **URGENT:** Your runway is critically low. Begin fundraising immediately.\n`;
    } else if (calculations.runwayMonths <= 12) {
      md += `- Your runway is getting short. Start fundraising conversations now.\n`;
    } else {
      md += `- Healthy runway. Plan to start fundraising by ${calculations.fundraiseDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.\n`;
    }

    if (calculations.willReachProfitability) {
      md += `- At current growth rates, you may reach profitability before running out of cash.\n`;
    } else if (calculations.profitabilityMonth !== null) {
      md += `- At current growth rates, profitability would take ${calculations.profitabilityMonth} months - longer than your runway.\n`;
    }

    md += `\n## Monthly Projections\n\n`;
    md += `| Month | Cash | Burn | Revenue | Net Burn |\n`;
    md += `|-------|------|------|---------|----------|\n`;
    calculations.data.slice(0, 13).forEach((d) => {
      md += `| ${d.label} | ${formatFullCurrency(d.cash)} | ${formatFullCurrency(d.burn)} | ${formatFullCurrency(d.revenue)} | ${formatFullCurrency(d.netBurn)} |\n`;
    });

    md += `\n---\n*Generated with [Startup Runway Calculator](https://runway.startvest.ai)*\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'runway-analysis.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRunwayColor = () => {
    if (calculations.runwayMonths <= 6) return 'text-red-400';
    if (calculations.runwayMonths <= 12) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRunwayBgColor = () => {
    if (calculations.runwayMonths <= 6) return 'bg-red-500/20 border-red-500/50';
    if (calculations.runwayMonths <= 12) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-green-500/20 border-green-500/50';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto" ref={printRef}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Startup Runway Calculator
          </h1>
          <p className="text-gray-400">
            Calculate how long your funding will last and plan your next fundraise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4 no-print">
            {/* Scenario Presets */}
            <ScenarioPresets onSelect={handleScenarioSelect} className="mb-4" />

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4 text-blue-300">Financial Inputs</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Cash Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={cashBalance}
                      onChange={(e) => setCashBalance(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-8 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="500000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Burn Rate</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={monthlyBurn}
                      onChange={(e) => setMonthlyBurn(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-8 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Revenue</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-8 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4 text-purple-300">Growth Projections</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Burn Growth Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={burnGrowthRate}
                      onChange={(e) => setBurnGrowthRate(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-purple-500"
                      placeholder="2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">How fast your expenses grow monthly</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Monthly Revenue Growth Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={revenueGrowthRate}
                      onChange={(e) => setRevenueGrowthRate(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-purple-500"
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Expected monthly revenue growth</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Projection Period</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={projectionMonths}
                      onChange={(e) => setProjectionMonths(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 pr-16 text-white focus:outline-none focus:border-purple-500"
                      placeholder="24"
                      min="6"
                      max="60"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">months</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <button
                onClick={exportToMarkdown}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Export Markdown
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Print / PDF
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`rounded-xl p-4 border ${getRunwayBgColor()}`}>
                <div className="text-sm text-gray-400 mb-1">Runway</div>
                <div className={`text-3xl font-bold ${getRunwayColor()}`}>
                  {calculations.runwayMonths}
                  <span className="text-lg font-normal ml-1">mo</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Net Burn</div>
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(calculations.initialNetBurn)}
                  <span className="text-sm font-normal">/mo</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Zero Cash Date</div>
                <div className="text-lg font-bold text-white">
                  {calculations.zeroCashDate
                    ? calculations.zeroCashDate.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Start Fundraising</div>
                <div className="text-lg font-bold text-blue-400">
                  {calculations.fundraiseDate.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <ShareButtons
              runwayMonths={calculations.runwayMonths}
              shareableUrl={shareableUrl}
              className="mb-2"
            />

            {/* Chart */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Cash Runway Projection</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={calculations.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="label"
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      interval={Math.floor(calculations.data.length / 8)}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        formatFullCurrency(value),
                        name === 'cash'
                          ? 'Cash Balance'
                          : name === 'burn'
                          ? 'Burn Rate'
                          : name === 'revenue'
                          ? 'Revenue'
                          : 'Net Burn',
                      ]}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cash"
                      name="Cash Balance"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="burn"
                      name="Burn Rate"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                    {calculations.fundraiseStartMonth > 0 && (
                      <ReferenceLine
                        x={calculations.data[calculations.fundraiseStartMonth]?.label}
                        stroke="#F59E0B"
                        strokeDasharray="5 5"
                        label={{
                          value: 'Start Fundraising',
                          position: 'top',
                          fill: '#F59E0B',
                          fontSize: 12,
                        }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold mb-4">Recommendations</h2>
              <div className="space-y-3">
                {calculations.runwayMonths <= 6 && (
                  <div className="flex items-start gap-3 p-3 bg-red-500/20 rounded-lg border border-red-500/50">
                    <span className="text-red-400 text-xl">!</span>
                    <div>
                      <div className="font-medium text-red-400">Critical: Low Runway</div>
                      <div className="text-sm text-gray-300">
                        With only {calculations.runwayMonths} months of runway, you should begin fundraising
                        immediately. Most fundraising processes take 3-6 months.
                      </div>
                    </div>
                  </div>
                )}

                {calculations.runwayMonths > 6 && calculations.runwayMonths <= 12 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/50">
                    <span className="text-yellow-400 text-xl">!</span>
                    <div>
                      <div className="font-medium text-yellow-400">Caution: Limited Runway</div>
                      <div className="text-sm text-gray-300">
                        With {calculations.runwayMonths} months of runway, you should start fundraising
                        conversations now. Build relationships with investors before you need capital urgently.
                      </div>
                    </div>
                  </div>
                )}

                {calculations.runwayMonths > 12 && (
                  <div className="flex items-start gap-3 p-3 bg-green-500/20 rounded-lg border border-green-500/50">
                    <span className="text-green-400 text-xl">&#10003;</span>
                    <div>
                      <div className="font-medium text-green-400">Healthy Runway</div>
                      <div className="text-sm text-gray-300">
                        You have {calculations.runwayMonths} months of runway. Plan to start fundraising by{' '}
                        {calculations.fundraiseDate.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        to maintain leverage in negotiations.
                      </div>
                    </div>
                  </div>
                )}

                {calculations.willReachProfitability && (
                  <div className="flex items-start gap-3 p-3 bg-blue-500/20 rounded-lg border border-blue-500/50">
                    <span className="text-blue-400 text-xl">&#9733;</span>
                    <div>
                      <div className="font-medium text-blue-400">Path to Profitability</div>
                      <div className="text-sm text-gray-300">
                        At current growth rates, you could reach profitability in {calculations.profitabilityMonth}{' '}
                        months, before your runway ends. Focus on maintaining growth momentum.
                      </div>
                    </div>
                  </div>
                )}

                {!calculations.willReachProfitability && calculations.profitabilityMonth !== null && (
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-gray-400 text-xl">i</span>
                    <div>
                      <div className="font-medium text-gray-300">Profitability Timeline</div>
                      <div className="text-sm text-gray-400">
                        At current growth rates, profitability would take {calculations.profitabilityMonth} months.
                        Consider accelerating revenue growth or extending runway through fundraising.
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-gray-400 text-xl">$</span>
                  <div>
                    <div className="font-medium text-gray-300">Quick Math</div>
                    <div className="text-sm text-gray-400">
                      At a constant {formatCurrency(calculations.initialNetBurn)}/mo net burn (no growth), your{' '}
                      {formatCurrency(parseFloat(cashBalance) || 0)} would last approximately{' '}
                      {calculations.defaultRunway === Infinity ? '∞' : calculations.defaultRunway} months.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Projection Table */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 overflow-x-auto">
              <h2 className="text-lg font-semibold mb-4">Monthly Projections</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-gray-400">Month</th>
                    <th className="text-right py-2 px-3 text-gray-400">Cash Balance</th>
                    <th className="text-right py-2 px-3 text-gray-400">Burn Rate</th>
                    <th className="text-right py-2 px-3 text-gray-400">Revenue</th>
                    <th className="text-right py-2 px-3 text-gray-400">Net Burn</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.data.slice(0, 13).map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-white/5 ${
                        row.cash === 0 ? 'bg-red-500/10' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-gray-300">{row.label}</td>
                      <td className="text-right py-2 px-3 font-medium text-blue-400">
                        {formatFullCurrency(row.cash)}
                      </td>
                      <td className="text-right py-2 px-3 text-red-400">
                        {formatFullCurrency(row.burn)}
                      </td>
                      <td className="text-right py-2 px-3 text-green-400">
                        {formatFullCurrency(row.revenue)}
                      </td>
                      <td className="text-right py-2 px-3 text-gray-300">
                        {formatFullCurrency(row.netBurn)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {calculations.data.length > 13 && (
                <p className="text-gray-500 text-sm mt-2 text-center">
                  Showing first 12 months. Export to see full projection.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Conditional CTA based on runway status */}
        <ConditionalCTA runwayMonths={calculations.runwayMonths} className="mt-6" />

        {/* Email Capture */}
        <EmailCapture className="mt-6" />

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Built by{' '}
            <a href="https://startvest.ai" className="text-blue-400 hover:underline">
              StartVest.ai
            </a>{' '}
            &mdash; Free tools for startup founders
          </p>
        </div>
      </div>
    </div>
  );
}
