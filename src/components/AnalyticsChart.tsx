/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { ShiftData } from '../types';
import { RUSSIAN_MONTH_SHORT } from '../utils';

interface AnalyticsChartProps {
  shifts: ShiftData;
  currentYear: number;
  currentMonth: number; // 0-11
}

type PeriodType = 'last12' | 'alltime';

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  shifts,
  currentYear,
  currentMonth,
}) => {
  const [period, setPeriod] = useState<PeriodType>('last12');

  const chartData = useMemo(() => {
    if (period === 'last12') {
      // Вычисляем последние 12 месяцев относительно выбранной даты
      const data = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
        
        // Суммируем смены за этот месяц
        let total = 0;
        Object.entries(shifts).forEach(([dateKey, val]) => {
          const count = val as number;
          if (dateKey.startsWith(monthKey)) {
            total += count;
          }
        });

        data.push({
          name: `${RUSSIAN_MONTH_SHORT[m]} ${String(y).slice(-2)}`,
          shifts: total,
          monthKey,
        });
      }
      return data;
    } else {
      // "За всё время": группируем все записи в базе
      const monthsMap: Record<string, number> = {};
      
      const dates = Object.keys(shifts).filter((d) => shifts[d] > 0);
      if (dates.length === 0) {
        // Если база пуста, показываем последние 6 месяцев как заглушку с 0 смен
        const data = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          const y = d.getFullYear();
          const m = d.getMonth();
          data.push({
            name: `${RUSSIAN_MONTH_SHORT[m]} ${String(y).slice(-2)}`,
            shifts: 0,
          });
        }
        return data;
      }

      // Находим диапазон дат в базе
      const yearsMonths = dates.map((d) => {
        const [y, m] = d.split('-');
        return { year: parseInt(y), month: parseInt(m) - 1 };
      });

      // Сортируем даты, чтобы найти границы диапазона
      let minDate = new Date(currentYear, currentMonth - 5, 1);
      let maxDate = new Date(currentYear, currentMonth, 1);

      if (yearsMonths.length > 0) {
        const sorted = yearsMonths.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));
        minDate = new Date(sorted[0].year, sorted[0].month, 1);
        maxDate = new Date(sorted[sorted.length - 1].year, sorted[sorted.length - 1].month, 1);
      }

      // Создаем наполненный массив всех месяцев от minDate до maxDate
      const data = [];
      const currentIter = new Date(minDate);
      while (currentIter <= maxDate || (data.length < 6)) { // Показываем не менее 6 точек
        const y = currentIter.getFullYear();
        const m = currentIter.getMonth();
        const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
        
        let total = 0;
        Object.entries(shifts).forEach(([dateKey, val]) => {
          const count = val as number;
          if (dateKey.startsWith(monthKey)) {
            total += count;
          }
        });

        data.push({
          name: `${RUSSIAN_MONTH_SHORT[m]} ${String(y).slice(-2)}`,
          shifts: total,
          monthKey,
        });

        currentIter.setMonth(currentIter.getMonth() + 1);
      }
      return data;
    }
  }, [shifts, currentYear, currentMonth, period]);

  // Вычисляем общую сумму смен за выбранный на графике период
  const totalPeriodShifts = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.shifts, 0);
  }, [chartData]);

  return (
    <div id="analytics-card" className="w-full rounded-2xl border border-zinc-800 bg-[#1a1a1e] p-5 sm:p-6 shadow-2xl shadow-black/40">
      
      {/* Шапка аналитики */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-0.5">Статистика активности</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Аналитика смен
          </h2>
        </div>

        {/* Переключатель периодов */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl scroll-p-1 select-none self-start">
          <button
            id="period-button-12"
            onClick={() => setPeriod('last12')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'last12'
                ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            За последние 12 месяцев
          </button>
          <button
            id="period-button-all"
            onClick={() => setPeriod('alltime')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              period === 'alltime'
                ? 'bg-emerald-500 text-black font-extrabold shadow-md shadow-emerald-500/10'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            За всё время
          </button>
        </div>
      </div>

      {/* Краткая информация над графиком */}
      <div className="mb-4 flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 p-3 rounded-xl">
        <BarChart2 className="h-5 w-5 text-indigo-400" />
        <div className="text-xs text-zinc-400">
          Всего смен за выбранный период:{' '}
          <span className="text-emerald-400 font-extrabold text-sm ml-1">
            {totalPeriodShifts.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
          </span>
        </div>
      </div>

      {/* График */}
      <div className="h-64 sm:h-72 w-full mt-2" id="chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -25, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={true}
                dx={-5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataName = payload[0].payload.name;
                    const val = payload[0].value;
                    return (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-xl backdrop-blur-sm">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">
                          {dataName}
                        </p>
                        <p className="text-sm font-black text-white flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Смен: <span className="text-emerald-400">{val}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="shifts"
                stroke="url(#line-gradient)"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: '#1a1a1e' }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
              />
              
              {/* Неоновый градиент для линии */}
              <defs>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
            Нет данных для построения графика
          </div>
        )}
      </div>
    </div>
  );
};
