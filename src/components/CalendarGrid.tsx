/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import { RUSSIAN_MONTHS, RUSSIAN_WEEKDAYS } from '../utils';
import { ShiftData } from '../types';

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number; // 0-11
  shifts: ShiftData;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentYear,
  currentMonth,
  shifts,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}) => {
  // Вычисляем первую дату и день недели первого числа текущего месяца
  const firstDay = new Date(currentYear, currentMonth, 1);
  // getDay() возвращает: 0 - Вс, 1 - Пн ... 6 - Сб
  // Для Пн-Вс: (day + 6) % 7
  const startDayIndex = (firstDay.getDay() + 6) % 7;

  // Количество дней в текущем месяце
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Количество дней в предыдущем месяце
  const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  // Дни предыдущего месяца для заполнения пустых ячеек в начале сетки
  const prevMonthCells = [];
  for (let i = startDayIndex - 1; i >= 0; i--) {
    prevMonthCells.push(prevTotalDays - i);
  }

  // Дни текущего месяца
  const currentMonthCells = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Общее количество ячеек в сетке (должно быть кратно 7, обычно 35 или 42)
  const totalCellsCount = prevMonthCells.length + currentMonthCells.length;
  const nextMonthCellsCount = totalCellsCount % 7 === 0 ? 0 : 7 - (totalCellsCount % 7);
  const nextMonthCells = Array.from({ length: nextMonthCellsCount }, (_, i) => i + 1);

  // Функция для форматирования даты в "YYYY-MM-DD"
  const formatDateKey = (dayNum: number): string => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
  };

  // Проверка сегодняшней даты
  const isToday = (dayNum: number): boolean => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  return (
    <div id="calendar-card" className="w-full rounded-2xl border border-zinc-800 bg-[#1a1a1e] p-5 sm:p-6 shadow-2xl shadow-black/40">
      
      {/* Шапка календаря с навигацией */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-0.5">Календарь дней</span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {RUSSIAN_MONTHS[currentMonth]}
            <span className="text-zinc-500 font-light">{currentYear}</span>
          </h2>
        </div>
        
        {/* Кнопки переключения месяцев */}
        <div className="flex items-center gap-1.5 bg-zinc-90 w/40 p-1 rounded-xl border border-zinc-800">
          <button
            id="prev-month-btn"
            onClick={onPrevMonth}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg active:scale-90 transition-all duration-150 cursor-pointer"
            title="Предыдущий месяц"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            id="today-btn"
            onClick={() => {
              const d = new Date();
              // Переход на сегодня вызовет обновление стейта в родителе
              const rootRefresh = (window as any).__setCalendarToToday;
              if (rootRefresh) rootRefresh();
            }}
            className="px-3 py-1 text-xs font-semibold text-zinc-350 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-all cursor-pointer"
          >
            Сегодня
          </button>

          <button
            id="next-month-btn"
            onClick={onNextMonth}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-lg active:scale-90 transition-all duration-150 cursor-pointer"
            title="Следующий месяц"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Сетка дней недели */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
        {RUSSIAN_WEEKDAYS.map((dayName, idx) => {
          const isWeekend = idx === 5 || idx === 6; // Сб, Вс
          return (
            <div
              key={dayName}
              className={`text-center text-xs font-bold py-2 rounded-lg ${
                isWeekend ? 'text-rose-400/80' : 'text-zinc-500'
              }`}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Сетка ячеек календаря */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {/* Дни предыдущего месяца (неактивные) */}
        {prevMonthCells.map((dayNum, index) => (
          <div
            key={`prev-${index}`}
            className="aspect-square flex flex-col items-center justify-center rounded-xl bg-zinc-900/10 border border-transparent text-zinc-750 text-xs opacity-25 select-none pointer-events-none"
          >
            {dayNum}
          </div>
        ))}

        {/* Дни текущего месяца (интерактивные) */}
        {currentMonthCells.map((dayNum) => {
          const dateKey = formatDateKey(dayNum);
          const shiftCount = shifts[dateKey] || 0;
          const hasShifts = shiftCount > 0;
          const currentIsToday = isToday(dayNum);

          return (
            <button
              key={`day-${dayNum}`}
              id={`day-cell-${dateKey}`}
              onClick={() => onDayClick(dateKey)}
              className={`aspect-square relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl border cursor-pointer select-none outline-none group hover:scale-[1.03] active:scale-95 transition-all duration-200 ${
                hasShifts
                  ? 'border-emerald-500/80 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
                  : currentIsToday
                  ? 'border-indigo-500/60 bg-zinc-900 text-white'
                  : 'border-zinc-800/60 bg-[#1e1e24]/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/30'
              }`}
            >
              {/* Числовой индикатор сегодняшнего дня */}
              <div className="flex w-full justify-between items-center">
                <span
                  className={`text-xs font-semibold px-1 rounded ${
                    currentIsToday
                      ? 'bg-indigo-500 text-white font-bold'
                      : hasShifts
                      ? 'text-emerald-400'
                      : 'text-zinc-400 group-hover:text-white'
                  }`}
                >
                  {dayNum}
                </span>
                
                {/* Симпатичная микроиконка портфеля на рабочих днях */}
                {hasShifts && (
                  <Briefcase className="h-3 w-3 text-emerald-400 inline-block opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              {/* Количество смен */}
              {hasShifts ? (
                <div className="w-full flex justify-center pb-0.5 sm:pb-1">
                  <span
                    id={`day-shift-badge-${dateKey}`}
                    className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.4)] tracking-wide shrink-0"
                  >
                    {shiftCount}
                  </span>
                </div>
              ) : (
                <div className="h-4 sm:h-5" /> /* Заглушка, чтобы центрировать одинаково */
              )}
            </button>
          );
        })}

        {/* Дни следующего месяца (неактивные) */}
        {nextMonthCells.map((dayNum, index) => (
          <div
            key={`next-${index}`}
            className="aspect-square flex flex-col items-center justify-center rounded-xl bg-zinc-900/10 border border-transparent text-zinc-750 text-xs opacity-25 select-none pointer-events-none"
          >
            {dayNum}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500 px-1 border-t border-zinc-850 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded border border-emerald-500 bg-emerald-500/10" />
          <span>Рабочий день (есть смены)</span>
        </div>
        <div className="text-zinc-500 font-medium">
          Кликните на день, чтобы добавить смену
        </div>
      </div>
    </div>
  );
};
