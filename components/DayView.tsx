'use client';

import { Task, Day } from '../utils/types';
import { HOUR_HEIGHT } from '../utils/constants';
import { formatDateReadable, timeToMinutes, todayDateString } from '../utils/utils';
import { useState, useEffect } from 'react';

interface DayViewProps {
  day: Day;
  tasks: Task[];
  onAddTask: (date: string) => void;
  onEditTask: (date: string, task: Task) => void;
  onToggleDone: (date: string, id: string) => void;
}

export default function DayView({ day, tasks, onAddTask, onEditTask, onToggleDone }: DayViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const isToday = day.date === todayDateString();

  useEffect(() => {
    if (!isToday) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [isToday]);

  const calculateTimeRange = () => {
    if (tasks.length === 0) {
      return { startHour: 6, endHour: 22 };
    }

    const minStart = Math.min(...tasks.map((t) => timeToMinutes(t.start)));
    const maxEnd = Math.max(...tasks.map((t) => timeToMinutes(t.end)));
    const startHour = Math.max(0, Math.floor(minStart / 60) - 1);
    const endHour = Math.min(24, Math.ceil(maxEnd / 60));

    return { startHour, endHour };
  };

  const { startHour, endHour } = calculateTimeRange();
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const totalHeight = (endHour - startHour + 1) * HOUR_HEIGHT;

  const getCurrentTimePosition = () => {
    if (!isToday) return null;
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    if (currentMinutes < startHour * 60 || currentMinutes > endHour * 60) return null;
    return ((currentMinutes - startHour * 60) / 60) * HOUR_HEIGHT;
  };

  const currentTimePosition = getCurrentTimePosition();

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-4 my-3 p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              {formatDateReadable(day.date)}
            </h2>
            {isToday && (
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                сегодня
              </span>
            )}
          </div>
          <button
            className="bg-linear-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            onClick={() => onAddTask(day.date)}
          >
            <span className="text-lg font-bold">+</span>
          </button>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-40">📅</div>
          <p className="text-gray-400 text-sm">Пока нет задач</p>
          <button
            className="mt-3 text-blue-500 text-sm font-medium"
            onClick={() => onAddTask(day.date)}
          >
            Добавить первую задачу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-4 my-3 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              {formatDateReadable(day.date)}
            </h2>
            {isToday && (
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                сегодня
              </span>
            )}
          </div>
          <button
            className="bg-linear-to-r from-blue-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            onClick={() => onAddTask(day.date)}
          >
            <span className="text-sm font-bold">+</span>
          </button>
        </div>
      </div>

      <div className="relative" style={{ height: `${totalHeight}px` }}>
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-linear-to-b from-gray-50 to-white z-10 border-r border-gray-100">
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-center pt-1"
              style={{ height: `${HOUR_HEIGHT}px` }}
            >
              <span className="text-xs text-gray-500 font-medium">
                {pad(hour)}:00
              </span>
            </div>
          ))}
        </div>

        <div className="ml-12 relative h-full">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${(hour - startHour) * HOUR_HEIGHT}px` }}
            />
          ))}

          {currentTimePosition !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-red-500 z-20 flex items-center"
              style={{ top: `${currentTimePosition}px` }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-sm absolute -left-1"></div>
              <div className="absolute -top-2 -left-12 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-medium shadow-sm">
                {pad(currentTime.getHours())}:{pad(currentTime.getMinutes())}
              </div>
            </div>
          )}

          {tasks.map((task) => {
            const start = timeToMinutes(task.start);
            const end = timeToMinutes(task.end);
            const top = ((start - startHour * 60) / 60) * HOUR_HEIGHT;
            const height = Math.max(40, ((end - start) / 60) * HOUR_HEIGHT);

            return (
              <div
                key={task.id}
                className={`absolute left-2 right-3 rounded-xl border-l-4 shadow-sm cursor-pointer transition-all duration-200 active:scale-[0.98] ${task.done ? 'opacity-60' : 'opacity-100 hover:shadow-md'
                  }`}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  backgroundColor: task.color,
                  borderLeftColor: task.done ? '#9CA3AF' : adjustColorBrightness(task.color, -20),
                }}
                onClick={() => onEditTask(day.date, task)}
              >
                <div className="p-2 h-full flex gap-2">
                  <div className="flex items-start justify-between mb-1">
                    <button
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.done
                          ? 'bg-green-500 border-green-500 shadow-sm'
                          : 'border-gray-400 bg-white/80'
                        }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleDone(day.date, task.id);
                      }}
                    >
                      {task.done && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 flex flex-col justify-between">
                    <div>
                      <p className={`font-semibold text-sm leading-tight ${task.done ? 'line-through text-gray-600' : 'text-gray-800'
                        }`}>
                        {task.title ?? 'Без названия'}
                      </p>
                      <p className="text-xs text-gray-600 opacity-80">
                        {task.start} – {task.end}
                      </p>
                    </div>
                    
                  </div>
                        {task.weekly && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50/70 rounded-md px-1.5 py-[1px] w-fit">
                        🔁 <span>каждую неделю</span>
                      </div>
                    )}

                  {task.emoji && (
                    <span className="text-sm self-start">{task.emoji}</span>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {tasks.length} {getTaskWord(tasks.length)}
        </p>
      </div>
    </div>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function adjustColorBrightness(hex: string, percent: number): string {
  return hex;
}

function getTaskWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return 'задача';
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'задачи';
  return 'задач';
}