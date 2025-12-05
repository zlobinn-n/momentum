'use client';

import { useState, useEffect } from 'react';
import { Task } from '../utils/types';
import { DEFAULT_COLORS, EMOJI_SET, WEEK_DAYS_SHORT_CHECK } from '../utils/constants';
import { formatDateReadable, dateToString, timeToString } from '../utils/utils';
import { WEEK_DAYS_SHORT } from '../utils/constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  onDelete: () => void;
  form: {
    id: string;
    title: string;
    date: string;
    start: string;
    end: string;
    color: string;
    done: boolean;
    emoji: string;
    weekly: boolean;
    weeklyDay: string;
  };
  editingTask: { date: string; task?: Task } | null;
  setForm: (form: any) => void;
  loading: boolean;
}

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  form,
  editingTask,
  setForm,
  loading,
}: TaskModalProps) {
  const addOneHour = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newHours = (hours + 1) % 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (form.start && !form.end) {
      const endTime = addOneHour(form.start);
      setForm((s: any) => ({ ...s, end: endTime }));
    }
  }, [form.start, form.end, setForm]);

  const onDateChange = (selectedDate: Date) => {
    if (loading) return;
    setForm((s: any) => ({ ...s, date: dateToString(selectedDate) }));
  };

  const onStartTimeChange = (selectedTime: Date) => {
    if (loading) return;
    const startTime = timeToString(selectedTime);
    setForm((s: any) => ({
      ...s,
      start: startTime,
      end: addOneHour(startTime),
    }));
  };

  const onEndTimeChange = (selectedTime: Date) => {
    if (loading) return;
    setForm((s: any) => ({ ...s, end: timeToString(selectedTime) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 animate-fadeIn sm:items-center">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hide animate-slideUp sm:animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-3 pb-3 relative"
          style={{
            background: form.color ? `linear-gradient(135deg, ${form.color}20, ${form.color}10)` : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm"
                style={{ backgroundColor: form.color || '#3b82f6' }}
              >
                {form.emoji || '📝'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {form.id ? 'Редактировать' : 'Новая задача'}
                </h2>
                <p className="text-xs text-gray-600">
                  {form.weekly ? 'Повторяющееся событие' : 'Разовое событие'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className={`w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white transition-all shadow-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className={`space-y-4 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>

            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-700">Название задачи</label>
              <input
                type="text"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
                value={form.title}
                onChange={(e) => setForm((s: any) => ({ ...s, title: e.target.value }))}
                placeholder="Что нужно сделать?"
                disabled={loading}
              />
            </div>

            {form.weekly ? (
              <div className="space-y-2">
                <label className="block text-md font-semibold text-gray-700">День недели</label>
                <div className="grid grid-cols-7 gap-1 p-1 bg-gray-100 rounded-xl">
                  {WEEK_DAYS_SHORT.map((weeklyDay) => (
                    <button
                      key={weeklyDay}
                      disabled={loading}
                      className={`py-1.5 rounded-lg text-md font-medium transition-all ${form.weeklyDay === weeklyDay
                          ? 'bg-white text-blue-600 shadow-sm scale-105'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => setForm((s: any) => ({ ...s, weeklyDay }))}
                    >
                      {weeklyDay}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-md font-semibold text-gray-700">Дата</label>
                <div className="relative">
                  <input
                    type="date"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={form.date}
                    onChange={(e) => onDateChange(new Date(e.target.value))}
                    disabled={loading}
                  />
                  <div className={`flex items-center justify-between border-2 border-gray-200 rounded-lg px-3 py-2 text-md text-gray-900 transition-all ${loading ? 'bg-gray-100' : 'bg-white'
                    }`}>
                    <span className="font-medium">{formatDateReadable(form.date)}</span>
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-md">
                      📅
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-md font-semibold text-gray-700">Начало</label>
                <input
                  type="time"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={form.start}
                  onChange={(e) => onStartTimeChange(new Date(`2000-01-01T${e.target.value}`))}
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-md font-semibold text-gray-700">Конец</label>
                <input
                  type="time"
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-md text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  value={form.end}
                  onChange={(e) => onEndTimeChange(new Date(`2000-01-01T${e.target.value}`))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-700">Цвет</label>
              <div className="grid grid-cols-8 gap-1 p-1 bg-gray-100 rounded-xl">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c}
                    disabled={loading}
                    className={`w-7 h-7 rounded-full transition-all transform ${form.color === c
                        ? 'ring-2 ring-offset-1 ring-gray-800 scale-110 shadow-sm'
                        : 'hover:scale-105'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm((s: any) => ({ ...s, color: c }))}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-md font-semibold text-gray-700">Категория</label>
              <div className="grid grid-cols-8 gap-1 p-1 bg-gray-100 rounded-xl max-h-28 overflow-y-auto">
                {EMOJI_SET.map((emoji) => (
                  <button
                    key={emoji}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-base transition-all ${form.emoji === emoji
                        ? 'bg-white shadow-sm scale-110 ring-2 ring-blue-500/50'
                        : 'hover:bg-white/50 hover:scale-105'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => setForm((s: any) => ({ ...s, emoji }))}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-xl">
              <div className={`w-9 h-5 rounded-full transition-all relative ${form.weekly ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                <input
                  type="checkbox"
                  id="weekly"
                  checked={form.weekly}
                  disabled={loading}
                  onChange={(e) => setForm((s: any) => ({
                    ...s,
                    weekly: e.target.checked,
                    weeklyDay: form.weeklyDay ? form.weeklyDay : WEEK_DAYS_SHORT_CHECK[new Date(form.date).getDay()]
                  }))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all transform ${form.weekly ? 'left-4.5' : 'left-0.5'
                  }`} />
              </div>
              <label htmlFor="weekly" className="flex-1 text-sm font-medium text-gray-700">
                Повторять каждую неделю
              </label>
            </div>

            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={loading}
                  className={`font-medium py-2.5 rounded-xl transition-all text-sm ${loading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                    }`}
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  disabled={loading}
                  className={`font-medium py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm ${loading
                      ? 'bg-blue-300 text-white cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                    }`}
                  onClick={onSave}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      {form.id ? 'Сохранение...' : 'Добавление...'}
                    </>
                  ) : (
                    form.id ? 'Сохранить' : 'Добавить'
                  )}
                </button>
              </div>

              {form.id && (
                <button
                  disabled={loading}
                  className={`w-full font-medium py-2.5 rounded-xl transition-all text-sm ${loading
                      ? 'bg-red-300 text-white cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white active:scale-95'
                    }`}
                  onClick={onDelete}
                >
                  Удалить задачу
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}