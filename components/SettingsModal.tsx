'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  soundEnabled: boolean;
  welcomeAnimationEnabled: boolean;
}

export default function SettingsModal({
  isOpen,
  onClose,
}: SettingsModalProps) {
  const { logout } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    welcomeAnimationEnabled: true,
  });

  useEffect(() => {
    if (isOpen) {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [isOpen]);

  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };

  const handleSoundToggle = () => {
    saveSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled,
    });
  };

  const handleAnimationToggle = () => {
    saveSettings({
      ...settings,
      welcomeAnimationEnabled: !settings.welcomeAnimationEnabled,
    });
  };

  const handleLogout = () => {
    logout();
    onClose();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto animate-scaleIn">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-between">
            Настройки
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none font-light transition"
            >
              ×
            </button>
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Звук приветствия</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Воспроизводить звук при входе в систему
                </p>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-800">Анимация входа</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Показывать анимированное приветствие
                </p>
              </div>
              <button
                onClick={handleAnimationToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.welcomeAnimationEnabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.welcomeAnimationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти из аккаунта
            </button>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 font-medium py-2 rounded-lg transition bg-gray-100 hover:bg-gray-200 text-gray-800"
                onClick={onClose}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}