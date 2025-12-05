'use client';

import { useEffect, useRef, useState } from 'react';
import { Task, Day } from '../utils/types';
import { LOAD_BATCH, MAX_DAYS_AHEAD, DEFAULT_COLORS, STORAGE_KEY } from '../utils/constants';
import { genDays, todayDateString, timeToMinutes } from '../utils/utils';
import DayView from './DayView';
import TaskModal from './TaskModal';
import { useAuth } from '@/hooks/useAuth';
import SettingsModal from './SettingsModal';

export default function CalendarApp() {
  const { user, token } = useAuth();
  const [days, setDays] = useState<Day[]>(() => genDays(0, LOAD_BATCH));
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSettingsVisible, setModalSettingsVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<{ date: string; task?: Task } | null>(null);
  const [form, setForm] = useState({
    id: "",
    title: "",
    date: todayDateString(),
    start: "09:00",
    end: "10:00",
    color: DEFAULT_COLORS[0],
    done: false,
    emoji: "",
    weekly: false,
    weeklyDay: "",
  });
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const daysLoadedRef = useRef(LOAD_BATCH);
  const flatListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveTasksToLocalStorage(tasksByDate);
  }, [tasksByDate])

  const saveTasksToLocalStorage = (tasks: Record<string, Task[]>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  };

  const loadTasks = async () => {
    try {
      // setLoading(true);
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const tasks: Task[] = await response.json();
        console.log(tasks);

        const groupedTasks: Record<string, Task[]> = {};
        tasks.forEach(task => {
          if (task.date) {
            const dateStr = new Date(task.date).toISOString().split('T')[0];
            if (!groupedTasks[dateStr]) {
              groupedTasks[dateStr] = [];
            }
            groupedTasks[dateStr].push(task);
          }
          else {
            const today = new Date();
            console.log(today);
            const endDate = new Date();
            console.log(endDate);
            endDate.setDate(today.getDate() + 56);
            let currentDate = new Date(today);
            console.log(currentDate);

            while (currentDate <= endDate) {
              const currentDayName = getRussianDayName(currentDate).toLowerCase();
              if (task.weeklyDay && currentDayName === task.weeklyDay.toLowerCase()) {
                console.log(currentDayName);
                const dateStr = new Date(currentDate).toISOString().split('T')[0];
                if (!groupedTasks[dateStr]) {
                  groupedTasks[dateStr] = [];
                }
                groupedTasks[dateStr].push(task);
              }

              currentDate.setDate(currentDate.getDate() + 1);
            }
          }
        });

        Object.keys(groupedTasks).forEach(date => {
          groupedTasks[date].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
        });

        setTasksByDate(groupedTasks);
      } else {
        console.error('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  function getRussianDayName(date: Date) {
    const days = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    return days[date.getDay()];
  }

  useEffect(() => {
    if (!user || !token) return;

    loadTasks();
  }, [user, token]);

  const loadMoreDays = () => {
    if (daysLoadedRef.current >= MAX_DAYS_AHEAD) return;
    const remaining = MAX_DAYS_AHEAD - daysLoadedRef.current;
    const toLoad = Math.min(LOAD_BATCH, remaining);
    const newDays = genDays(daysLoadedRef.current, toLoad);
    setDays((prev) => [...prev, ...newDays]);
    daysLoadedRef.current += toLoad;
  };

  const createTask = async (taskData: Omit<Task, "id">): Promise<Task> => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error('Failed to create task');
    }

    return response.json();
  };

  const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData)
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return response.json();
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  };

  const addTask = async (date: string, taskData: Omit<Task, "id">) => {
    try {
      const newTask = await createTask({
        ...taskData,
        date: new Date(date).toISOString()
      });

      setTasksByDate((prev) => {
        const arr = [...(prev[date] ?? []), newTask];
        return { ...prev, [date]: arr.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)) };
      });

      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Ошибка при создании задачи');
      throw error;
    }
  };

  const updateTaskLocal = async (date: string, updated: Task) => {
    try {
      const { id, ...updateData } = updated;
      const result = await updateTask(id, updateData);

      setTasksByDate((prev) => {
        const arr = (prev[date] ?? []).map((t) => (t.id === updated.id ? result : t));
        return { ...prev, [date]: arr.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)) };
      });

      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Ошибка при обновлении задачи');
      throw error;
    }
  };

  const deleteTaskLocal = async (date: string, taskId: string) => {
    try {
      await deleteTask(taskId);

      setTasksByDate((prev) => {
        const arr = (prev[date] ?? []).filter((t) => t.id !== taskId);
        const copy = { ...prev, [date]: arr };
        if (arr.length === 0) {
          delete copy[date];
        }
        return copy;
      });

      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Ошибка при удалении задачи');
      throw error;
    }
  };

  const toggleDone = async (date: string, taskId: string) => {
    try {
      const task = tasksByDate[date]?.find(t => t.id === taskId);
      if (!task) return;

      const result = await updateTask(taskId, { done: !task.done });

      setTasksByDate((prev) => {
        const arr = (prev[date] ?? []).map((t) => (t.id === taskId ? result : t));
        return { ...prev, [date]: arr };
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Ошибка при изменении статуса задачи');
    }
  };

  const openNewModal = (date?: string) => {
    const d = date ?? todayDateString();
    setForm({
      id: "",
      title: "",
      date: d,
      start: "09:00",
      end: "10:00",
      color: DEFAULT_COLORS[0],
      done: false,
      emoji: "",
      weekly: false,
      weeklyDay: "",
    });
    setEditingTask(null);
    setModalVisible(true);
  };

  const openEditModal = (date: string, task: Task) => {
    setForm({
      id: task.id,
      title: task.title ?? "",
      date,
      start: task.start,
      end: task.end,
      color: task.color,
      done: !!task.done,
      emoji: task.emoji ?? "",
      weekly: task.weekly ?? false,
      weeklyDay: task.weeklyDay ?? "",
    });
    setEditingTask({ date, task });
    setModalVisible(true);
  };

  const onSaveFromModal = async () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      alert("Ошибка: Введите дату в формате ГГГГ-MM-ДД (например 2025-09-20)");
      return;
    }
    if (!form.title) {
      alert("Ошибка: Введите название задачи");
      return;
    }
    const sMin = timeToMinutes(form.start);
    const eMin = timeToMinutes(form.end);
    if (isNaN(sMin) || isNaN(eMin)) {
      alert("Ошибка: Время должно быть в формате HH:MM");
      return;
    }
    if (eMin <= sMin) {
      alert("Ошибка: Время окончания должно быть позже времени начала");
      return;
    }

    try {
      setModalLoading(true);

      const taskData = {
        title: form.title,
        start: form.start,
        end: form.end,
        color: form.color,
        done: form.done,
        emoji: form.emoji,
        date: new Date(form.date).toISOString(),
        weekly: form.weekly,
        weeklyDay: form.weeklyDay
      };

      if (form.id) {
        if (editingTask && editingTask.date !== form.date) {
          await deleteTaskLocal(editingTask.date, form.id);
          await addTask(form.date, taskData);
        } else {
          await updateTaskLocal(form.date, {
            id: form.id,
            ...taskData
          });
        }
      } else {
        await addTask(form.date, taskData);
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const onDeleteFromModal = async () => {
    if (!form.id || !editingTask) {
      setModalVisible(false);
      return;
    }
    if (confirm("Удалить задачу? Вы уверены, что хотите удалить задачу?")) {
      try {
        setModalLoading(true);
        await deleteTaskLocal(editingTask.date, form.id);
        setModalVisible(false);
      } catch (error) {
        console.error('Error deleting task:', error);
      } finally {
        setModalLoading(false);
      }
    }
  };

  const onCloseModal = () => {
    if (!modalLoading) {
      setModalVisible(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка задач...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div ref={flatListRef} className="h-screen overflow-auto">

        {days.map((day) => (
          <DayView
            key={day.date}
            day={day}
            tasks={tasksByDate[day.date] ?? []}
            onAddTask={openNewModal}
            onEditTask={openEditModal}
            onToggleDone={toggleDone}
          />
        ))}
        <div className="flex justify-center p-4">
          <button
            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
            onClick={loadMoreDays}
            disabled={daysLoadedRef.current >= MAX_DAYS_AHEAD}
          >
            {daysLoadedRef.current >= MAX_DAYS_AHEAD ? 'Достигнут лимит дней' : 'Загрузить еще'}
          </button>
        </div>
      </div>

      <button
        className="fixed font-bold text-xl bottom-6 left-6 w-14 h-14 bg-white/20 backdrop-blur-sm border z-10 border-zinc-400/40 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 hover:border-white/60 transition-all duration-200 active:scale-95"
        onClick={() => setModalSettingsVisible(true)}
      >
        =
      </button>

      <button
        // className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
        className="fixed font-bold text-xl bottom-6 right-6 w-14 h-14 bg-linear-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        onClick={() => openNewModal()}
      >
        ＋
      </button>

      <TaskModal
        isOpen={modalVisible}
        onClose={onCloseModal}
        onSave={onSaveFromModal}
        onDelete={onDeleteFromModal}
        form={form}
        editingTask={editingTask}
        setForm={setForm}
        loading={modalLoading}
      />
      <SettingsModal isOpen={modalSettingsVisible} onClose={() => setModalSettingsVisible(false)} />
    </div>
  );
}