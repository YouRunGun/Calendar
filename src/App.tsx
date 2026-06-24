/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { ShiftData } from './types';
import { HeaderStats } from './components/HeaderStats';
import { CalendarGrid } from './components/CalendarGrid';
import { AnalyticsChart } from './components/AnalyticsChart';
import { DataManager } from './components/DataManager';
import { ShiftModal } from './components/ShiftModal';
import { generateSampleShifts } from './utils';

export default function App() {
  const [shifts, setShifts] = useState<ShiftData>(() => {
    try {
      const raw = localStorage.getItem('shift_tracker_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Ошибка чтения базы из LocalStorage:', e);
    }
    // Если пусто или произошла ошибка, возвращаем сгенерированные демо-данные по умолчанию
    return generateSampleShifts();
  });

  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Регистрация глобальной функции возврата к сегодня для кнопок в других модулях
  useEffect(() => {
    (window as any).__setCalendarToToday = () => {
      const d = new Date();
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    };
    return () => {
      try {
        delete (window as any).__setCalendarToToday;
      } catch (e) {}
    };
  }, []);

  // Перелистывание месяцев
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Метод открытия модального окна для редактирования дня
  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  // Метод сохранения и обновления стейта
  const saveShiftsState = (newShifts: ShiftData) => {
    setShifts(newShifts);

    // =========================================================================
    //  АРХИТЕКТУРНАЯ ГОТОВНОСТЬ ДЛЯ ИНТЕГРАЦИИ С ОБЛАКОМ (SUPABASE / FIREBASE)
    // =========================================================================
    //
    // Чтобы перевести проект в облачный режим, адаптируйте этот блок кода.
    // 
    // ПРИМЕР С FIREBASE FIRESTORE:
    // -------------------------------------------------------------
    // import { doc, setDoc } from "firebase/firestore";
    // import { db, auth } from "./firebaseConfig";
    // 
    // const syncWithFirebase = async (data: ShiftData) => {
    //   const user = auth.currentUser;
    //   if (user) {
    //     try {
    //       await setDoc(doc(db, "users", user.uid, "tracker", "shiftRecords"), data);
    //       console.log("Успешно синхронизировано с Firebase");
    //     } catch (e) {
    //       console.error("Ошибка синхронизации с Firebase:", e);
    //     }
    //   }
    // };
    // syncWithFirebase(newShifts);
    //
    // ПРИМЕР С SUPABASE DB:
    // -------------------------------------------------------------
    // import { supabase } from "./supabaseClient";
    // 
    // const syncWithSupabase = async (data: ShiftData) => {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (user) {
    //     const { error } = await supabase
    //       .from('user_shifts')
    //       .upsert({ user_id: user.id, records_json: data });
    //     if (error) console.error("Ошибка Supabase:", error);
    //   }
    // };
    // syncWithSupabase(newShifts);
    // =========================================================================

    try {
      localStorage.setItem('shift_tracker_data', JSON.stringify(newShifts));
    } catch (e) {
      console.error('Ошибка записи базы в LocalStorage:', e);
    }
  };

  // Хэндлеры для манипуляции данными в DataManager
  const handleImportSuccess = (imported: ShiftData) => {
    // Объединяем существующие данные с импортированными
    const merged = { ...shifts, ...imported };
    saveShiftsState(merged);
  };

  const handleClearData = () => {
    saveShiftsState({});
  };

  const handleLoadSamples = () => {
    const samples = generateSampleShifts();
    saveShiftsState(samples);
  };

  const handleSaveShift = (count: number) => {
    if (!selectedDate) return;
    const updated = { ...shifts };

    if (count <= 0) {
      delete updated[selectedDate];
    } else {
      updated[selectedDate] = count;
    }

    saveShiftsState(updated);
    setIsModalOpen(false);
  };

  // Подсчитываем данные за текущий выбранный месяц
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  
  let totalShiftsInMonth = 0;
  let totalWorkingDaysInMonth = 0;

  Object.entries(shifts).forEach(([dateKey, val]) => {
    const count = val as number;
    if (dateKey.startsWith(monthPrefix)) {
      totalShiftsInMonth += count;
      if (count > 0) {
        totalWorkingDaysInMonth++;
      }
    }
  });

  return (
    <div id="app-root-container" className="min-h-screen bg-[#121214] text-zinc-150 pb-16 selection:bg-emerald-500 selection:text-black">
      
      {/* Навигационная панель / Хедер */}
      <nav className="border-b border-zinc-900 bg-[#161619]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="font-black text-white text-base tracking-tight block">
                СМЕННЫЙ КАЛЕНДАРЬ
              </span>
              <span className="text-[10px] text-zinc-500 font-bold block -mt-0.5 tracking-wider uppercase">
                Offline-First Tracker
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] text-zinc-405 font-bold uppercase tracking-wider">
              Локальное хранилище активно
            </span>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Хедер и Карточки статистики */}
        <HeaderStats
          currentYear={currentYear}
          currentMonth={currentMonth}
          totalShiftsInMonth={totalShiftsInMonth}
          totalWorkingDaysInMonth={totalWorkingDaysInMonth}
        />

        {/* Сетка разметки */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Левая колонка: Календарь */}
          <section className="lg:col-span-7 space-y-6">
            <CalendarGrid
              currentYear={currentYear}
              currentMonth={currentMonth}
              shifts={shifts}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onDayClick={handleDayClick}
            />

            {/* Быстрая справка для понимания логики */}
            <div className="rounded-2xl border border-zinc-800 bg-[#1a1a1e] p-5 flex gap-4">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="text-xs space-y-1">
                <p className="font-bold text-white">Как вести учёт рабочих смен?</p>
                <p className="text-zinc-400 leading-relaxed">
                  Просто нажмите на любой день текущего месяца в календаре, введите количество смен за этот день (числовой показатель: например, <strong className="text-white">1</strong> смену, <strong className="text-white">0.5</strong> ставки, или <strong className="text-white">1.5</strong> дежурства) и сохраните. График и статистика пересчитаются мгновенно.
                </p>
              </div>
            </div>
          </section>

          {/* Правая колонка: График и База */}
          <section className="lg:col-span-12 xl:col-span-5 lg:col-span-5 space-y-6">
            <AnalyticsChart
              shifts={shifts}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />

            <DataManager
              shifts={shifts}
              onImportSuccess={handleImportSuccess}
              onClearData={handleClearData}
              onLoadSamples={handleLoadSamples}
            />
          </section>
        </div>
      </main>

      {/* Окно редактирования смен в ячейке */}
      <ShiftModal
        isOpen={isModalOpen}
        dateStr={selectedDate || ''}
        initialCount={selectedDate ? (shifts[selectedDate] || 0) : 0}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShift}
      />
    </div>
  );
}
