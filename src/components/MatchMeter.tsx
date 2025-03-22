// components/MatchMeter.tsx
"use client";
import { motion } from "framer-motion";

interface MatchMeterProps {
  value: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function MatchMeter({
  value,
  label,
  size = 120,
  strokeWidth = 10,
}: MatchMeterProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <motion.svg
          className="absolute top-0 left-0"
          initial={{ rotate: -90 }}
          style={{ width: size, height: size }}
        >
          <circle
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <motion.circle
            className="text-gradient-to-r from-blue-500 to-purple-500"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={progress}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: value / 100 }}
            transition={{ duration: 1 }}
          />
        </motion.svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
