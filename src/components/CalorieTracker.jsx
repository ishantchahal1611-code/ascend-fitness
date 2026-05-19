import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Scan, Plus, ChevronRight, Apple, X, Search, Heart, Trash2, Edit3, Droplets, Minus, Star } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { FOOD_DB } from '../data/presets';

/* ── Add Meal Modal ── */
function AddMealModal({ onAdd, onClose, favoriteFoods, onToggleFav }) {
  const [query, setQuery] = useState('');
  const [mealType, setMealType] = useState('Snack');
  const [tab, setTab] = useState('all'); // 'all' | 'favorites' | 'custom'
  const [customMode, setCustomMode] = useState(false);
  const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });

  const filtered = useMemo(() => {
    let list = tab === 'favorites' ? favoriteFoods : FOOD_DB;
    if (query) list = list.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [query, tab, favoriteFoods]);

  const handleAddFood = (food) => {
    onAdd({ mealType, foodId: food.id, name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fats: food.fats, qty: 1 });
    onClose();
  };

  const handleAddCustom = () => {
    if (!custom.name || !custom.calories) return;
    onAdd({ mealType, foodId: 'custom-' + Date.now(), name: custom.name, calories: parseInt(custom.calories), protein: parseInt(custom.protein) || 0, carbs: parseInt(custom.carbs) || 0, fats: parseInt(custom.fats) || 0, qty: 1 });
    onClose();
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet modal-sheet-full" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={onClose}><X size={18} /></button>
          <span style={{ fontSize: 18, fontWeight: 600 }}>Add Food</span>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ padding: '16px 24px 8px' }}>
          {/* Meal Type */}
          <div className="flex-row gap-sm" style={{ marginBottom: 16, overflowX: 'auto' }}>
            {mealTypes.map(t => (
              <button key={t} className={`tab-pill ${mealType === t ? 'active' : ''}`} onClick={() => setMealType(t)}>{t}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--text-tertiary)' }} />
            <input className="input" placeholder="Search food..." value={query} onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: 40 }} />
          </div>

          {/* Tabs */}
          <div className="flex-row gap-sm" style={{ marginBottom: 16 }}>
            <button className={`tab-pill ${tab === 'all' && !customMode ? 'active' : ''}`} onClick={() => { setTab('all'); setCustomMode(false); }}>All Foods</button>
            <button className={`tab-pill ${tab === 'favorites' ? 'active' : ''}`} onClick={() => { setTab('favorites'); setCustomMode(false); }}>
              <Heart size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Favorites
            </button>
            <button className={`tab-pill ${customMode ? 'active' : ''}`} onClick={() => setCustomMode(true)}>
              <Plus size={14} style={{ marginRight: 4, verticalAlign: -2 }} /> Custom
            </button>
          </div>
        </div>

        <div style={{ padding: '0 24px', overflowY: 'auto', flex: 1 }}>
          {customMode ? (
            <div className="flex-col gap-md">
              <input className="input" placeholder="Food name" value={custom.name} onChange={e => setCustom({ ...custom, name: e.target.value })} />
              <div className="flex-row gap-sm">
                <input className="input" placeholder="Calories" type="number" value={custom.calories} onChange={e => setCustom({ ...custom, calories: e.target.value })} />
                <input className="input" placeholder="Protein (g)" type="number" value={custom.protein} onChange={e => setCustom({ ...custom, protein: e.target.value })} />
              </div>
              <div className="flex-row gap-sm">
                <input className="input" placeholder="Carbs (g)" type="number" value={custom.carbs} onChange={e => setCustom({ ...custom, carbs: e.target.value })} />
                <input className="input" placeholder="Fats (g)" type="number" value={custom.fats} onChange={e => setCustom({ ...custom, fats: e.target.value })} />
              </div>
              <button className="btn btn-primary" onClick={handleAddCustom} style={{ marginTop: 8 }}>
                <Plus size={18} style={{ marginRight: 6 }} /> Add Custom Food
              </button>
            </div>
          ) : (
            <div>
              {filtered.length === 0 ? (
                <p className="text-label" style={{ textAlign: 'center', padding: 40 }}>No foods found</p>
              ) : (
                filtered.map(food => {
                  const isFav = favoriteFoods.some(f => f.id === food.id);
                  return (
                    <div key={food.id} className="search-item">
                      <div className="flex-col flex-1" onClick={() => handleAddFood(food)} style={{ cursor: 'pointer' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{food.name}</span>
                        <div className="flex-row gap-sm text-label" style={{ fontSize: 13 }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{food.calories} cal</span>
                          <span><span style={{ color: 'var(--accent-blue)' }}>P</span> {food.protein}g</span>
                          <span><span style={{ color: 'var(--accent-orange)' }}>C</span> {food.carbs}g</span>
                          <span><span style={{ color: 'var(--accent-red)' }}>F</span> {food.fats}g</span>
                        </div>
                      </div>
                      <button onClick={() => onToggleFav(food)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                        <Heart size={18} fill={isFav ? 'var(--accent-red)' : 'none'} style={{ color: isFav ? 'var(--accent-red)' : 'var(--text-tertiary)' }} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main CalorieTracker ── */
export default function CalorieTracker() {
  const { todayMeals, todayTotals, goals, addMeal, removeMeal, editMeal, todayWater, addWater, favoriteFoods, toggleFavorite } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  const calPct = Math.min(100, (todayTotals.calories / goals.calories) * 100);
  const remaining = goals.calories - todayTotals.calories;
  const circumference = 565.48;
  const offset = circumference - (calPct / 100) * circumference;

  const mealGroups = useMemo(() => {
    const groups = {};
    todayMeals.forEach(m => {
      if (!groups[m.mealType]) groups[m.mealType] = [];
      groups[m.mealType].push(m);
    });
    return groups;
  }, [todayMeals]);

  const mealTypeOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const waterPct = Math.min(100, (todayWater / goals.water) * 100);

  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: 20 }}>
        <h1 className="text-h1">Nutrition</h1>
        <div className="avatar" style={{ backgroundColor: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
          <Apple size={24} />
        </div>
      </header>

      {/* Calorie Ring */}
      <section className="mb-section">
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-surface-elevated)" strokeWidth="12" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--accent-green)" strokeWidth="12"
                strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            </svg>
            <div className="flex-col align-center" style={{ zIndex: 2 }}>
              <span className="text-h1" style={{ fontSize: 40 }}>{todayTotals.calories.toLocaleString()}</span>
              <span className="text-label" style={{ marginTop: 4 }}>of {goals.calories.toLocaleString()} kcal</span>
              <span className="text-caption" style={{ marginTop: 2, color: remaining >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
              </span>
            </div>
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--accent-green)', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)', zIndex: 1 }} />
          </div>

          {/* Macros */}
          <div className="flex-row justify-between" style={{ width: '100%', marginTop: 32 }}>
            {[
              { label: 'Protein', value: todayTotals.protein, goal: goals.protein, color: '#0a84ff' },
              { label: 'Carbs', value: todayTotals.carbs, goal: goals.carbs, color: '#ff9f0a' },
              { label: 'Fats', value: todayTotals.fats, goal: goals.fats, color: '#ff453a' },
            ].map(m => (
              <div key={m.label} className="flex-col align-center">
                <span className="text-caption" style={{ color: m.color, marginBottom: 8 }}>{m.label}</span>
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}g <span className="text-label" style={{ fontWeight: 400 }}>/ {m.goal}g</span></span>
                <div style={{ width: 60, height: 4, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 2, marginTop: 8 }}>
                  <div style={{ width: `${Math.min(100, (m.value / m.goal) * 100)}%`, height: '100%', backgroundColor: m.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Add */}
      <section className="mb-section">
        <button className="card flex-row justify-between align-center" onClick={() => setShowAdd(true)}
          style={{ width: '100%', padding: 20, border: '1px solid var(--accent-green-dim)', background: 'linear-gradient(90deg, var(--bg-surface) 0%, rgba(50, 215, 75, 0.05) 100%)', cursor: 'pointer' }}>
          <div className="flex-row gap-md">
            <div className="btn-icon" style={{ backgroundColor: 'var(--accent-green)', color: 'white' }}>
              <Plus size={20} />
            </div>
            <div className="flex-col align-start">
              <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Add Food</span>
              <span className="text-label">Search or create a meal</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-tertiary" />
        </button>
      </section>

      {/* Water Tracking */}
      <section className="mb-section">
        <div className="card" style={{ padding: 20 }}>
          <div className="flex-row justify-between align-center" style={{ marginBottom: 12 }}>
            <div className="flex-row gap-sm">
              <Droplets size={20} className="text-blue" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Water Intake</span>
            </div>
            <span className="text-label">{todayWater.toFixed(1)}L / {goals.water}L</span>
          </div>
          <div style={{ height: 8, background: 'var(--bg-surface-elevated)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${waterPct}%`, background: 'var(--accent-blue)', borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
          <div className="flex-row gap-sm justify-center">
            {[0.25, 0.5, 1.0].map(amt => (
              <button key={amt} className="btn btn-secondary btn-sm" onClick={() => addWater(amt)} style={{ gap: 4 }}>
                <Plus size={14} /> {amt}L
              </button>
            ))}
            <button className="btn btn-danger btn-sm" onClick={() => addWater(-0.25)} style={{ gap: 4 }}>
              <Minus size={14} /> 0.25L
            </button>
          </div>
        </div>
      </section>

      {/* Today's Meals Grouped */}
      <section className="mb-section">
        <div className="flex-row justify-between align-center" style={{ marginBottom: 16 }}>
          <h2 className="text-h2" style={{ fontSize: 18 }}>Today's Meals</h2>
          <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setShowAdd(true)}><Plus size={18} /></button>
        </div>

        {todayMeals.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center' }}>
            <p className="text-label">No meals logged yet today</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)} style={{ marginTop: 16 }}>Add Meal</button>
          </div>
        ) : (
          <div className="flex-col gap-md">
            {mealTypeOrder.filter(t => mealGroups[t]).map(type => (
              <div key={type}>
                <span className="text-caption" style={{ marginBottom: 8, display: 'block' }}>{type}</span>
                <div className="flex-col gap-sm">
                  {mealGroups[type].map(meal => {
                    const mealCal = meal.calories * (meal.qty || 1);
                    return (
                      <div key={meal.id} className="card" style={{ padding: 16 }}>
                        <div className="flex-row justify-between align-start" style={{ marginBottom: 10 }}>
                          <div className="flex-col flex-1">
                            <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{meal.name}</span>
                            {meal.qty > 1 && <span className="text-label" style={{ fontSize: 12 }}>×{meal.qty}</span>}
                          </div>
                          <div className="flex-row gap-sm align-center">
                            <span className="text-body" style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{mealCal} kcal</span>
                            <button onClick={() => removeMeal(meal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                              <Trash2 size={16} style={{ color: 'var(--text-tertiary)' }} />
                            </button>
                          </div>
                        </div>
                        <div className="flex-row gap-md text-label" style={{ fontSize: 13 }}>
                          <span><span style={{ color: 'var(--accent-blue)' }}>P</span> {meal.protein * (meal.qty || 1)}g</span>
                          <span><span style={{ color: 'var(--accent-orange)' }}>C</span> {meal.carbs * (meal.qty || 1)}g</span>
                          <span><span style={{ color: 'var(--accent-red)' }}>F</span> {meal.fats * (meal.qty || 1)}g</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showAdd && <AddMealModal onAdd={addMeal} onClose={() => setShowAdd(false)} favoriteFoods={favoriteFoods} onToggleFav={toggleFavorite} />}
    </div>
  );
}
