'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 220 }) => {
  const radius = size / 2;
  const stroke = 20;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Color logic
  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // emerald-500
    if (s >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const color = getColor(score);

  return (
    <div className="gauge-container relative flex flex-col items-center justify-end overflow-hidden" 
         style={{ width: size, height: size / 2 }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-180 absolute -bottom-1"
      >
        {/* Background circle arc */}
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference / 2}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
        {/* Progress circle arc */}
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 200) * circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
