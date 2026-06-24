/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar as CalendarIcon, Briefcase, TrendingUp } from 'lucide-react';
import { RUSSIAN_MONTHS } from '../utils';

interface HeaderStatsProps {
  currentYear: number;
  currentMonth: number; // 0-11
  totalShiftsInMonth: number;
  totalWorkingDaysInMonth: number;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  currentYear,
  currentMonth,
  totalShiftsInMonth,
  totalWorkingDaysInMonth,
}) => {
  const monthName = RUSSIAN_MONTHS[currentMonth];
  const averageLoad = totalWorkingDaysInMonth > 0 
    ? (totalShiftsInMonth / totalWorkingDaysInMonth).toFixed(1) 
    : '0.0';

  return (
    <div id="stats-header" className="w-full relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#1a1a1e] p-6 sm:p-8 shadow-2xl shadow-black/40">
      {/* Декоративный размытый градиентный фон */}
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-[60px]" />
      <div className="absolute left-1/3 bottom-0 -mb-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-[60px]" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Дашборд онлайн
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            {monthName} <span className="text-zinc-500 text-2xl font-light">{currentYear}</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Интерактивный трекер для планирования и учета ваших рабочих смен
          </p>
        </div>

        {/* Сетка со статистикой */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 min-w-full md:min-w-[450px]">
          {/* Всего смен */}
          <div id="stat-total-shifts" className="flex flex-col p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1 font-medium">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
              <span>Всего смен</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline">
              {totalShiftsInMonth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">за этот месяц</div>
          </div>

          {/* Рабочих дней */}
          <div id="stat-working-days" className="flex flex-col p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1 font-medium">
              <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>Рабочих дней</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {totalWorkingDaysInMonth}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">активных дат</div>
          </div>

          {/* Средняя загрузка */}
          <div id="stat-average-load" className="flex flex-col p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-300">
            <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-sky-400" />
              <span>Ср. нагрузка</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {averageLoad}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1">смен / раб. день</div>
          </div>
        </div>
      </div>
    </div>
  );
};
