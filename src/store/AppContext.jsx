import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { WORKOUT_TEMPLATES, getExercise } from '../data/presets';
import { supabase } from '../supabaseClient';

const AppContext = createContext();
const getToday = () => new Date().toISOString().split('T')[0];
let _id = Date.now();
export const uid = () => (_id++).toString(36);

function load(key, def) {
  try { const v = localStorage.getItem(`ascend_${key}`); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function save(key, val) { localStorage.setItem(`ascend_${key}`, JSON.stringify(val)); }

export function AppProvider({ children, session }) {
  const [dbLoading, setDbLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [theme, setTheme] = useState(() => load('theme', 'dark'));
  const [units, setUnits] = useState(() => load('units', { weight: 'kg', distance: 'km' }));
  const [goals, setGoals] = useState(() => load('goals', { calories: 2400, protein: 160, carbs: 250, fats: 70, water: 3.0, steps: 10000 }));
  const [profile, setProfile] = useState(() => load('profile', { name: 'User', age: 25, height: 175, gender: 'Other' }));
  const [notifications, setNotifications] = useState(() => load('notifications', { workout: true, meals: true, water: true, steps: true }));

  useEffect(() => {
    if (!dbLoading) {
      save('theme', theme);
      if (session?.user?.id) {
        supabase.from('profiles').upsert({ id: session.user.id, theme }).then(({ error }) => {
          if (error) console.error('Error saving theme:', error);
        });
      }
    }
  }, [theme, dbLoading, session]);

  useEffect(() => {
    if (!dbLoading) {
      save('units', units);
      if (session?.user?.id) {
        supabase.from('profiles').upsert({ id: session.user.id, units }).then(({ error }) => {
          if (error) console.error('Error saving units:', error);
        });
      }
    }
  }, [units, dbLoading, session]);

  useEffect(() => {
    if (!dbLoading) {
      save('goals', goals);
      if (session?.user?.id) {
        supabase.from('profiles').upsert({ id: session.user.id, goals }).then(({ error }) => {
          if (error) console.error('Error saving goals:', error);
        });
      }
    }
  }, [goals, dbLoading, session]);

  useEffect(() => {
    if (!dbLoading) {
      save('profile', profile);
      if (session?.user?.id) {
        supabase.from('profiles').upsert({
          id: session.user.id,
          name: profile.name,
          age: profile.age,
          height: profile.height,
          gender: profile.gender
        }).then(({ error }) => {
          if (error) console.error('Error saving profile:', error);
        });
      }
    }
  }, [profile, dbLoading, session]);

  useEffect(() => {
    if (!dbLoading) {
      save('notifications', notifications);
      if (session?.user?.id) {
        supabase.from('profiles').upsert({ id: session.user.id, notifications }).then(({ error }) => {
          if (error) console.error('Error saving notifications:', error);
        });
      }
    }
  }, [notifications, dbLoading, session]);



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

  // ── Selected Date ──
  const [selectedDate, setSelectedDate] = useState(() => getToday());

  // ── Active Workout Plan ──
  const [activePlanId, setActivePlanId] = useState(() => load('activePlanId', 'ppl'));
  const [customPlans, setCustomPlans] = useState(() => load('customPlans', []));

  useEffect(() => { if (!dbLoading) save('activePlanId', activePlanId); }, [activePlanId, dbLoading]);
  useEffect(() => { if (!dbLoading) save('customPlans', customPlans); }, [customPlans, dbLoading]);

  const allPlans = useMemo(() => [...WORKOUT_TEMPLATES, ...customPlans], [customPlans]);
  const activePlan = useMemo(() => allPlans.find(p => p.id === activePlanId) || allPlans[0], [allPlans, activePlanId]);

  const setActivePlan = setActivePlanId;
  const addCustomPlan = useCallback(async plan => {
    const newId = uid();
    const newPlan = { ...plan, id: newId };
    setCustomPlans(prev => [...prev, newPlan]);
    if (session?.user?.id) {
      await supabase.from('custom_plans').insert({
        id: newId,
        user_id: session.user.id,
        name: plan.name,
        short_name: plan.shortName,
        schedule: plan.schedule,
        days: plan.days
      });
    }
  }, [session]);

  const editCustomPlan = useCallback(async (id, updates) => {
    setCustomPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (session?.user?.id) {
      const { data } = await supabase.from('custom_plans').select('*').eq('id', id).single();
      const current = data ? {
        id: data.id,
        name: data.name,
        shortName: data.short_name,
        schedule: data.schedule,
        days: data.days
      } : customPlans.find(p => p.id === id);
      if (current) {
        const merged = { ...current, ...updates };
        await supabase.from('custom_plans').upsert({
          id,
          user_id: session.user.id,
          name: merged.name,
          short_name: merged.shortName,
          schedule: merged.schedule,
          days: merged.days
        });
      }
    }
  }, [session, customPlans]);

  const deleteCustomPlan = useCallback(async id => {
    setCustomPlans(prev => prev.filter(p => p.id !== id));
    if (activePlanId === id) setActivePlanId('ppl');
    if (session?.user?.id) {
      await supabase.from('custom_plans').delete().eq('id', id).eq('user_id', session.user.id);
    }
  }, [activePlanId, session]);

  const duplicatePlan = useCallback(id => {
    const src = allPlans.find(p => p.id === id);
    if (src) addCustomPlan({ ...src, name: src.name + ' (Copy)', shortName: src.shortName + '*' });
  }, [allPlans, addCustomPlan]);

  // ── Today's workout day ──
  const todayDayIndex = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const day = d.getDay();
      return day === 0 ? 6 : day - 1; // Mon=0 .. Sun=6
    }
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  }, [selectedDate]);
  const todayScheduleLabel = useMemo(() => activePlan?.schedule?.[todayDayIndex] || 'Rest', [activePlan, todayDayIndex]);
  const todayWorkout = useMemo(() => {
    if (!activePlan || todayScheduleLabel === 'Rest') return null;
    return activePlan.days.find(d => d.shortName === todayScheduleLabel) || null;
  }, [activePlan, todayScheduleLabel]);

  // ── Active Workout Session ──
  const [activeSession, setActiveSession] = useState(() => load('activeSession', null));
  const [restTimer, setRestTimer] = useState(() => {
    const saved = load('restTimer', { active: false, remaining: 0, duration: 90, endTime: null });
    if (saved.active && saved.endTime) {
      const rem = Math.ceil((saved.endTime - Date.now()) / 1000);
      if (rem > 0) return { ...saved, remaining: rem };
      return { active: false, remaining: 0, duration: 90, endTime: null };
    }
    return saved;
  });

  useEffect(() => save('activeSession', activeSession), [activeSession]);
  useEffect(() => save('restTimer', restTimer), [restTimer]);

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
    const duration = dur || 90;
    setRestTimer({ active: true, remaining: duration, duration, endTime: Date.now() + duration * 1000 });
  }, []);

  const cancelRestTimer = useCallback(() => {
    setRestTimer(prev => ({ ...prev, active: false, remaining: 0, endTime: null }));
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (!restTimer.active || restTimer.remaining <= 0) return;
    const t = setInterval(() => {
      setRestTimer(prev => {
        if (prev.remaining <= 1) return { ...prev, active: false, remaining: 0, endTime: null };
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [restTimer.active, restTimer.remaining]);

  // ── Workout History ──
  const [workoutHistory, setWorkoutHistory] = useState(() => load('workoutHistory', []));
  const [personalRecords, setPersonalRecords] = useState(() => load('prs', {}));

  useEffect(() => { if (!dbLoading) save('workoutHistory', workoutHistory); }, [workoutHistory, dbLoading]);
  useEffect(() => { if (!dbLoading) save('prs', personalRecords); }, [personalRecords, dbLoading]);

  const finishWorkout = useCallback(async () => {
    if (!activeSession) return;
    const dur = Math.round((Date.now() - activeSession.startTime) / 60000);
    let totalVol = 0;
    const newPRs = { ...personalRecords };
    const prsToUpsert = [];
    
    activeSession.exercises.forEach(ex => {
      ex.loggedSets.forEach(s => {
        if (s.completed) {
          totalVol += s.weight * s.reps;
          const key = ex.exerciseId;
          if (!newPRs[key] || s.weight > newPRs[key]) {
            newPRs[key] = s.weight;
            prsToUpsert.push({
              user_id: session?.user?.id,
              exercise_id: key,
              weight: s.weight
            });
          }
        }
      });
    });
    const entryId = uid();
    const today = selectedDate;
    const entry = { id: entryId, planName: activeSession.dayName, date: today, duration: dur || 1, exercises: activeSession.exercises.length, totalVolume: totalVol };
    setWorkoutHistory(prev => [entry, ...prev]);
    setPersonalRecords(newPRs);
    setActiveSession(null);
    cancelRestTimer();

    if (session?.user?.id) {
      await supabase.from('workout_history').insert({
        id: entryId,
        user_id: session.user.id,
        plan_name: activeSession.dayName,
        date: today,
        duration: dur || 1,
        exercises: activeSession.exercises.length,
        total_volume: totalVol
      });
      
      for (const pr of prsToUpsert) {
        await supabase.from('personal_records').upsert(pr);
      }
    }
  }, [activeSession, personalRecords, cancelRestTimer, session, selectedDate]);

  const cancelWorkout = useCallback(() => { setActiveSession(null); cancelRestTimer(); }, [cancelRestTimer]);

  // ── Meals / Nutrition ──
  const [mealsByDate, setMealsByDate] = useState(() => load('meals', {}));
  const [favoriteFoods, setFavoriteFoods] = useState(() => load('favFoods', []));

  useEffect(() => { if (!dbLoading) save('meals', mealsByDate); }, [mealsByDate, dbLoading]);
  useEffect(() => { if (!dbLoading) save('favFoods', favoriteFoods); }, [favoriteFoods, dbLoading]);

  const todayMeals = useMemo(() => mealsByDate[selectedDate] || [], [mealsByDate, selectedDate]);

  const addMeal = useCallback(async (meal) => {
    const today = selectedDate;
    const newId = uid();
    const newMeal = { ...meal, id: newId };
    setMealsByDate(prev => {
      const dayMeals = prev[today] || [];
      return { ...prev, [today]: [...dayMeals, newMeal] };
    });
    if (session?.user?.id) {
      await supabase.from('meals').insert({
        id: newId,
        user_id: session.user.id,
        date: today,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        qty: meal.qty || 1
      });
    }
  }, [session, selectedDate]);

  const removeMeal = useCallback(async (mealId) => {
    const today = selectedDate;
    setMealsByDate(prev => {
      return { ...prev, [today]: (prev[today] || []).filter(m => m.id !== mealId) };
    });
    if (session?.user?.id) {
      await supabase.from('meals').delete().eq('id', mealId).eq('user_id', session.user.id);
    }
  }, [session, selectedDate]);

  const editMeal = useCallback(async (mealId, updates) => {
    const today = selectedDate;
    setMealsByDate(prev => {
      return { ...prev, [today]: (prev[today] || []).map(m => m.id === mealId ? { ...m, ...updates } : m) };
    });
    if (session?.user?.id) {
      const dayMeals = mealsByDate[today] || [];
      const meal = dayMeals.find(m => m.id === mealId);
      if (meal) {
        const merged = { ...meal, ...updates };
        await supabase.from('meals').upsert({
          id: mealId,
          user_id: session.user.id,
          date: today,
          name: merged.name,
          calories: merged.calories,
          protein: merged.protein,
          carbs: merged.carbs,
          fats: merged.fats,
          qty: merged.qty || 1
        });
      }
    }
  }, [session, mealsByDate, selectedDate]);

  const toggleFavorite = useCallback(async (food) => {
    const exists = favoriteFoods.find(f => f.id === food.id);
    setFavoriteFoods(prev => {
      return exists ? prev.filter(f => f.id !== food.id) : [...prev, food];
    });
    if (session?.user?.id) {
      if (exists) {
        await supabase.from('favorite_foods').delete().eq('id', food.id).eq('user_id', session.user.id);
      } else {
        await supabase.from('favorite_foods').insert({
          id: food.id,
          user_id: session.user.id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats
        });
      }
    }
  }, [session, favoriteFoods]);

  const todayTotals = useMemo(() => {
    return todayMeals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories * (m.qty || 1)),
      protein: acc.protein + (m.protein * (m.qty || 1)),
      carbs: acc.carbs + (m.carbs * (m.qty || 1)),
      fats: acc.fats + (m.fats * (m.qty || 1)),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [todayMeals]);

  // ── Water ──
  const [waterByDate, setWaterByDate] = useState(() => load('water', {}));
  const todayWater = useMemo(() => waterByDate[selectedDate] || 0, [waterByDate, selectedDate]);
  
  useEffect(() => { if (!dbLoading) save('water', waterByDate); }, [waterByDate, dbLoading]);

  const upsertDailyMetric = useCallback(async (date, updates) => {
    if (!session?.user?.id) return;
    const { data } = await supabase.from('daily_metrics')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', date)
      .maybeSingle();
      
    const merged = {
      user_id: session.user.id,
      date,
      water: updates.water !== undefined ? updates.water : (data?.water || 0),
      steps: updates.steps !== undefined ? updates.steps : (data?.steps || 0),
      bodyweight: updates.bodyweight !== undefined ? updates.bodyweight : (data?.bodyweight || null)
    };
    await supabase.from('daily_metrics').upsert(merged);
  }, [session]);

  const addWater = useCallback(async (amount) => {
    const today = selectedDate;
    const newWater = Math.max(0, (waterByDate[today] || 0) + amount);
    setWaterByDate(prev => ({ ...prev, [today]: newWater }));
    if (session?.user?.id) {
      await upsertDailyMetric(today, { water: newWater });
    }
  }, [session, waterByDate, upsertDailyMetric, selectedDate]);

  // ── Bodyweight ──
  const [bodyweightLog, setBodyweightLog] = useState(() => load('bodyweight', []));
  const currentWeight = bodyweightLog[bodyweightLog.length - 1]?.weight || 78;

  useEffect(() => { if (!dbLoading) save('bodyweight', bodyweightLog); }, [bodyweightLog, dbLoading]);

  const addBodyweight = useCallback(async (weight) => {
    const today = selectedDate;
    setBodyweightLog(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [...filtered, { date: today, weight }];
    });
    if (session?.user?.id) {
      await upsertDailyMetric(today, { bodyweight: weight });
    }
  }, [session, upsertDailyMetric, selectedDate]);

  // ── Steps ──
  const [stepsByDate, setStepsByDate] = useState(() => load('steps', {}));
  const todaySteps = useMemo(() => stepsByDate[selectedDate] || 0, [stepsByDate, selectedDate]);

  useEffect(() => { if (!dbLoading) save('steps', stepsByDate); }, [stepsByDate, dbLoading]);

  const addSteps = useCallback(async (count) => {
    const today = selectedDate;
    const newSteps = (stepsByDate[today] || 0) + count;
    setStepsByDate(prev => ({ ...prev, [today]: newSteps }));
    if (session?.user?.id) {
      await upsertDailyMetric(today, { steps: newSteps });
    }
  }, [session, stepsByDate, upsertDailyMetric, selectedDate]);

  // ── Activities ──
  const [activities, setActivities] = useState(() => load('activities', []));
  const [liveActivity, setLiveActivity] = useState(() => load('liveActivity', null));

  useEffect(() => { if (!dbLoading) save('activities', activities); }, [activities, dbLoading]);
  useEffect(() => { if (!dbLoading) save('liveActivity', liveActivity); }, [liveActivity, dbLoading]);

  const startLiveActivity = useCallback((type) => {
    setLiveActivity({ type, label: type === 'run' ? 'Running' : type === 'walk' ? 'Walking' : 'Cycling', startTime: Date.now(), distance: 0, elapsed: 0 });
  }, []);

  const stopLiveActivity = useCallback(async () => {
    if (!liveActivity) return;
    const dur = Math.round((Date.now() - liveActivity.startTime) / 1000);
    const speed = liveActivity.type === 'run' ? 340 : liveActivity.type === 'walk' ? 620 : 180;
    const dist = parseFloat((dur / speed).toFixed(2));
    const paceMin = Math.floor(dur / 60 / (dist || 1));
    const paceSec = Math.round((dur / (dist || 1)) % 60);
    const cal = Math.round(dist * (liveActivity.type === 'run' ? 80 : liveActivity.type === 'walk' ? 55 : 45));
    const newId = uid();
    const today = getToday();
    const entry = {
      id: newId, type: liveActivity.type, label: liveActivity.label,
      date: today, distance: parseFloat(dist.toFixed(1)),
      duration: dur, pace: `${paceMin}:${String(paceSec).padStart(2, '0')}`, calories: cal,
    };
    setActivities(prev => [entry, ...prev]);
    setLiveActivity(null);

    if (session?.user?.id) {
      await supabase.from('activities').insert({
        id: newId,
        user_id: session.user.id,
        type: liveActivity.type,
        label: liveActivity.label,
        date: today,
        distance: parseFloat(dist.toFixed(1)),
        duration: dur,
        pace: `${paceMin}:${String(paceSec).padStart(2, '0')}`,
        calories: cal
      });
    }
  }, [liveActivity, session]);

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

  const completeOnboarding = useCallback(async (data) => {
    setDbLoading(true);
    try {
      const isMetric = data.units.weight === 'kg';
      const weightKg = isMetric ? parseFloat(data.weight) : parseFloat(data.weight) * 0.453592;
      const heightCm = isMetric ? parseFloat(data.height) : parseFloat(data.height) * 2.54;
      const goalWeightKg = isMetric ? parseFloat(data.goalWeight) : parseFloat(data.goalWeight) * 0.453592;
      
      // Calculate BMR (Harris-Benedict equation)
      let bmr = 0;
      if (data.gender === 'Male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(data.age) + 5;
      } else if (data.gender === 'Female') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(data.age) - 161;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(data.age) - 78; // average
      }
      
      // TDEE = BMR * 1.375 (lightly active)
      const tdee = Math.round(bmr * 1.375);
      
      // Deficit based on target monthly rate
      let deficit = 500; // default Moderate
      if (data.weightLossRate === 'Conservative') deficit = 250;
      else if (data.weightLossRate === 'Aggressive') deficit = 1000;
      
      const calGoal = Math.max(1200, Math.round(tdee - deficit));
      
      // Protein: 2.0g per kg of target weight
      const proteinGoal = Math.round(goalWeightKg * 2.0);
      
      // Fats: 25% of calories
      const fatGoal = Math.round((calGoal * 0.25) / 9);
      
      // Carbs: remainder
      const carbGoal = Math.max(50, Math.round((calGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4));
      
      const computedGoals = {
        calories: calGoal,
        protein: proteinGoal,
        carbs: carbGoal,
        fats: fatGoal,
        water: isMetric ? 3.0 : 100, // 3 Liters or 100 oz
        steps: 10000,
        weight: parseFloat(data.goalWeight) // Save target weight in goals
      };

      const computedProfile = {
        name: data.name,
        age: parseInt(data.age),
        height: parseFloat(data.height),
        gender: data.gender
      };

      // 1. Save profile to Supabase
      const newProfile = {
        id: session.user.id,
        name: computedProfile.name,
        age: computedProfile.age,
        height: computedProfile.height,
        gender: computedProfile.gender,
        theme,
        units: data.units,
        goals: computedGoals,
        notifications
      };
      
      const { error: insertError } = await supabase
        .from('profiles')
        .upsert(newProfile);
      
      if (insertError) throw insertError;

      // 2. Add first bodyweight record
      const todayDate = getToday();
      const { error: metricError } = await supabase
        .from('daily_metrics')
        .upsert({
          user_id: session.user.id,
          date: todayDate,
          bodyweight: parseFloat(data.weight),
          water: 0,
          steps: 0
        });
      
      if (metricError) throw metricError;

      // Update local state
      setProfile(computedProfile);
      setGoals(computedGoals);
      setUnits(data.units);
      setBodyweightLog([{ date: todayDate, weight: parseFloat(data.weight) }]);
      setNeedsOnboarding(false);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      alert(err.message || 'Error saving onboarding data');
    } finally {
      setDbLoading(false);
    }
  }, [session, theme, notifications]);

  useEffect(() => {
    async function loadUserData() {
      if (!session?.user?.id) {
        setDbLoading(false);
        return;
      }
      try {
        setDbLoading(true);
        // 1. Load Profile
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profileData) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
          setTheme(profileData.theme || 'dark');
          setUnits(profileData.units || { weight: 'kg', distance: 'km' });
          setGoals(profileData.goals || { calories: 2400, protein: 160, carbs: 250, fats: 70, water: 3.0, steps: 10000 });
          setProfile({
            name: profileData.name || 'User',
            age: profileData.age || 25,
            height: profileData.height || 175,
            gender: profileData.gender || 'Other'
          });
          setNotifications(profileData.notifications || { workout: true, meals: true, water: true, steps: true });

          // 2. Load Custom Plans
          const { data: plansData, error: plansError } = await supabase
            .from('custom_plans')
            .select('*')
            .eq('user_id', session.user.id);
          if (plansError) throw plansError;
          if (plansData) {
            setCustomPlans(plansData.map(p => ({
              id: p.id,
              name: p.name,
              shortName: p.short_name,
              schedule: p.schedule,
              days: p.days
            })));
          }

          // 3. Load Workout History
          const { data: historyData, error: historyError } = await supabase
            .from('workout_history')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });
          if (historyError) throw historyError;
          if (historyData) {
            setWorkoutHistory(historyData.map(h => ({
              id: h.id,
              planName: h.plan_name,
              date: h.date,
              duration: h.duration,
              exercises: h.exercises,
              totalVolume: h.total_volume
            })));
          }

          // 4. Load Personal Records
          const { data: prsData, error: prsError } = await supabase
            .from('personal_records')
            .select('*')
            .eq('user_id', session.user.id);
          if (prsError) throw prsError;
          if (prsData) {
            const prsObj = prsData.reduce((acc, pr) => {
              acc[pr.exercise_id] = pr.weight;
              return acc;
            }, {});
            setPersonalRecords(prsObj);
          }

          // 5. Load Meals
          const { data: mealsData, error: mealsError } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', session.user.id);
          if (mealsError) throw mealsError;
          if (mealsData) {
            const mealsByDateObj = mealsData.reduce((acc, m) => {
              const d = m.date;
              if (!acc[d]) acc[d] = [];
              acc[d].push({
                id: m.id,
                name: m.name,
                calories: m.calories,
                protein: m.protein,
                carbs: m.carbs,
                fats: m.fats,
                qty: m.qty
              });
              return acc;
            }, {});
            setMealsByDate(mealsByDateObj);
          }

          // 6. Load Favorite Foods
          const { data: favsData, error: favsError } = await supabase
            .from('favorite_foods')
            .select('*')
            .eq('user_id', session.user.id);
          if (favsError) throw favsError;
          if (favsData) {
            setFavoriteFoods(favsData.map(f => ({
              id: f.id,
              name: f.name,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fats: f.fats
            })));
          }

          // 7. Load Daily Metrics (Water, Steps, Bodyweight)
          const { data: metricsData, error: metricsError } = await supabase
            .from('daily_metrics')
            .select('*')
            .eq('user_id', session.user.id);
          if (metricsError) throw metricsError;
          if (metricsData) {
            const waterObj = {};
            const stepsObj = {};
            const weightLogArr = [];
            metricsData.forEach(m => {
              if (m.water !== null && m.water !== undefined) {
                waterObj[m.date] = m.water;
              }
              if (m.steps !== null && m.steps !== undefined) {
                stepsObj[m.date] = m.steps;
              }
              if (m.bodyweight !== null && m.bodyweight !== undefined) {
                weightLogArr.push({ date: m.date, weight: m.bodyweight });
              }
            });
            setWaterByDate(waterObj);
            setStepsByDate(stepsObj);
            weightLogArr.sort((a, b) => a.date.localeCompare(b.date));
            setBodyweightLog(weightLogArr);
          }

          // 8. Load Activities
          const { data: activitiesData, error: activitiesError } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });
          if (activitiesError) throw activitiesError;
          if (activitiesData) {
            setActivities(activitiesData.map(a => ({
              id: a.id,
              type: a.type,
              label: a.label,
              date: a.date,
              distance: a.distance,
              duration: a.duration,
              pace: a.pace,
              calories: a.calories
            })));
          }
        }
      } catch (err) {
        console.error('Error loading Supabase user data:', err);
      } finally {
        setDbLoading(false);
      }
    }
    loadUserData();
  }, [session]);

  const value = {
    theme, setTheme, resolvedTheme,
    units, setUnits, goals, setGoals, profile, setProfile, notifications, setNotifications,
    activePlan, activePlanId, setActivePlan, allPlans, customPlans,
    addCustomPlan, editCustomPlan, deleteCustomPlan, duplicatePlan,
    todayDayIndex, todayScheduleLabel, todayWorkout,
    activeSession, startWorkoutSession, toggleSetComplete, updateSetData, addSetToExercise, removeSetFromExercise,
    finishWorkout, cancelWorkout, restTimer, startRestTimer, cancelRestTimer,
    workoutHistory, personalRecords,
    todayMeals, todayTotals, addMeal, removeMeal, editMeal, favoriteFoods, toggleFavorite, mealsByDate,
    todayWater, addWater, waterByDate,
    bodyweightLog, currentWeight, addBodyweight,
    todaySteps, addSteps,
    activities, liveActivity, startLiveActivity, stopLiveActivity, cancelLiveActivity, weekActivityStats,
    streak,
    needsOnboarding, completeOnboarding,
    selectedDate, setSelectedDate, dbLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
