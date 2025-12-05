'use client';

import { useState, useEffect, useRef } from 'react';
import CalendarApp from '../components/CalendarApp';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

function WelcomeMessage({ name, onAnimationEnd }: { name: string; onAnimationEnd: () => void }) {
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const getSettings = (): { soundEnabled: boolean; welcomeAnimationEnabled: boolean } => {
    if (typeof window === 'undefined') {
      return { soundEnabled: true, welcomeAnimationEnabled: true };
    }
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings 
      ? JSON.parse(savedSettings)
      : { soundEnabled: true, welcomeAnimationEnabled: true };
  };

  const settings = getSettings();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Доброе утро';
    if (hour >= 12 && hour < 18) return 'Добрый день';
    if (hour >= 18 && hour < 23) return 'Добрый вечер';
    return 'Доброй ночи';
  };

  const playSound = async () => {
    if (audioPlayed || !settings.soundEnabled) return;

    try {
      const audio = new Audio('/sounds/fanfare.mp3');
      audio.volume = 0.3;
      audio.playbackRate = 0.5;

      await audio.play();
      setAudioPlayed(true);

      audio.onended = () => {
        audio.remove();
      };

    } catch (error) {
      console.log('Audio play failed, trying fallback:', error);

      const playButton = document.createElement('button');
      playButton.style.display = 'none';
      playButton.innerHTML = 'play';
      document.body.appendChild(playButton);
      playButton.click();
      setTimeout(() => {
        playButton.remove();
      }, 100);
    }
  };

  useEffect(() => {
    if (settings.soundEnabled) {
      playSound();
    }

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onAnimationEnd, 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [onAnimationEnd, settings.soundEnabled]);

  if (!settings.welcomeAnimationEnabled) {
    useEffect(() => {
      onAnimationEnd();
    }, [onAnimationEnd]);
    return null;
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-700 ${
      visible
        ? 'opacity-100 scale-100 bg-linear-to-br from-blue-50 via-white to-purple-50'
        : 'opacity-0 scale-105 pointer-events-none'
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative text-center max-w-2xl mx-4">
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-linear-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <span className="text-5xl text-white">👑</span>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-ping opacity-20"></div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fadeIn">
            {getGreeting()}
          </h1>

          <div className="space-y-2">
            <div className="animate-fadeIn delay-500">
              <span className="text-4xl font-bold text-blue-600 ml-3">{name}!</span>
            </div>
          </div>
        </div>

        <p className="text-lg text-gray-400 mt-8 animate-fadeIn delay-700">
          Ваш календарь готов к работе
        </p>

        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
}

function AudioPreloader() {
  useEffect(() => {
    const getSettings = () => {
      if (typeof window === 'undefined') return { soundEnabled: true };
      const savedSettings = localStorage.getItem('appSettings');
      return savedSettings 
        ? JSON.parse(savedSettings)
        : { soundEnabled: true };
    };

    const settings = getSettings();
    
    if (settings.soundEnabled) {
      const preloadAudio = async () => {
        try {
          const audio = new Audio();
          audio.src = '/sounds/fanfare.mp3';
          audio.volume = 0;
          await audio.load();
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
          console.log('Audio preloaded successfully');
        } catch (error) {
          console.log('Audio preload failed:', error);
        }
      };

      preloadAudio();
    }
  }, []);

  return null;
}

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const getAnimationSettings = () => {
    if (typeof window === 'undefined') return { welcomeAnimationEnabled: true };
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings 
      ? JSON.parse(savedSettings)
      : { welcomeAnimationEnabled: true };
  };

  useEffect(() => {
    const settings = getAnimationSettings();
    if (isAuthenticated && user && !loading && !justLoggedIn && settings.welcomeAnimationEnabled) {
      setWelcomeName(user.name || user.login);
      setShowWelcome(true);
      setJustLoggedIn(true);
    }
  }, [isAuthenticated, user, loading, justLoggedIn]);

  const handleLoginSuccess = (userData: any) => {
    const settings = getAnimationSettings();
    setWelcomeName(userData.name || userData.login);
    if (settings.welcomeAnimationEnabled) {
      setShowWelcome(true);
    }
    setJustLoggedIn(true);
  };

  const handleWelcomeEnd = () => {
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (user || justLoggedIn) {
    return (
      <>
        {showWelcome &&
          <WelcomeMessage name={welcomeName} onAnimationEnd={handleWelcomeEnd} />
        }
        <AudioPreloader />
        <CalendarApp />
      </>
    );
  }

  if (!justLoggedIn) {
    return (
      <>
        <AudioPreloader />
        <LoginForm onSuccess={handleLoginSuccess} />
      </>
    );
  }

  return null;
}