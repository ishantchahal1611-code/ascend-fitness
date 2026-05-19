import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { WORKOUT_TEMPLATES, DEFAULT_MEALS, DEFAULT_ACTIVITIES, DEFAULT_WORKOUT_HISTORY, DEFAULT_BODYWEIGHT, getExercise } from '../data/presets';

const AppContext = createContext();
const getToday = () => new Date().toISOString().split('T')[0];
let _id = Date.now();
export const uid = () => (_id++).toString(36);

function load(key, def) {
  try { const v = localStorage.getItem(`ascend_${key}`); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function save(key, val) { localStorage.setItem(`ascend_${key}`, JSON.stringify(val)); }

export function AppProvider({ children }) {
  // ── Settings ──
  const [theme, setThemeRaw] = useState(() => load('theme', 'dark'));
  const [units, setUnitsRaw] = useState(() => load('units', { weight: 'kg', distance: 'km' }));
  const [goals, setGoalsRaw] = useState(() => load('goals', { calories: 2400, protein: 160, carbs: 250, fats: 70, water: 3.0, steps: 10000 }));
  const [profile, setProfileRaw] = useState(() => load('profile', { name: 'User', age: 25, height: 175, gender: 'Other' }));
  const [notifications, setNotificationsRaw] = useState(() => load('notifications', { workout: true, meals: true, water: true, steps: true }));

  const setTheme = useCallback(v => { setThemeRaw(v); save('theme', v); }, []);
  const setUnits = useCallback(v => { setUnitsRaw(v); save('units', v); }, []);
  const setGoals = useCallback(v => { setGoalsRaw(v); save('goals', v); }, []);
  const setProfile = useCallback(v => { setProfileRaw(v); save('profile', v); }, []);
  const setNotifications = useCallback(v => { setNotificationsRaw(v); save('notifications', v); }, []);

  // Resolve theme
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  // ── Active Workout Plan ──
  const [activePlanId, setActivePlanId] = useState(() => load('activePlanId', 'ppl'));
  const [customPlans, setCustomPlans] = useState(() => load('customPlans', []));

  const allPlans = useMemo(() => [...WORKOUT_TEMPLATES, ...customPlans], [customPlans]);
  const activePlan = useMemo(() => allPlans.find(p => p.id === activePlanId) || allPlans[0], [allPlans, activePlanId]);

  const setActivePlan = useCallback(id => { setActivePlanId(id); save('activePlanId', id); }, []);
  const addCustomPlan = useCallback(plan => {
    setCustomPlans(prev => { const n = [...prev, { ...plan, id: uid() }]; save('customPlans', n); return n; });
  }, []);
  const editCustomPlan = useCallback((id, updates) => {
    setCustomPlans(prev => { const n = prev.map(p => p.id === id ? { ...p, ...updates } : p); save('customPlans', n); return n; });
  }, []);
  const deleteCustomPlan = useCallback(id => {
    setCustomPlans(prev => { const n = prev.filter(p => p.id !== id); save('customPlans', n); return n; });
    if (activePlanId === id) setActivePlan('ppl');
  }, [activePlanId, setActivePlan]);
  const duplicatePlan = useCallback(id => {
    const src = allPlans.find(p => p.id === id);
    if (src) addCustomPlan({ ...src, name: src.name + ' (Copy)', shortName: src.shortName + '*' });
  }, [allPlans, addCustomPlan]);

  // ── Today's workout day ──
  const todayDayIndex = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1; // Mon=0 .. Sun=6
  }, []);
  const todayScheduleLabel = activePlan?.schedule?.[todayDayIndex] || 'Rest';
  const todayWorkout = useMemo(() => {
    if (!activePlan || todayScheduleLabel === 'Rest') return null;
    return activePlan.days.find(d => d.shortName === todayScheduleLabel) || null;
  }, [activePlan, todayScheduleLabel]);

  // ── Active Workout Session ──
  const [activeSession, setActiveSession] = useState(null);
  const [restTimer, setRestTimer] = useState({ active: false, remaining: 0, duration: 90 });

  const startWorkoutSession = useCallback((dayData) => {
    const exercises = dayData.exercises.map(ex => ({
      ...ex,
      info: getExercise(ex.exerciseId),
      loggedSets: Array.from({ length: ex.sets }, () => ({ weight: ex.weight, reps: parseInt(ex.reps) || 10, completed: false })),
    }));
    setActiveSession({ dayName: dayData.name, startTime: Date.now(), exercises, currentExIdx: 0 });
  }, []);

  const toggleSetComplete = useCallback((exIdx, setIdx) => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const loggedSets = ex.loggedSets.map((s, si) => si === setIdx ? { ...s, completed: !s.completed } : s);
        return { ...ex, loggedSets };
      });
      return { ...prev, exercises };
    });
  }, []);

  const updateSetData = useCallback((exIdx, setIdx, field, value) => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const loggedSets = ex.loggedSets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s);
        return { ...ex, loggedSets };
      });
      return { ...prev, exercises };
    });
  }, []);

  const addSetToExercise = useCallback((exIdx) => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        const last = ex.loggedSets[ex.loggedSets.length - 1];
        return { ...ex, loggedSets: [...ex.loggedSets, { weight: last?.weight || 0, reps: last?.reps || 10, completed: false }] };
      });
      return { ...prev, exercises };
    });
  }, []);

  const removeSetFromExercise = useCallback((exIdx, setIdx) => {
    setActiveSession(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) => {
        if (ei !== exIdx) return ex;
        if (ex.loggedSets.length <= 1) return ex;
        return { ...ex, loggedSets: ex.loggedSets.filter((_, si) => si !== setIdx) };
      });
      return { ...prev, exercises };
    });
  }, []);

  const startRestTimer = useCallback((dur) => {
    setRestTimer({ active: true, remaining: dur || 90, duration: dur || 90 });
  }, []);

  const cancelRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, active: false, remaining: 0 }));
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (!restTimer.active || restTimer.remaining <= 0) return;
    const t = setInterval(() => {
      setRestTimer(prev => {
        if (prev.remaining <= 1) return { ...prev, active: false, remaining: 0 };
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restTimer.active, restTimer.remaining]);

  // ── Workout History ──
  const [workoutHistory, setWorkoutHistory] = useState(() => load('workoutHistory', DEFAULT_WORKOUT_HISTORY));
  const [personalRecords, setPersonalRecords] = useState(() => load('prs', {}));

  const finishWorkout = useCallback(() => {
    if (!activeSession) return;
    const dur = Math.round((Date.now() - activeSession.startTime) / 60000);
    let totalVol = 0;
    const newPRs = { ...personalRecords };
    activeSession.exercises.forEach(ex => {
      ex.loggedSets.forEach(s => {
        if (s.completed) {
          totalVol += s.weight * s.reps;
          const key = ex.exerciseId;
          if (!newPRs[key] || s.weight > newPRs[key]) newPRs[key] = s.weight;
        }
      });
    });
    const entry = { id: uid(), planName: activeSession.dayName, date: getToday(), duration: dur || 1, exercises: activeSession.exercises.length, totalVolume: totalVol };
    setWorkoutHistory(prev => { const n = [entry, ...prev]; save('workoutHistory', n); return n; });
    setPersonalRecords(newPRs);
    save('prs', newPRs);
    setActiveSession(null);
    cancelRestTimer();
  }, [activeSession, personalRecords, cancelRestTimer]);

  const cancelWorkout = useCallback(() => { setActiveSession(null); cancelRestTimer(); }, [cancelRestTimer]);

  // ── Meals / Nutrition ──
  const [mealsByDate, setMealsByDate] = useState(() => load('meals', { [getToday()]: DEFAULT_MEALS }));
  const [favoriteFoods, setFavoriteFoods] = useState(() => load('favFoods', []));

  const todayMeals = mealsByDate[getToday()] || [];

  const addMeal = useCallback((meal) => {
    const today = getToday();
    setMealsByDate(prev => {
      const dayMeals = prev[today] || [];
      const n = { ...prev, [today]: [...dayMeals, { ...meal, id: uid() }] };
      save('meals', n); return n;
    });
  }, []);

  const removeMeal = useCallback((mealId) => {
    const today = getToday();
    setMealsByDate(prev => {
      const n = { ...prev, [today]: (prev[today] || []).filter(m => m.id !== mealId) };
      save('meals', n); return n;
    });
  }, []);

  const editMeal = useCallback((mealId, updates) => {
    const today = getToday();
    setMealsByDate(prev => {
      const n = { ...prev, [today]: (prev[today] || []).map(m => m.id === mealId ? { ...m, ...updates } : m) };
      save('meals', n); return n;
    });
  }, []);

  const toggleFavorite = useCallback((food) => {
    setFavoriteFoods(prev => {
      const exists = prev.find(f => f.id === food.id);
      const n = exists ? prev.filter(f => f.id !== food.id) : [...prev, food];
      save('favFoods', n); return n;
    });
  }, []);

  const todayTotals = useMemo(() => {
    return todayMeals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories * (m.qty || 1)),
      protein: acc.protein + (m.protein * (m.qty || 1)),
      carbs: acc.carbs + (m.carbs * (m.qty || 1)),
      fats: acc.fats + (m.fats * (m.qty || 1)),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [todayMeals]);

  // ── Water ──
  const [waterByDate, setWaterByDate] = useState(() => load('water', { [getToday()]: 1.5 }));
  const todayWater = waterByDate[getToday()] || 0;

  const addWater = useCallback((amount) => {
    const today = getToday();
    setWaterByDate(prev => {
      const n = { ...prev, [today]: Math.max(0, (prev[today] || 0) + amount) };
      save('water', n); return n;
    });
  }, []);

  // ── Bodyweight ──
  const [bodyweightLog, setBodyweightLog] = useState(() => load('bodyweight', DEFAULT_BODYWEIGHT));
  const currentWeight = bodyweightLog[bodyweightLog.length - 1]?.weight || 78;

  const addBodyweight = useCallback((weight) => {
    setBodyweightLog(prev => {
      const today = getToday();
      const filtered = prev.filter(e => e.date !== today);
      const n = [...filtered, { date: today, weight }];
      save('bodyweight', n); return n;
    });
  }, []);

  // ── Steps ──
  const [stepsByDate, setStepsByDate] = useState(() => load('steps', { [getToday()]: 6432 }));
  const todaySteps = stepsByDate[getToday()] || 0;

  const addSteps = useCallback((count) => {
    const today = getToday();
    setStepsByDate(prev => {
      const n = { ...prev, [today]: (prev[today] || 0) + count };
      save('steps', n); return n;
    });
  }, []);

  // ── Activities ──
  const [activities, setActivities] = useState(() => load('activities', DEFAULT_ACTIVITIES));
  const [liveActivity, setLiveActivity] = useState(null);

  const startLiveActivity = useCallback((type) => {
    setLiveActivity({ type, label: type === 'run' ? 'Running' : type === 'walk' ? 'Walking' : 'Cycling', startTime: Date.now(), distance: 0, elapsed: 0 });
  }, []);

  const stopLiveActivity = useCallback(() => {
    if (!liveActivity) return;
    const dur = Math.round((Date.now() - liveActivity.startTime) / 1000);
    const speed = liveActivity.type === 'run' ? 340 : liveActivity.type === 'walk' ? 620 : 180;
    const dist = parseFloat((dur / speed).toFixed(2));
    const paceMin = Math.floor(dur / 60 / (dist || 1));
    const paceSec = Math.round((dur / (dist || 1)) % 60);
    const cal = Math.round(dist * (liveActivity.type === 'run' ? 80 : liveActivity.type === 'walk' ? 55 : 45));
    const entry = {
      id: uid(), type: liveActivity.type, label: liveActivity.label,
      date: getToday(), distance: parseFloat(dist.toFixed(1)),
      duration: dur, pace: `${paceMin}:${String(paceSec).padStart(2, '0')}`, calories: cal,
    };
    setActivities(prev => { const n = [entry, ...prev]; save('activities', n); return n; });
    setLiveActivity(null);
  }, [liveActivity]);

  const cancelLiveActivity = useCallback(() => { setLiveActivity(null); }, []);

  // ── Streak ──
  const streak = useMemo(() => {
    const hist = workoutHistory.map(w => w.date).sort().reverse();
    if (hist.length === 0) return 0;
    let count = 0;
    let d = new Date(getToday());
    for (let i = 0; i < 60; i++) {
      const ds = d.toISOString().split('T')[0];
      if (hist.includes(ds)) { count++; }
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count || 14; // fallback for demo
  }, [workoutHistory]);

  // ── Week Stats ──
  const weekActivityStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekActivities = activities.filter(a => new Date(a.date) >= weekAgo);
    return {
      distance: weekActivities.reduce((s, a) => s + a.distance, 0),
      duration: weekActivities.reduce((s, a) => s + a.duration, 0),
      count: weekActivities.length,
    };
  }, [activities]);

  const value = {
    theme, setTheme, resolvedTheme,
    units, setUnits, goals, setGoals, profile, setProfile, notifications, setNotifications,
    activePlan, activePlanId, setActivePlan, allPlans, customPlans,
    addCustomPlan, editCustomPlan, deleteCustomPlan, duplicatePlan,
    todayDayIndex, todayScheduleLabel, todayWorkout,
    activeSession, startWorkoutSession, toggleSetComplete, updateSetData, addSetToExercise, removeSetFromExercise,
    finishWorkout, cancelWorkout, restTimer, startRestTimer, cancelRestTimer,
    workoutHistory, personalRecords,
    todayMeals, todayTotals, addMeal, removeMeal, editMeal, favoriteFoods, toggleFavorite,
    todayWater, addWater, waterByDate,
    bodyweightLog, currentWeight, addBodyweight,
    todaySteps, addSteps,
    activities, liveActivity, startLiveActivity, stopLiveActivity, cancelLiveActivity, weekActivityStats,
    streak,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
