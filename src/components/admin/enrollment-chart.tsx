"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function EnrollmentChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="enroll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6d5ef6" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#6d5ef6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="#7a80a8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#7a80a8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: "#2a2e4a" }}
          contentStyle={{
            background: "#14162b",
            border: "1px solid #2a2e4a",
            borderRadius: 12,
            color: "#f5f5f7",
            fontSize: 13,
          }}
          labelStyle={{ color: "#9aa0c0" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Enrollments"
          stroke="#6d5ef6"
          strokeWidth={2}
          fill="url(#enroll)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
