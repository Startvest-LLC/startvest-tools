'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  Line,
} from 'recharts';

interface RunwayData {
  month: number;
  label: string;
  cash: number;
  burn: number;
  revenue: number;
  netBurn: number;
}

interface RunwayChartProps {
  data: RunwayData[];
  fundraiseStartMonth: number;
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

export default function RunwayChart({ data, fundraiseStartMonth }: RunwayChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="label"
          stroke="#9CA3AF"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          interval={Math.floor(data.length / 8)}
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
        {fundraiseStartMonth > 0 && (
          <ReferenceLine
            x={data[fundraiseStartMonth]?.label}
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
  );
}
