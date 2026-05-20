import { useMemo } from 'react';
import { Flame, Droplets, Activity, Plus, Minus, RefreshCw, Dumbbell, Clock, Apple } from 'lucide-react';
import { useApp } from '../store/AppContext';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HomeDashboard({ onNavigate }) {
  const {
    todayTotals, goals, todayWater, addWater, todaySteps, addSteps,
    streak, todayWorkout, todayScheduleLabel, activePlan,
    startWorkoutSession,
    selectedDate, setSelectedDate, dbLoading, workoutHistory, mealsByDate
  } = useApp();

  const getToday = () => new Date().toISOString().split('T')[0];

  // Check if a workout has been completed on the selectedDate
  const completedWorkout = useMemo(() => {
    return workoutHistory.find(w => w.date === selectedDate) || null;
  }, [workoutHistory, selectedDate]);

  const weekDays = useMemo(() => {
    const todayDateObj = new Date();
    const todayDay = todayDateObj.getDay(); // Sun=0 .. Sat=6
    const sundayDate = new Date(todayDateObj);
    sundayDate.setDate(todayDateObj.getDate() - todayDay);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sundayDate);
      d.setDate(sundayDate.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNumStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNumStr}`;
      
      const hasWorkout = workoutHistory.some(w => w.date === dateStr);
      const hasMeals = (mealsByDate[dateStr] && mealsByDate[dateStr].length > 0);
      
      return {
        day: dayLabels[i],
        dateNum: d.getDate(),
        dateStr,
        active: dateStr === selectedDate,
        isToday: dateStr === getToday(),
        hasWorkout,
        hasMeals
      };
    });
  }, [selectedDate, workoutHistory, mealsByDate]);

  const selectedDateObj = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return new Date();
  }, [selectedDate]);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${dayNames[selectedDateObj.getDay()]}, ${selectedDateObj.getDate()} ${months[selectedDateObj.getMonth()]}`;

  const calPct = Math.min(100, Math.round((todayTotals.calories / goals.calories) * 100)) || 0;
  const proteinPct = Math.min(100, Math.round((todayTotals.protein / goals.protein) * 100)) || 0;
  const carbsPct = Math.min(100, Math.round((todayTotals.carbs / goals.carbs) * 100)) || 0;
  const fatPct = Math.min(100, Math.round((todayTotals.fats / goals.fats) * 100)) || 0;
  const waterPct = Math.min(100, Math.round((todayWater / goals.water) * 100)) || 0;
  const stepPct = Math.min(100, Math.round((todaySteps / goals.steps) * 100)) || 0;

  const streakDots = weekDays.map((item) => ({
    day: item.day[0],
    completed: item.hasWorkout
  }));

  // Show skeleton screen if data is loading and cache is completely empty
  const showSkeleton = dbLoading && (workoutHistory.length === 0 && Object.keys(mealsByDate).length === 0 && !localStorage.getItem('ascend_profile'));

  if (showSkeleton) {
    return (
      <div className="p-screen fade-in">
        {/* Header Skeleton */}
        <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
          <div className="flex-col" style={{ width: '60%' }}>
            <div className="skeleton-text" style={{ width: '40%', height: 16, marginBottom: 8 }} />
            <div className="skeleton-title" style={{ width: '70%', height: 32 }} />
          </div>
          <div className="skeleton-circle" style={{ width: 48, height: 48 }} />
        </header>

        {/* Week Strip Skeleton */}
        <div className="flex-row mb-section" style={{ overflowX: 'auto', gap: 12, paddingBottom: 8, margin: '0 -24px', padding: '0 24px 8px' }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ minWidth: 54, height: 68 }} />
          ))}
        </div>

        {/* Rings Chart Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 180, marginBottom: 32 }} />

        {/* Workout Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 140, marginBottom: 32 }} />

        {/* Activity Card Skeleton */}
        <div className="skeleton" style={{ width: '100%', height: 100, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '100%', height: 100, marginBottom: 32 }} />
      </div>
    );
  }

  return (
    <div className="p-screen fade-in">
      {/* Header */}
      <header className="flex-row justify-between align-center mb-section" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="flex-row align-center gap-sm" onClick={() => onNavigate('settings')} style={{ cursor: 'pointer' }}>
          <Apple size={28} style={{ color: 'var(--text-primary)' }} fill="currentColor" />
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Ascend AI</span>
          {dbLoading && <RefreshCw size={14} className="text-tertiary animate-spin" style={{ marginLeft: 4 }} />}
        </div>
        <div className="flex-row align-center gap-xs" style={{
          background: 'rgba(255, 107, 0, 0.08)',
          color: 'var(--accent-orange)',
          padding: '6px 14px',
          borderRadius: 20,
          fontWeight: 700,
          fontSize: 14,
          border: '1px solid rgba(255, 107, 0, 0.15)'
        }}>
          🔥 {streak}
        </div>
      </header>

      {/* Week Dates Selector */}
      <section className="mb-section" style={{ marginTop: -12, marginBottom: 24 }}>
        <div className="text-label" style={{ fontSize: 13, marginBottom: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>{dateStr}</div>
        <div className="flex-row justify-between" style={{ margin: '0 -8px', padding: '0 8px', overflowX: 'auto', gap: 6 }}>
          {weekDays.map((item, i) => {
            const circleStyle = item.active ? {
              border: '2.5px solid var(--text-primary)',
              background: 'var(--bg-surface-elevated)'
            } : item.isToday ? {
              border: '2px solid var(--text-secondary)',
              background: 'var(--bg-surface)'
            } : item.hasWorkout ? {
              border: '2px solid var(--accent-red)',
              background: 'var(--bg-surface)'
            } : item.hasMeals ? {
              border: '2px solid var(--accent-green)',
              background: 'var(--bg-surface)'
            } : {
              border: '1.5px dashed var(--border-subtle)',
              background: 'transparent',
              opacity: 0.5
            };
            return (
              <button key={i}
                onClick={() => setSelectedDate(item.dateStr)}
                style={{
                  background: 'none', border: 'none', padding: 0, outline: 'none', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 38
                }}
              >
                <span className="text-caption" style={{ 
                  fontSize: 11, 
                  fontWeight: item.active ? '700' : '500',
                  color: item.active ? 'var(--text-primary)' : 'var(--text-tertiary)'
                }}>
                  {item.day}
                </span>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  color: item.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  ...circleStyle
                }}>
                  {item.dateNum}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Calorie Card */}
      <section className="mb-section" onClick={() => onNavigate('calories')} style={{ cursor: 'pointer' }}>
        <div className="card flex-row justify-between align-center" style={{ padding: '24px 20px', minHeight: 110, position: 'relative' }}>
          <div className="flex-col">
            <div className="flex-row align-bottom">
              <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {todayTotals.calories.toLocaleString()}
              </span>
              <span style={{ fontSize: 16, color: 'var(--text-tertiary)', marginLeft: 4, fontWeight: 500, paddingBottom: 3 }}>
                /{goals.calories.toLocaleString()}
              </span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
              Calories eaten
            </span>
          </div>

          <div style={{ position: 'relative', width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="70" height="70" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-subtle)" strokeWidth="6.5" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--text-primary)" strokeWidth="6.5"
                strokeDasharray="213.6" strokeDashoffset={213.6 - (calPct / 100) * 213.6}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="flex-col align-center" style={{ position: 'absolute', zIndex: 2 }}>
              <Flame size={18} style={{ color: 'var(--text-primary)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Nutrition Cards (Protein, Carbs, Fat) */}
      <section className="mb-section" style={{ marginTop: -8 }}>
        <div className="flex-row gap-md" style={{ gap: 12 }}>
          {/* Protein Card */}
          <div className="card flex-col justify-between align-center" style={{ flex: 1, padding: '16px 10px', minHeight: 140 }}>
            <div className="flex-col align-center" style={{ width: '100%' }}>
              <div className="flex-row align-bottom justify-center">
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{todayTotals.protein}</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 1 }}>/{goals.protein}g</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, textAlign: 'center', fontWeight: 500 }}>Protein eaten</span>
            </div>
            
            <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <svg width="44" height="44" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="21" fill="none" stroke="rgba(239, 68, 68, 0.12)" strokeWidth="4.5" />
                <circle cx="25" cy="25" r="21" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="4.5"
                  strokeDasharray="131.9" strokeDashoffset={131.9 - (proteinPct / 100) * 131.9}
                  strokeLinecap="round" transform="rotate(-90 25 25)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
              </svg>
              <div style={{ position: 'absolute', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(239, 68, 68)' }}>
                {/* Drumstick SVG */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 16c2-2 3-5 3-7s-2-3-3-3-5 1-7 3c-1.5 1.5-2.5 3.5-3 5.5l-3 3v2h2l3-3c2-.5 4-1.5 5.5-3z"/>
                  <path d="M17 7c.5.5 1 .5 1.5 0s.5-1 0-1.5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Carbs Card */}
          <div className="card flex-col justify-between align-center" style={{ flex: 1, padding: '16px 10px', minHeight: 140 }}>
            <div className="flex-col align-center" style={{ width: '100%' }}>
              <div className="flex-row align-bottom justify-center">
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{todayTotals.carbs}</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 1 }}>/{goals.carbs}g</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, textAlign: 'center', fontWeight: 500 }}>Carbs eaten</span>
            </div>
            
            <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <svg width="44" height="44" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="21" fill="none" stroke="rgba(249, 115, 22, 0.12)" strokeWidth="4.5" />
                <circle cx="25" cy="25" r="21" fill="none" stroke="rgb(249, 115, 22)" strokeWidth="4.5"
                  strokeDasharray="131.9" strokeDashoffset={131.9 - (carbsPct / 100) * 131.9}
                  strokeLinecap="round" transform="rotate(-90 25 25)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
              </svg>
              <div style={{ position: 'absolute', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(249, 115, 22)' }}>
                {/* Wheat/Leaf SVG */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22c1.25-3.25 3.75-5.75 7-7"/>
                  <path d="M9 15c2.5-2.5 5-2.5 7.5-5C19 7.5 20 5 20 2c-3 0-5.5 1-7.5 3.5C10 8 10 10.5 7.5 13c-1.25 1.25-2.25 2.5-3 4"/>
                  <path d="M14 10c.5.5.5 1.5 0 2s-1.5.5-2 0c-.5-.5-.5-1.5 0-2s1.5-.5 2 0z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Fats Card */}
          <div className="card flex-col justify-between align-center" style={{ flex: 1, padding: '16px 10px', minHeight: 140 }}>
            <div className="flex-col align-center" style={{ width: '100%' }}>
              <div className="flex-row align-bottom justify-center">
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{todayTotals.fats}</span>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 1 }}>/{goals.fats}g</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, textAlign: 'center', fontWeight: 500 }}>Fat eaten</span>
            </div>
            
            <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
              <svg width="44" height="44" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="21" fill="none" stroke="rgba(59, 130, 246, 0.12)" strokeWidth="4.5" />
                <circle cx="25" cy="25" r="21" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="4.5"
                  strokeDasharray="131.9" strokeDashoffset={131.9 - (fatPct / 100) * 131.9}
                  strokeLinecap="round" transform="rotate(-90 25 25)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
              </svg>
              <div style={{ position: 'absolute', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(59, 130, 246)' }}>
                {/* Avocado/Drop SVG */}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"/>
                  <path d="M12 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's / Selected Date's Workout */}
      <section className="mb-section">
        <div className="flex-row justify-between" style={{ marginBottom: 16 }}>
          <h2 className="text-h2">{selectedDate === getToday() ? "Today's Workout" : "Scheduled Workout"}</h2>
          <span className="text-body" style={{ color: 'var(--accent-blue)', fontWeight: 500, cursor: 'pointer' }} onClick={() => onNavigate('workout')}>See Plan</span>
        </div>
        <div className="card flex-row justify-between" style={{ padding: 24 }}>
          {completedWorkout ? (
            <div className="flex-col flex-1">
              <span className="text-caption text-green" style={{ marginBottom: 4 }}>Completed</span>
              <h3 className="text-h3" style={{ marginBottom: 8 }}>{completedWorkout.planName}</h3>
              <div className="flex-row gap-md text-label" style={{ fontSize: 13 }}>
                <span className="flex-row gap-sm" style={{ alignItems: 'center' }}><Clock size={13} /> {completedWorkout.duration}m</span>
                <span className="flex-row gap-sm" style={{ alignItems: 'center' }}><Dumbbell size={13} /> {completedWorkout.exercises} exercises</span>
                <span>{(completedWorkout.totalVolume / 1000).toFixed(1)}k kg volume</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-col">
                <span className="text-caption text-orange" style={{ marginBottom: 4 }}>{activePlan?.shortName || 'PPL'} • {todayScheduleLabel}</span>
                <h3 className="text-h3" style={{ marginBottom: 8 }}>
                  {todayWorkout ? todayWorkout.name : 'Rest Day'}
                </h3>
                <span className="text-label">{todayWorkout ? `${todayWorkout.exercises.length} Exercises` : 'Recovery & Stretch'}</span>
              </div>
              {todayWorkout && (
                <button className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14 }}
                  onClick={() => { startWorkoutSession(todayWorkout); onNavigate('workout'); }}>
                  Start
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* Daily Activity */}
      <section className="mb-section">
        <h2 className="text-h2" style={{ marginBottom: 16 }}>Daily Activity</h2>
        <div className="flex-col gap-md">
          {/* Steps */}
          <div className="card flex-row" style={{ padding: 16 }}>
            <div className="btn-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: 16 }}>
              <Activity size={20} className="text-orange" />
            </div>
            <div className="flex-col flex-1">
              <span className="text-label">Steps</span>
              <span className="text-h3">{todaySteps.toLocaleString()} <span className="text-body" style={{ fontSize: 14 }}>/ {goals.steps.toLocaleString()}</span></span>
              <div style={{ height: 4, background: 'var(--bg-surface-elevated)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stepPct}%`, background: 'var(--accent-orange)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <button className="btn-icon" style={{ width: 32, height: 32, marginLeft: 8 }}
              onClick={() => addSteps(500)}>
              <Plus size={16} />
            </button>
          </div>

          {/* Water */}
          <div className="card flex-row" style={{ padding: 16 }}>
            <div className="btn-icon" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: 16 }}>
              <Droplets size={20} className="text-blue" />
            </div>
            <div className="flex-col flex-1">
              <span className="text-label">Water</span>
              <span className="text-h3">{todayWater.toFixed(1)}L <span className="text-body" style={{ fontSize: 14 }}>/ {goals.water}L</span></span>
              <div style={{ height: 4, background: 'var(--bg-surface-elevated)', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${waterPct}%`, background: 'var(--accent-blue)', borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
            <div className="flex-row gap-sm" style={{ marginLeft: 8 }}>
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => addWater(-0.25)}>
                <Minus size={14} />
              </button>
              <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => addWater(0.25)}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Streaks */}
      <section className="mb-section">
        <div className="card flex-row justify-between align-center" style={{ padding: 20, background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(255, 69, 58, 0.05) 100%)' }}>
          <div className="flex-col">
            <span className="text-label">Current Streak</span>
            <div className="flex-row align-center gap-sm" style={{ marginTop: 4 }}>
              <Flame size={24} className="text-red" fill="var(--accent-red)" />
              <span className="text-h2">{streak} Days</span>
            </div>
          </div>
          <div className="flex-row gap-sm">
            {streakDots.map((dot, i) => (
              <div key={i} style={{
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: dot.completed ? 'var(--accent-red-dim)' : 'var(--bg-surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: dot.completed ? 'var(--accent-red)' : 'var(--text-tertiary)',
                fontSize: 12, fontWeight: 600
              }}>
                {dot.day}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
