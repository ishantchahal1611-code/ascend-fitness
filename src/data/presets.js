// ── Exercise Database ──
export const EXERCISE_DB = [
  { id: 'bench-press', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell' },
  { id: 'incline-db-press', name: 'Incline Dumbbell Press', muscle: 'Upper Chest', equipment: 'Dumbbell' },
  { id: 'db-flyes', name: 'Dumbbell Flyes', muscle: 'Chest', equipment: 'Dumbbell' },
  { id: 'cable-crossover', name: 'Cable Crossover', muscle: 'Chest', equipment: 'Cable' },
  { id: 'chest-dips', name: 'Chest Dips', muscle: 'Chest', equipment: 'Bodyweight' },
  { id: 'deadlift', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell' },
  { id: 'barbell-row', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell' },
  { id: 'pull-ups', name: 'Pull-Ups', muscle: 'Back', equipment: 'Bodyweight' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable' },
  { id: 'seated-cable-row', name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable' },
  { id: 'face-pulls', name: 'Face Pulls', muscle: 'Rear Delts', equipment: 'Cable' },
  { id: 'overhead-press', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell' },
  { id: 'lateral-raises', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'front-raises', name: 'Front Raises', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'reverse-flyes', name: 'Reverse Flyes', muscle: 'Rear Delts', equipment: 'Dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell' },
  { id: 'barbell-curl', name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscle: 'Biceps', equipment: 'Dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscle: 'Biceps', equipment: 'Barbell' },
  { id: 'tricep-pushdown', name: 'Triceps Pushdown', muscle: 'Triceps', equipment: 'Cable' },
  { id: 'skull-crushers', name: 'Skull Crushers', muscle: 'Triceps', equipment: 'Barbell' },
  { id: 'overhead-tricep-ext', name: 'Overhead Tricep Extension', muscle: 'Triceps', equipment: 'Dumbbell' },
  { id: 'squat', name: 'Barbell Squat', muscle: 'Quads', equipment: 'Barbell' },
  { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell' },
  { id: 'leg-press', name: 'Leg Press', muscle: 'Quads', equipment: 'Machine' },
  { id: 'leg-curl', name: 'Leg Curl', muscle: 'Hamstrings', equipment: 'Machine' },
  { id: 'leg-extension', name: 'Leg Extension', muscle: 'Quads', equipment: 'Machine' },
  { id: 'calf-raises', name: 'Calf Raises', muscle: 'Calves', equipment: 'Machine' },
  { id: 'bulgarian-split', name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'Dumbbell' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell' },
  { id: 'lunges', name: 'Walking Lunges', muscle: 'Quads', equipment: 'Dumbbell' },
  { id: 'plank', name: 'Plank', muscle: 'Core', equipment: 'Bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunches', muscle: 'Core', equipment: 'Cable' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscle: 'Core', equipment: 'Bodyweight' },
];

export function getExercise(id) {
  return EXERCISE_DB.find(e => e.id === id);
}

// ── Food Database ──
export const FOOD_DB = [
  { id: 'chicken-rice', name: 'Chicken & Rice', calories: 500, protein: 45, carbs: 55, fats: 8, serving: '1 plate' },
  { id: 'oats', name: 'Oats', calories: 300, protein: 10, carbs: 50, fats: 6, serving: '1 bowl' },
  { id: 'eggs', name: 'Eggs (2)', calories: 180, protein: 12, carbs: 2, fats: 12, serving: '2 eggs' },
  { id: 'protein-shake', name: 'Protein Shake', calories: 200, protein: 30, carbs: 10, fats: 3, serving: '1 shake' },
  { id: 'banana', name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0, serving: '1 medium' },
  { id: 'paneer-wrap', name: 'Paneer Wrap', calories: 450, protein: 25, carbs: 40, fats: 20, serving: '1 wrap' },
  { id: 'greek-yogurt', name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 8, fats: 4, serving: '1 cup' },
  { id: 'pb-toast', name: 'Peanut Butter Toast', calories: 350, protein: 12, carbs: 30, fats: 18, serving: '2 slices' },
  { id: 'salmon-rice', name: 'Salmon & Rice', calories: 550, protein: 40, carbs: 50, fats: 15, serving: '1 plate' },
  { id: 'pasta', name: 'Pasta', calories: 400, protein: 15, carbs: 65, fats: 8, serving: '1 plate' },
  { id: 'coffee', name: 'Coffee', calories: 5, protein: 0, carbs: 1, fats: 0, serving: '1 cup' },
  { id: 'apple', name: 'Apple', calories: 95, protein: 1, carbs: 25, fats: 0, serving: '1 medium' },
];

// ── Workout Templates ──
export const WORKOUT_TEMPLATES = [
  {
    id: 'ppl', name: 'Push Pull Legs', shortName: 'PPL',
    schedule: ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Pull', 'Legs'],
    days: [
      { name: 'Push (Chest, Shoulders & Triceps)', shortName: 'Push', exercises: [
        { exerciseId: 'bench-press', sets: 4, reps: '8-10', weight: 80 },
        { exerciseId: 'incline-db-press', sets: 3, reps: '10-12', weight: 30 },
        { exerciseId: 'overhead-press', sets: 3, reps: '8-10', weight: 50 },
        { exerciseId: 'lateral-raises', sets: 4, reps: '15', weight: 10 },
        { exerciseId: 'tricep-pushdown', sets: 3, reps: '12-15', weight: 25 },
        { exerciseId: 'overhead-tricep-ext', sets: 3, reps: '12', weight: 15 },
      ]},
      { name: 'Pull (Back & Biceps)', shortName: 'Pull', exercises: [
        { exerciseId: 'deadlift', sets: 3, reps: '5', weight: 120 },
        { exerciseId: 'barbell-row', sets: 4, reps: '8-10', weight: 70 },
        { exerciseId: 'lat-pulldown', sets: 3, reps: '10-12', weight: 55 },
        { exerciseId: 'seated-cable-row', sets: 3, reps: '12', weight: 50 },
        { exerciseId: 'face-pulls', sets: 3, reps: '15', weight: 15 },
        { exerciseId: 'barbell-curl', sets: 3, reps: '10-12', weight: 30 },
      ]},
      { name: 'Legs (Quads, Hamstrings & Calves)', shortName: 'Legs', exercises: [
        { exerciseId: 'squat', sets: 4, reps: '6-8', weight: 100 },
        { exerciseId: 'rdl', sets: 3, reps: '10-12', weight: 80 },
        { exerciseId: 'leg-press', sets: 3, reps: '12', weight: 150 },
        { exerciseId: 'leg-curl', sets: 3, reps: '12', weight: 40 },
        { exerciseId: 'leg-extension', sets: 3, reps: '15', weight: 35 },
        { exerciseId: 'calf-raises', sets: 4, reps: '15', weight: 60 },
      ]},
    ],
  },
  {
    id: 'upper-lower', name: 'Upper / Lower', shortName: 'UL',
    schedule: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
    days: [
      { name: 'Upper Body', shortName: 'Upper', exercises: [
        { exerciseId: 'bench-press', sets: 4, reps: '8-10', weight: 80 },
        { exerciseId: 'barbell-row', sets: 4, reps: '8-10', weight: 70 },
        { exerciseId: 'overhead-press', sets: 3, reps: '10', weight: 50 },
        { exerciseId: 'lat-pulldown', sets: 3, reps: '12', weight: 55 },
        { exerciseId: 'lateral-raises', sets: 3, reps: '15', weight: 10 },
        { exerciseId: 'barbell-curl', sets: 3, reps: '12', weight: 30 },
        { exerciseId: 'tricep-pushdown', sets: 3, reps: '12', weight: 25 },
      ]},
      { name: 'Lower Body', shortName: 'Lower', exercises: [
        { exerciseId: 'squat', sets: 4, reps: '6-8', weight: 100 },
        { exerciseId: 'rdl', sets: 3, reps: '10', weight: 80 },
        { exerciseId: 'leg-press', sets: 3, reps: '12', weight: 150 },
        { exerciseId: 'leg-curl', sets: 3, reps: '12', weight: 40 },
        { exerciseId: 'hip-thrust', sets: 3, reps: '12', weight: 60 },
        { exerciseId: 'calf-raises', sets: 4, reps: '15', weight: 60 },
      ]},
    ],
  },
  {
    id: 'arnold', name: 'Arnold Split', shortName: 'Arnold',
    schedule: ['Chest/Back', 'Arms', 'Legs', 'Chest/Back', 'Arms', 'Legs', 'Rest'],
    days: [
      { name: 'Chest & Back', shortName: 'Chest/Back', exercises: [
        { exerciseId: 'bench-press', sets: 4, reps: '8-10', weight: 80 },
        { exerciseId: 'incline-db-press', sets: 3, reps: '10-12', weight: 30 },
        { exerciseId: 'barbell-row', sets: 4, reps: '8-10', weight: 70 },
        { exerciseId: 'lat-pulldown', sets: 3, reps: '12', weight: 55 },
        { exerciseId: 'db-flyes', sets: 3, reps: '12', weight: 15 },
        { exerciseId: 'seated-cable-row', sets: 3, reps: '12', weight: 50 },
      ]},
      { name: 'Shoulders & Arms', shortName: 'Arms', exercises: [
        { exerciseId: 'arnold-press', sets: 4, reps: '10', weight: 20 },
        { exerciseId: 'lateral-raises', sets: 4, reps: '15', weight: 10 },
        { exerciseId: 'barbell-curl', sets: 3, reps: '12', weight: 30 },
        { exerciseId: 'skull-crushers', sets: 3, reps: '12', weight: 25 },
        { exerciseId: 'hammer-curl', sets: 3, reps: '12', weight: 15 },
        { exerciseId: 'tricep-pushdown', sets: 3, reps: '15', weight: 25 },
      ]},
      { name: 'Legs', shortName: 'Legs', exercises: [
        { exerciseId: 'squat', sets: 4, reps: '6-8', weight: 100 },
        { exerciseId: 'rdl', sets: 3, reps: '10', weight: 80 },
        { exerciseId: 'leg-press', sets: 3, reps: '12', weight: 150 },
        { exerciseId: 'leg-extension', sets: 3, reps: '15', weight: 35 },
        { exerciseId: 'leg-curl', sets: 3, reps: '12', weight: 40 },
        { exerciseId: 'calf-raises', sets: 4, reps: '15', weight: 60 },
      ]},
    ],
  },
];

// ── Default initial meals for demo ──
export const DEFAULT_MEALS = [
  { id: 'm1', mealType: 'Breakfast', foodId: 'oats', name: 'Oats', calories: 300, protein: 10, carbs: 50, fats: 6, qty: 1 },
  { id: 'm2', mealType: 'Breakfast', foodId: 'protein-shake', name: 'Protein Shake', calories: 200, protein: 30, carbs: 10, fats: 3, qty: 1 },
  { id: 'm3', mealType: 'Lunch', foodId: 'chicken-rice', name: 'Chicken & Rice', calories: 500, protein: 45, carbs: 55, fats: 8, qty: 1 },
  { id: 'm4', mealType: 'Lunch', foodId: 'banana', name: 'Banana', calories: 105, protein: 1, carbs: 27, fats: 0, qty: 1 },
  { id: 'm5', mealType: 'Dinner', foodId: 'salmon-rice', name: 'Salmon & Rice', calories: 550, protein: 40, carbs: 50, fats: 15, qty: 1 },
  { id: 'm6', mealType: 'Snack', foodId: 'greek-yogurt', name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 8, fats: 4, qty: 1 },
];

// ── Default activity history ──
export const DEFAULT_ACTIVITIES = [
  { id: 'a1', type: 'run', label: 'Evening Run', date: '2026-05-17', distance: 5.2, duration: 1770, pace: '5:40', calories: 420 },
  { id: 'a2', type: 'walk', label: 'Morning Walk', date: '2026-05-15', distance: 3.1, duration: 1920, pace: '10:20', calories: 180 },
  { id: 'a3', type: 'run', label: 'Interval Run', date: '2026-05-13', distance: 6.0, duration: 1890, pace: '5:15', calories: 490 },
  { id: 'a4', type: 'cycle', label: 'Cycling Session', date: '2026-05-11', distance: 15.0, duration: 2700, pace: '3:00', calories: 380 },
];

// ── Default workout history ──
export const DEFAULT_WORKOUT_HISTORY = [
  { id: 'wh1', planName: 'Push', date: '2026-05-16', duration: 52, exercises: 6, totalVolume: 12400 },
  { id: 'wh2', planName: 'Pull', date: '2026-05-14', duration: 48, exercises: 6, totalVolume: 11200 },
  { id: 'wh3', planName: 'Legs', date: '2026-05-12', duration: 55, exercises: 6, totalVolume: 15800 },
];

// ── Default bodyweight log ──
export const DEFAULT_BODYWEIGHT = [
  { date: '2026-01-01', weight: 82 },
  { date: '2026-02-01', weight: 81.5 },
  { date: '2026-03-01', weight: 80.2 },
  { date: '2026-04-01', weight: 79.5 },
  { date: '2026-05-01', weight: 78.8 },
  { date: '2026-05-18', weight: 78.0 },
];
