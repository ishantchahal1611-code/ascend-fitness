import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Moon, Sun, Monitor, Bell, Ruler, Target, Droplets, Footprints, Flame, ChevronRight, Scale } from 'lucide-react';
import { useApp, clearAscendLocalCache } from '../store/AppContext';
import { supabase } from '../supabaseClient';

function Toggle({ value, onChange }) {
  return (
    <button className={`toggle-track ${value ? 'active' : ''}`} onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </button>
  );
}

function SettingRow({ icon: Icon, iconColor, label, children, sub }) {
  return (
    <div className="settings-row">
      <div className="flex-row gap-md" style={{ flex: 1 }}>
        {Icon && (
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: iconColor || 'var(--bg-surface-elevated)' }}>
            <Icon size={18} style={{ color: iconColor ? 'white' : 'var(--text-secondary)' }} />
          </div>
        )}
        <div className="flex-col" style={{ flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
          {sub && <span className="text-label" style={{ fontSize: 13 }}>{sub}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EditGoalModal({ label, value, unit, onSave, onClose, step = 1, max }) {
  const [val, setVal] = useState(value);
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>{label}</span>
          <button className="btn btn-sm btn-primary" onClick={() => { onSave(parseFloat(val)); onClose(); }}>Save</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, paddingBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="btn-icon" style={{ width: 48, height: 48, fontSize: 24 }} onClick={() => setVal(v => Math.max(0, v - step))}>−</button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 48, fontWeight: 700 }}>{val}</span>
              <span className="text-label" style={{ display: 'block', marginTop: 4 }}>{unit}</span>
            </div>
            <button className="btn-icon" style={{ width: 48, height: 48, fontSize: 24 }} onClick={() => setVal(v => v + step)}>+</button>
          </div>
          <input type="range" min={step} max={max || (step > 1 ? 20000 : 10)} step={step} value={val} onChange={e => setVal(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-blue)' }} />
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProfileModal({ profile, currentWeight, weightUnit, onSaveProfile, onSaveWeight, onClose }) {
  const [name, setName] = useState(profile.name || '');
  const [age, setAge] = useState(profile.age || '');
  const [height, setHeight] = useState(profile.height || '');
  const [gender, setGender] = useState(profile.gender || 'Other');
  const [weight, setWeight] = useState(currentWeight || '');

  const handleSave = () => {
    onSaveProfile({ name, age: parseInt(age) || 0, height: parseFloat(height) || 0, gender });
    if (parseFloat(weight) !== currentWeight && parseFloat(weight) > 0) {
      onSaveWeight(parseFloat(weight));
    }
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Edit Profile</span>
          <button className="btn btn-sm btn-primary" onClick={handleSave}>Save</button>
        </div>
        <div className="modal-body flex-col gap-md">
          <div className="flex-col gap-sm">
            <label className="text-label">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="flex-row gap-md">
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Age</label>
              <input className="input" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
            </div>
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Gender</label>
              <select className="input" value={gender} onChange={e => setGender(e.target.value)} style={{ padding: '12px 16px', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', border: '1px solid var(--input-border)', borderRadius: 'var(--radius-sm)' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex-row gap-md">
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Height ({weightUnit === 'lb' ? 'in' : 'cm'})</label>
              <input className="input" type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder={`Height in ${weightUnit === 'lb' ? 'inches' : 'cm'}`} />
            </div>
            <div className="flex-col gap-sm flex-1">
              <label className="text-label">Weight ({weightUnit})</label>
              <input className="input" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder={`Weight in ${weightUnit}`} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Settings({ session }) {
  const { theme, setTheme, units, setUnits, goals, setGoals, profile, setProfile, notifications, setNotifications, currentWeight, addBodyweight } = useApp();
  const [editGoal, setEditGoal] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showRecalc, setShowRecalc] = useState(false);

  const themeOptions = [
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="p-screen fade-in">
      <header style={{ marginTop: 20, marginBottom: 32 }}>
        <h1 className="text-h1">Settings</h1>
      </header>

      {/* Profile */}
      <section className="mb-section">
        <button className="card flex-row gap-md" onClick={() => setShowProfile(true)} style={{ width: '100%', cursor: 'pointer', padding: 20, textAlign: 'left' }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 24, fontWeight: 700, backgroundColor: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }}>
            {profile.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-col flex-1">
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name || 'User'}</span>
            <span className="text-label">
              Age: {profile.age || '--'} • Height: {profile.height || '--'} {units.weight === 'lb' ? 'in' : 'cm'}
              {' '}• {currentWeight != null ? `${currentWeight} ${units.weight}` : 'Weight not logged'}
            </span>
          </div>
          <ChevronRight size={20} style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </section>

      {/* Theme */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Appearance</span>
        <div className="card" style={{ padding: 6 }}>
          <div className="segmented">
            {themeOptions.map(t => (
              <button key={t.id} className={`segmented-btn ${theme === t.id ? 'active' : ''}`} onClick={() => setTheme(t.id)}>
                <t.icon size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Units */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Units</span>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Scale} iconColor="#007aff" label="Weight">
            <div className="segmented" style={{ width: 140 }}>
              <button className={`segmented-btn ${units.weight === 'kg' ? 'active' : ''}`} onClick={() => setUnits({ ...units, weight: 'kg' })}>KG</button>
              <button className={`segmented-btn ${units.weight === 'lb' ? 'active' : ''}`} onClick={() => setUnits({ ...units, weight: 'lb' })}>LB</button>
            </div>
          </SettingRow>
          <SettingRow icon={Ruler} iconColor="#ff9f0a" label="Distance">
            <div className="segmented" style={{ width: 140 }}>
              <button className={`segmented-btn ${units.distance === 'km' ? 'active' : ''}`} onClick={() => setUnits({ ...units, distance: 'km' })}>KM</button>
              <button className={`segmented-btn ${units.distance === 'mi' ? 'active' : ''}`} onClick={() => setUnits({ ...units, distance: 'mi' })}>Miles</button>
            </div>
          </SettingRow>
        </div>
      </section>

      {/* Goals */}
      <section className="mb-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="text-caption" style={{ margin: 0 }}>Daily Goals</span>
          <button 
            onClick={() => setShowRecalc(true)} 
            style={{ 
              background: 'rgba(10, 132, 255, 0.1)', 
              border: 'none', 
              color: 'var(--accent-blue)', 
              fontSize: '12px', 
              fontWeight: 600, 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '20px',
              fontFamily: 'inherit'
            }}
          >
            Formula Options
          </button>
        </div>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Flame} iconColor="#ff453a" label="Calories" sub={`${goals.calories} kcal`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'calories', label: 'Daily Calorie Goal', value: goals.calories, unit: 'kcal', step: 50, max: 10000 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Target} iconColor="#0a84ff" label="Protein" sub={`${goals.protein}g`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'protein', label: 'Daily Protein Goal', value: goals.protein, unit: 'grams', step: 5, max: 300 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Target} iconColor="#ff9f0a" label="Carbs" sub={`${goals.carbs}g`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'carbs', label: 'Daily Carbs Goal', value: goals.carbs, unit: 'grams', step: 5, max: 500 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Target} iconColor="#ffd60a" label="Fats" sub={`${goals.fats}g`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'fats', label: 'Daily Fats Goal', value: goals.fats, unit: 'grams', step: 5, max: 200 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Droplets} iconColor="#007aff" label="Water" sub={`${goals.water}${units.weight === 'lb' ? ' oz' : 'L'}`}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'water', label: 'Daily Water Goal', value: goals.water, unit: 'liters', step: 0.5, max: 10 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
          <SettingRow icon={Footprints} iconColor="#32d74b" label="Steps" sub={goals.steps.toLocaleString()}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setEditGoal({ key: 'steps', label: 'Daily Step Goal', value: goals.steps, unit: 'steps', step: 500, max: 50000 })}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 4, display: 'block' }}>Notifications</span>
        <p className="text-label" style={{ marginBottom: 12, fontSize: 12 }}>Reminders will work when the app is wrapped for mobile (coming soon).</p>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Bell} iconColor="#ff9f0a" label="Workout Reminders">
            <Toggle value={notifications.workout} onChange={v => setNotifications({ ...notifications, workout: v })} />
          </SettingRow>
          <SettingRow label="Meal Reminders">
            <Toggle value={notifications.meals} onChange={v => setNotifications({ ...notifications, meals: v })} />
          </SettingRow>
          <SettingRow label="Water Reminders">
            <Toggle value={notifications.water} onChange={v => setNotifications({ ...notifications, water: v })} />
          </SettingRow>
          <SettingRow label="Step Reminders">
            <Toggle value={notifications.steps} onChange={v => setNotifications({ ...notifications, steps: v })} />
          </SettingRow>
        </div>
      </section>

      {/* Log Bodyweight */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Body</span>
        <div className="card" style={{ padding: '4px 20px' }}>
          <SettingRow icon={Scale} iconColor="#32d74b" label="Log Bodyweight" sub={currentWeight != null ? `Current: ${currentWeight} ${units.weight}` : 'Not logged yet'}>
            <button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setShowWeightModal(true)}>
              <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </SettingRow>
        </div>
      </section>

      {/* Account */}
      <section className="mb-section">
        <span className="text-caption" style={{ marginBottom: 12, display: 'block' }}>Account</span>
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex-col gap-sm" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Logged in as</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>{session?.user?.email}</span>
          </div>
          <button 
            className="btn" 
            style={{ width: '100%', backgroundColor: 'var(--accent-red, #ef4444)', color: '#ffffff', border: 'none', padding: '12px 16px', borderRadius: 'var(--radius-sm, 8px)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
            onClick={async () => {
              clearAscendLocalCache(session?.user?.id);
              await supabase.auth.signOut();
            }}
          >
            Sign Out
          </button>
        </div>
      </section>

      <p className="text-label" style={{ textAlign: 'center', marginTop: 16, fontSize: 13, opacity: 0.5 }}>Ascend v1.0 — Built with ❤️</p>

      {/* Modals */}
      {editGoal && (
        <EditGoalModal
          label={editGoal.label}
          value={editGoal.value}
          unit={editGoal.unit}
          step={editGoal.step}
          max={editGoal.max}
          onSave={v => setGoals({ ...goals, [editGoal.key]: v })}
          onClose={() => setEditGoal(null)}
        />
      )}
      {showProfile && (
        <ProfileModal 
          profile={profile} 
          currentWeight={currentWeight}
          weightUnit={units.weight}
          onSaveProfile={setProfile} 
          onSaveWeight={addBodyweight}
          onClose={() => setShowProfile(false)} 
        />
      )}
      {showWeightModal && (
        <EditGoalModal label="Log Bodyweight" value={currentWeight ?? (units.weight === 'lb' ? 170 : 75)} unit={units.weight} step={0.1}
          onSave={v => addBodyweight(v)} onClose={() => setShowWeightModal(false)} />
      )}
      {showRecalc && (
        <RecalculateMacrosModal
          profile={profile}
          currentWeight={currentWeight}
          weightUnit={units.weight}
          goals={goals}
          setGoals={setGoals}
          onClose={() => setShowRecalc(false)}
        />
      )}
    </div>
  );
}

function RecalculateMacrosModal({ profile, currentWeight, weightUnit, goals, setGoals, onClose }) {
  const [strategy, setStrategy] = useState('Moderate');
  const [customDeficit, setCustomDeficit] = useState('500');
  const [splitMode, setSplitMode] = useState('Standard');
  const [customP, setCustomP] = useState(30);
  const [customC, setCustomC] = useState(40);
  const [customF, setCustomF] = useState(30);

  const isCustomSplitValid = (parseInt(customP) + parseInt(customC) + parseInt(customF)) === 100;

  const handleRecalculate = () => {
    let deficit = 500;
    if (strategy === 'Conservative') deficit = 250;
    else if (strategy === 'Aggressive') deficit = 1000;
    else if (strategy === 'Custom') deficit = parseInt(customDeficit) || 500;

    const isMetric = weightUnit === 'kg';
    const weightKg = isMetric ? currentWeight : currentWeight * 0.453592;
    const goalWeightKg = goals.weight 
      ? (isMetric ? goals.weight : goals.weight * 0.453592)
      : weightKg * 0.9;
    
    const heightCm = profile.height || 175;
    const age = profile.age || 25;
    const gender = profile.gender || 'Other';

    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (gender === 'Female') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 78;
    }

    const tdee = Math.round(bmr * 1.375);
    const calGoal = Math.max(1200, Math.round(tdee - deficit));

    let proteinGoal = goals.protein;
    let fatGoal = goals.fats;
    let carbGoal = goals.carbs;

    if (splitMode === 'Standard') {
      proteinGoal = Math.round(goalWeightKg * 2.0);
      fatGoal = Math.round((calGoal * 0.25) / 9);
      carbGoal = Math.max(50, Math.round((calGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4));
    } else if (splitMode === 'HighProtein') {
      proteinGoal = Math.round(goalWeightKg * 2.4);
      fatGoal = Math.round((calGoal * 0.20) / 9);
      carbGoal = Math.max(50, Math.round((calGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4));
    } else if (splitMode === 'Keto') {
      proteinGoal = Math.round((calGoal * 0.15) / 4);
      fatGoal = Math.round((calGoal * 0.70) / 9);
      carbGoal = Math.max(20, Math.round((calGoal * 0.15) / 4));
    } else if (splitMode === 'Balanced') {
      proteinGoal = Math.round((calGoal * 0.30) / 4);
      fatGoal = Math.round((calGoal * 0.30) / 9);
      carbGoal = Math.round((calGoal * 0.40) / 4);
    } else if (splitMode === 'Custom') {
      if (!isCustomSplitValid) return;
      proteinGoal = Math.round((calGoal * (customP / 100)) / 4);
      fatGoal = Math.round((calGoal * (customF / 100)) / 9);
      carbGoal = Math.round((calGoal * (customC / 100)) / 4);
    }

    setGoals({
      ...goals,
      calories: calGoal,
      protein: proteinGoal,
      fats: fatGoal,
      carbs: carbGoal
    });
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom: '30px' }}>
        <div className="modal-handle" />
        <div className="modal-header">
          <span style={{ fontSize: 18, fontWeight: 600 }}>Configure Target Formula</span>
          <button 
            className="btn btn-sm btn-primary" 
            disabled={splitMode === 'Custom' && !isCustomSplitValid}
            onClick={handleRecalculate}
          >
            Apply
          </button>
        </div>
        <div className="modal-body flex-col gap-lg" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          
          <div className="flex-col gap-sm">
            <label className="text-label" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-secondary)' }}>Deficit Strategy</label>
            <select className="input" value={strategy} onChange={e => setStrategy(e.target.value)} style={{ padding: '12px 16px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}>
              <option value="Conservative">Conservative (250 kcal deficit)</option>
              <option value="Moderate">Moderate (500 kcal deficit)</option>
              <option value="Aggressive">Aggressive (1000 kcal deficit)</option>
              <option value="Custom">Custom Deficit...</option>
            </select>
            {strategy === 'Custom' && (
              <input
                className="input"
                type="number"
                value={customDeficit}
                onChange={e => setCustomDeficit(e.target.value)}
                placeholder="Deficit in kcal"
                style={{ marginTop: '8px' }}
              />
            )}
          </div>

          <div className="flex-col gap-sm">
            <label className="text-label" style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-secondary)' }}>Macro Split Mode</label>
            <select className="input" value={splitMode} onChange={e => setSplitMode(e.target.value)} style={{ padding: '12px 16px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)' }}>
              <option value="Standard">Standard Fitness (2.0g/kg Pro, 25% Fat)</option>
              <option value="HighProtein">High Protein Lean (2.4g/kg Pro, 20% Fat)</option>
              <option value="Balanced">Balanced Split (30% Pro, 30% Fat, 40% Carb)</option>
              <option value="Keto">Keto Split (15% Pro, 70% Fat, 15% Carb)</option>
              <option value="Custom">Custom Percentages...</option>
            </select>
          </div>

          {splitMode === 'Custom' && (
            <div className="flex-col gap-md" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="flex-col gap-sm flex-1">
                  <label className="text-label" style={{ fontSize: '13px' }}>Protein %</label>
                  <input className="input" type="number" value={customP} onChange={e => setCustomP(parseInt(e.target.value) || 0)} style={{ textAlign: 'center' }} />
                </div>
                <div className="flex-col gap-sm flex-1">
                  <label className="text-label" style={{ fontSize: '13px' }}>Carbs %</label>
                  <input className="input" type="number" value={customC} onChange={e => setCustomC(parseInt(e.target.value) || 0)} style={{ textAlign: 'center' }} />
                </div>
                <div className="flex-col gap-sm flex-1">
                  <label className="text-label" style={{ fontSize: '13px' }}>Fats %</label>
                  <input className="input" type="number" value={customF} onChange={e => setCustomF(parseInt(e.target.value) || 0)} style={{ textAlign: 'center' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', color: isCustomSplitValid ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                  Total: {parseInt(customP) + parseInt(customC) + parseInt(customF)}%
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                  Must sum to 100%
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
