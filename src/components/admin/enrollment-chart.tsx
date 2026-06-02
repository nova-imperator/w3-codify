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
            <stop offset="0%" stopColor="#ff5a1f" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#ff5a1f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="#6b6b73"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="#6b6b73" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: "#26262b" }}
          contentStyle={{
            background: "#121214",
            border: "1px solid #26262b",
            borderRadius: 12,
            color: "#f5f5f7",
            fontSize: 13,
          }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="Enrollments"
          stroke="#ff5a1f"
          strokeWidth={2}
          fill="url(#enroll)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
