'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSuccess?: (userData: any) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    login: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(form.login, form.password);
      } else {
        result = await register(form.login, form.password, form.name);
      }
      
      if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setForm(prev => ({ ...prev, password: '' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-3xl text-white">📅</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isLogin ? 'Добро пожаловать' : 'Создать аккаунт'}
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            {isLogin ? 'Войдите в свой календарь' : 'Зарегистрируйтесь для начала работы'}
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-red-500 text-lg">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {!isLogin && (
                <div className="group">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                    👤 Имя
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Введите ваше имя"
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="group">
                <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  🔐 Логин
                </label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  value={form.login}
                  onChange={(e) => setForm(prev => ({ ...prev, login: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={isLogin ? "Введите логин" : "Придумайте логин"}
                  disabled={loading}
                />
              </div>
              
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                  🗝️ Пароль
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={isLogin ? "Введите пароль" : "Придумайте пароль"}
                  minLength={3}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                loading
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed shadow-inner'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  <span className="text-white">
                    {isLogin ? 'Входим...' : 'Регистрируем...'}
                  </span>
                </div>
              ) : (
                <span className="text-white flex items-center justify-center gap-2">
                  {isLogin ? '🚀 Войти' : '✨ Зарегистрироваться'}
                </span>
              )}
            </button>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={switchMode}
                disabled={loading}
                className={`text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLogin ? (
                  <span className="flex items-center justify-center gap-2">
                    📝 Нет аккаунта? <span className="text-blue-500 font-semibold">Зарегистрироваться</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🔐 Уже есть аккаунт? <span className="text-blue-500 font-semibold">Войти</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <div className="inline-flex space-x-2 opacity-60">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-300"></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Ваши данные в безопасности
          </p>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-4000"></div>
      </div>
    </div>
  );
}