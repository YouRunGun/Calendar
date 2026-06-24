/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Данные о сменах: дата ("YYYY-MM-DD") -> количество смен (число)
export interface ShiftData {
  [dateKey: string]: number;
}
