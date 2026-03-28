'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SkillData {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  data: SkillData[];
  size?: number;
  color?: string;
}

export function RadarChart({ data, size = 200, color = '#818CF8' }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const angleStep = (Math.PI * 2) / data.length;

  const points = useMemo(() => {
    return data.map((d, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (d.value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    });
  }, [data, radius, center, angleStep]);

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Background levels (circles/polygons)
  const levels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grids */}
        {levels.map((l, idx) => (
          <path
            key={idx}
            d={data.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = l * radius;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ' Z'}
            fill="none"
            stroke="currentColor"
            className="text-muted-foreground/10"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-muted-foreground/10"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Polygon */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          points={polygonPath}
          fill={color}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          d={`M ${points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const r = radius + 15;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={Math.abs(x - center) < 10 ? 'middle' : x < center ? 'end' : 'start'}
              dominantBaseline="middle"
              className="text-[9px] font-black uppercase tracking-tighter fill-muted-foreground/60"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
