import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Droplets, Plus, Timer, Target, Settings } from 'lucide-react';

/**
 * Live Better - Complete Focus Timer and Hydration Tracker App
 * A beautiful, self-contained React application to help users maintain focus and stay hydrated
 */
const Index = () => {
  // Focus Timer State Management
  const [focusTime, setFocusTime] = useState(25); // Focus session duration in minutes
  const [breakTime, setBreakTime] = useState(5); // Break duration in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Current countdown in seconds
  const [isRunning, setIsRunning] = useState(false); // Timer running state
  const [isBreak, setIsBreak] = useState(false); // Whether currently in break mode
  const [sessionComplete, setSessionComplete] = useState(false); // Session completion notification

  // Hydration Tracker State Management
  const [dailyGoal, setDailyGoal] = useState(2000); // Daily hydration goal in ml
  const [currentIntake, setCurrentIntake] = useState(0); // Current water intake in ml
  const [customAmount, setCustomAmount] = useState(''); // Custom water amount input
  const [showReminder, setShowReminder] = useState(false); // Hydration reminder visibility

  // UI State Management
  const [showSettings, setShowSettings] = useState(false); // Settings panel visibility

  /**
   * Timer Effect Hook
   * Manages the countdown timer logic and session transitions
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed - trigger notification and switch modes
      setSessionComplete(true);
      setIsRunning(false);
      
      // Auto-transition between focus and break sessions
      if (isBreak) {
        setIsBreak(false);
        setTimeLeft(focusTime * 60);
      } else {
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
      }

      // Clear notification after 3 seconds
      setTimeout(() => setSessionComplete(false), 3000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, focusTime, breakTime, isBreak]);

  /**
   * Hydration Reminder Effect
   * Shows reminder if user is behind their hydration goal
   */
  useEffect(() => {
    const currentHour = new Date().getHours();
    const expectedIntake = (dailyGoal / 16) * Math.max(currentHour - 6, 0); // Assuming 16 active hours (6am-10pm)
    
    if (currentIntake < expectedIntake * 0.8 && currentHour >= 8) {
      setShowReminder(true);
    } else {
      setShowReminder(false);
    }
  }, [currentIntake, dailyGoal]);

  /**
   * Timer Control Functions
   */
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setSessionComplete(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(focusTime * 60);
    setSessionComplete(false);
  }, [focusTime]);

  /**
   * Hydration Control Functions
   */
  const addWater = useCallback((amount: number) => {
    setCurrentIntake(prev => prev + amount);
  }, []);

  const addCustomWater = useCallback(() => {
    const amount = parseInt(customAmount);
    if (amount && amount > 0) {
      addWater(amount);
      setCustomAmount('');
    }
  }, [customAmount, addWater]);

  /**
   * Utility Functions
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = isBreak ? breakTime * 60 : focusTime * 60;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getHydrationPercentage = () => {
    return Math.min((currentIntake / dailyGoal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <Timer className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Live Better</h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-secondary hover:bg-accent transition-smooth fab"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-secondary-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-secondary border-b border-border p-4 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Timer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Focus Time (minutes)
                </label>
                <input
                  type="number"
                  value={focusTime}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                      setFocusTime(value);
                      if (!isBreak && !isRunning) setTimeLeft(value * 60);
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring transition-smooth"
                  min="1"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  value={breakTime}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) setBreakTime(value);
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring transition-smooth"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Daily Water Goal (ml)
                </label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > 0) setDailyGoal(value);
                  }}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring transition-smooth"
                  min="500"
                  max="5000"
                  step="100"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Focus Timer Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Timer className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {isBreak ? 'Break Time' : 'Focus Session'}
                  </h2>
                </div>

                {/* Circular Progress Timer */}
                <div className="relative w-48 h-48 mx-auto mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-muted"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                      className="text-primary transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Timer Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isBreak ? 'Break' : 'Focus'}
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={isRunning ? pauseTimer : startTimer}
                    className="w-14 h-14 rounded-full gradient-primary shadow-lg fab flex items-center justify-center"
                    aria-label={isRunning ? 'Pause timer' : 'Start timer'}
                  >
                    {isRunning ? (
                      <Pause className="w-6 h-6 text-primary-foreground" />
                    ) : (
                      <Play className="w-6 h-6 text-primary-foreground ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={resetTimer}
                    className="w-14 h-14 rounded-full bg-secondary hover:bg-accent shadow-lg fab flex items-center justify-center"
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-6 h-6 text-secondary-foreground" />
                  </button>
                </div>
              </div>

              {/* Session Complete Notification */}
              {sessionComplete && (
                <div className="bg-primary/10 border-t border-primary/20 p-4 animate-in slide-in-from-bottom duration-500">
                  <div className="text-center">
                    <p className="text-primary font-medium">
                      🎉 {isBreak ? 'Focus session' : 'Break'} complete!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isBreak ? 'Time for a break' : 'Ready for the next focus session?'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hydration Tracker Section */}
          <div className="space-y-6">
            <div className={`bg-card rounded-xl shadow-lg border border-border overflow-hidden transition-smooth ${
              showReminder ? 'pulse-reminder' : ''
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Droplets className="w-4 h-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">Hydration Tracker</h2>
                  </div>
                  {showReminder && (
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Reminder!
                    </div>
                  )}
                </div>

                {/* Hydration Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>{currentIntake}ml</span>
                    <span>{dailyGoal}ml goal</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${getHydrationPercentage()}%` }}
                    />
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(getHydrationPercentage())}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">of daily goal</span>
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => addWater(200)}
                    className="bg-secondary hover:bg-accent text-secondary-foreground p-4 rounded-lg fab flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>200ml</span>
                  </button>
                  <button
                    onClick={() => addWater(500)}
                    className="bg-secondary hover:bg-accent text-secondary-foreground p-4 rounded-lg fab flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>500ml</span>
                  </button>
                </div>

                {/* Custom Amount Input */}
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Custom amount (ml)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomWater()}
                    className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring transition-smooth"
                    min="1"
                    max="1000"
                  />
                  <button
                    onClick={addCustomWater}
                    disabled={!customAmount || parseInt(customAmount) <= 0}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg fab flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Daily Progress Info */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>
                      {currentIntake >= dailyGoal 
                        ? '🎉 Daily goal achieved!' 
                        : `${dailyGoal - currentIntake}ml remaining today`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Stats Card */}
            <div className="bg-card rounded-xl shadow-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.floor((focusTime * 60 - timeLeft) / 60)}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes Focused</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {Math.round(getHydrationPercentage())}%
                  </div>
                  <div className="text-sm text-muted-foreground">Hydration Goal</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Live Better - Your productivity and wellness companion</p>
            <p className="mt-1">Stay focused, stay hydrated, live better! 💜</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;