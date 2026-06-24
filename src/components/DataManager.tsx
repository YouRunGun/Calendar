/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, Database, Sparkles, RefreshCw } from 'lucide-react';
import { ShiftData } from '../types';
import { exportToExcel, importFromExcel, generateSampleShifts } from '../utils';

interface DataManagerProps {
  shifts: ShiftData;
  onImportSuccess: (imported: ShiftData) => void;
  onClearData: () => void;
  onLoadSamples: () => void;
}

export const DataManager: React.FC<DataManagerProps> = ({
  shifts,
  onImportSuccess,
  onClearData,
  onLoadSamples,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const [confirmState, setConfirmState] = useState<'none' | 'clear' | 'samples'>('none');

  // Обработчик экспорта
  const handleExport = () => {
    try {
      exportToExcel(shifts);
      showTemporaryMessage('База смен успешно экспортирована в Excel!', false);
    } catch (e) {
      showTemporaryMessage('Ошибка при экспорте файла.', true);
    }
  };

  // Метод триггера выбора файлов
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Обработчик импорта файлов
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const importedData = await importFromExcel(file);
      const mergedQty = Object.keys(importedData).length;
      
      if (mergedQty === 0) {
        showTemporaryMessage('В файле не найдено корректных записей о сменах.', true);
      } else {
        onImportSuccess(importedData);
        showTemporaryMessage(`Успешно импортировано смен: ${mergedQty}`, false);
      }
    } catch (err: any) {
      showTemporaryMessage(err.message || 'Ошибка импорта. Проверьте структуру файла.', true);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // сброс поля выбора файла
      }
    }
  };

  const showTemporaryMessage = (text: string, error: boolean) => {
    setMessage({ text, error });
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleConfirmAction = () => {
    if (confirmState === 'samples') {
      onLoadSamples();
      showTemporaryMessage('Сгенерированы демонстрационные смены за последние 12 месяцев.', false);
    } else if (confirmState === 'clear') {
      onClearData();
      showTemporaryMessage('Все данные о сменах успешно стёрты.', false);
    }
    setConfirmState('none');
  };

  return (
    <div id="data-manager-card" className="w-full rounded-2xl border border-zinc-800 bg-[#1a1a1e] p-5 sm:p-6 shadow-2xl shadow-black/40">
      <div className="flex flex-col gap-2 mb-5">
        <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Управление данными</span>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-400" />
          Синхронизация и файлы
        </h2>
      </div>

      <div className="space-y-4">
        {/* Кнопки импорта и экспорта */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            id="export-xlsx-btn"
            onClick={handleExport}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all font-bold text-sm cursor-pointer"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Экспорт (.xlsx)</span>
          </button>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button
              id="import-xlsx-btn"
              disabled={isImporting}
              onClick={triggerFileInput}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all font-bold text-sm disabled:opacity-50 cursor-pointer"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 text-sky-400 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 text-sky-400" />
              )}
              <span>Импорт (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Уведомление о действиях */}
        {message && (
          <div
            id="manager-message"
            className={`p-3 rounded-xl border text-xs font-bold leading-relaxed transition-all duration-300 ${
              message.error
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Демо-инструменты */}
        <div className="pt-4 border-t border-zinc-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              База: Локальный режим (LocalStorage)
            </span>
            <span className="text-[10px] text-zinc-550 mt-0.5">Данные сохраняются автоматически</span>
          </div>

          <div className="flex items-center gap-2">
            {confirmState === 'none' ? (
              <>
                <button
                  id="load-samples-btn"
                  onClick={() => setConfirmState('samples')}
                  title="Наполнить календарь демонстрационными данными"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Демо-данные</span>
                </button>

                <button
                  id="clear-db-btn"
                  onClick={() => setConfirmState('clear')}
                  title="Очистить всю базу смен"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Очистить всe</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-end gap-1.5 bg-zinc-950/80 border border-zinc-850 p-2.5 rounded-xl animate-fade-in max-w-[240px]">
                <span className="text-[10px] text-zinc-300 font-medium">
                  {confirmState === 'samples' 
                    ? 'Сгенерировать случайные демо-данные за последние 12 месяцев?' 
                    : 'Стереть всю историю безвозвратно?'}
                </span>
                <div className="flex gap-1.5">
                  <button
                    id="confirm-yes-btn"
                    onClick={handleConfirmAction}
                    className="px-2 py-1 text-[10px] font-bold bg-emerald-500 text-black rounded hover:bg-emerald-400 cursor-pointer"
                  >
                    Да, продолжить
                  </button>
                  <button
                    id="confirm-no-btn"
                    onClick={() => setConfirmState('none')}
                    className="px-2 py-1 text-[10px] font-bold bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Архитектурное руководство для подключения Cloud API */}
        <div className="mt-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-900 text-zinc-500">
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-1">
            Интеграция с облачной базой данных (Architecture Ready)
          </span>
          <p className="text-[10px] leading-relaxed">
            Приложение спроектировано для бесшовного перехода на внешнее облако. Чтобы подключить Firestore или Supabase API, достаточно переопределить функции сохранения и загрузки в файле настроек <code className="text-zinc-400 font-mono text-[9px] bg-zinc-900 px-1 py-0.5 rounded">src/App.tsx</code> в хэндлерах <code className="text-zinc-400 font-mono text-[9px] bg-zinc-900 px-1 py-0.5 rounded">saveShiftsState</code>. Все операции разделены и централизованы.
          </p>
        </div>
      </div>
    </div>
  );
};
