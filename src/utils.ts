/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { ShiftData } from './types';

export const RUSSIAN_MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

export const RUSSIAN_MONTH_SHORT = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек'
];

export const RUSSIAN_WEEKDAYS = [
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
  'Вс'
];

/**
 * Генерирует демонстрационные данные по сменам для последних 12 месяцев.
 * Это необходимо для того, чтобы приложение при первом открытии выглядело наполненным и красивым.
 */
export function generateSampleShifts(): ShiftData {
  const shifts: ShiftData = {};
  const today = new Date();
  
  // Генерируем случайное число смен для последних 12 месяцев
  for (let m = 11; m >= 0; m--) {
    const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    
    // В каждом месяце случайно выбираем 10-15 рабочих дней
    const numWorkingDays = 10 + Math.floor(Math.random() * 6);
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    
    const selectedDays = new Set<number>();
    while (selectedDays.size < numWorkingDays) {
      selectedDays.add(1 + Math.floor(Math.random() * totalDaysInMonth));
    }
    
    selectedDays.forEach(day => {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      // Смена может быть 0.5 (пол-смены), 1.0 (обычная смена) или 1.5/2.0
      const shiftType = Math.random();
      let count = 1;
      if (shiftType < 0.15) count = 0.5;
      else if (shiftType > 0.85) count = 1.5;
      else if (shiftType > 0.95) count = 2;
      
      shifts[dateKey] = count;
    });
  }
  
  return shifts;
}

/**
 * Экспортирует базу данных смен в файл Excel (.xlsx)
 */
export function exportToExcel(shifts: ShiftData): void {
  // Превращаем словарь в плоский упорядоченный список
  const rows = Object.entries(shifts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => {
      // Форматируем красивую дату для Excel
      const [year, month, day] = date.split('-');
      const formattedDateStr = `${day}.${month}.${year}`;
      return {
        'Дата смены': formattedDateStr,
        'Дата в системе (ГГГГ-ММ-ДД)': date,
        'Количество смен': count,
      };
    });

  // Создаем рабочий лист и книгу
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Рабочие Смены');

  // Задаем ширину колонок для красивого отображения в Excel
  worksheet['!cols'] = [
    { wch: 15 }, // Дата смены
    { wch: 30 }, // Дата в системе
    { wch: 20 }, // Количество смен
  ];

  // Скачиваем файл Excel
  XLSX.writeFile(workbook, 'рабочие_смены.xlsx');
}

/**
 * Импортирует смены из файла Excel (.xlsx)
 */
export function importFromExcel(file: File): Promise<ShiftData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Не удалось прочитать содержимое файла.');
        }
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('В файле Excel не найден рабочий лист.');
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const importedData: ShiftData = {};
        
        jsonRows.forEach((row) => {
          // Ищем ключи для даты и количества смен
          let rawDate = row['Дата в системе (ГГГГ-ММ-ДД)'] || row['Дата смены'] || row['Дата'] || row['Data'] || row['date'];
          let rawCount = row['Количество смен'] || row['Количество'] || row['Смены'] || row['shifts'] || row['count'];
          
          if (rawDate !== undefined && rawCount !== undefined) {
            let dateKey = '';
            
            // Если дата является числом (серийный номер Excel)
            if (typeof rawDate === 'number') {
              const parsedDateObj = new Date((rawDate - 25569) * 86400 * 1000);
              if (!isNaN(parsedDateObj.getTime())) {
                dateKey = parsedDateObj.toISOString().split('T')[0];
              }
            } else if (typeof rawDate === 'string') {
              const trimmed = rawDate.trim();
              
              // Проверяем формат ГГГГ-ММ-ДД
              if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                dateKey = trimmed;
              } else {
                // Пытаемся распарсить формат ДД.ММ.ГГГГ или ДД/ММ/ГГГГ
                const parts = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
                if (parts) {
                  const day = parts[1].padStart(2, '0');
                  const month = parts[2].padStart(2, '0');
                  const year = parts[3];
                  dateKey = `${year}-${month}-${day}`;
                } else {
                  // Попытка прямого создания даты
                  const dObj = new Date(trimmed);
                  if (!isNaN(dObj.getTime())) {
                    dateKey = dObj.toISOString().split('T')[0];
                  }
                }
              }
            } else if (rawDate instanceof Date) {
              dateKey = rawDate.toISOString().split('T')[0];
            }
            
            const numCount = parseFloat(rawCount);
            if (dateKey && !isNaN(numCount) && numCount >= 0) {
              importedData[dateKey] = numCount;
            }
          }
        });
        
        resolve(importedData);
      } catch (err: any) {
        reject(err || new Error('Ошибка при обработке файла Excel.'));
      }
    };
    
    reader.onerror = () => reject(new Error('Не удалось прочитать файл Excel.'));
    reader.readAsBinaryString(file);
  });
}
