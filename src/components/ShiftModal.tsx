/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Save, Trash2 } from 'lucide-react';
import { RUSSIAN_MONTHS } from '../utils';

interface ShiftModalProps {
  isOpen: boolean;
  dateStr: string; // "YYYY-MM-DD"
  initialCount: number;
  onClose: () => void;
  onSave: (count: number) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  dateStr,
  initialCount,
  onClose,
  onSave,
}) => {
  const [countInput, setCountInput] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Сбрасываем поле ввода при открытии модального окна для новой даты
  useEffect(() => {
    if (isOpen) {
      setCountInput(initialCount > 0 ? String(initialCount) : '');
      // Фокусируем инпут через небольшой таймаут, чтобы дать окну отрендериться
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, dateStr, initialCount]);

  if (!isOpen) return null;

  // Форматируем дату для заголовка: e.g. "23 Июня 2026"
  const getFormattedTitleDate = () => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const mIndex = parseInt(month) - 1;
    const monthName = RUSSIAN_MONTHS[mIndex] ? RUSSIAN_MONTHS[mIndex].toLowerCase() : '';
    // Склонение месяцев (Июнь -> июня, Январь -> января, etc.)
    let monthDeclined = monthName;
    if (monthName.endsWith('ь') || monthName.endsWith('й')) {
      monthDeclined = monthDeclined.replace(/[ьй]$/, 'я');
    } else if (monthDeclined.endsWith('т')) { // Март -> марта, Август -> августа
      monthDeclined = monthDeclined + 'а';
    }
    return `${parseInt(day)} ${monthDeclined} ${year}`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(countInput.replace(',', '.'));
    const finalCount = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    onSave(finalCount);
  };

  const quickSelect = (val: number) => {
    onSave(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        id="shift-modal-body"
        className="w-full max-w-sm rounded-2xl border border-zinc-850 bg-[#1a1a1e] p-6 shadow-2xl shadow-green-950/5 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Редактировать смену</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">{getFormattedTitleDate()}</p>
            </div>
          </div>
          <button
            id="close-modal-x"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label htmlFor="shift-count-input" className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
              Количество смен за день:
            </label>
            <div className="relative">
              <input
                id="shift-count-input"
                ref={inputRef}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="Например, 1 или 0.5"
                value={countInput}
                onChange={(e) => setCountInput(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-lg font-extrabold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-zinc-650"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">
                смен
              </span>
            </div>
          </div>

          {/* Быстрый выбор популярных значений */}
          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              Быстрый выбор:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => quickSelect(val)}
                  className={`py-2 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                    initialCount === val
                      ? 'bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-850'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-2 pt-2 border-t border-zinc-850">
            {initialCount > 0 && (
              <button
                id="delete-shift-btn"
                type="button"
                onClick={() => onSave(0)}
                className="flex items-center justify-center p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/45 rounded-xl transition-all cursor-pointer"
                title="Очистить день"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}

            <button
              id="save-modal-btn"
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-black font-extrabold rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
