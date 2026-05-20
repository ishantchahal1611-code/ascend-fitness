import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { User, Activity, ArrowRight, ArrowLeft, Target, Flame, Award } from 'lucide-react';
import '../index.css';

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('Male');
  const [unitSystem, setUnitSystem] = useState('metric'); // metric vs imperial
  const [height, setHeight] = useState('175'); // cm or inches
  const [weight, setWeight] = useState('80'); // kg or lbs
  const [goalWeight, setGoalWeight] = useState('70'); // kg or lbs
  const [weightLossRate, setWeightLossRate] = useState('Moderate'); // Conservative, Moderate, Aggressive

  // Computed weight units
  const weightUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
  const heightUnit = unitSystem === 'metric' ? 'cm' : 'in';

  // Toggle unit system and convert values roughly
  const handleUnitChange = (sys) => {
    if (sys === unitSystem) return;
    setUnitSystem(sys);
    if (sys === 'imperial') {
      // Metric -> Imperial
      setHeight(Math.round(parseFloat(height) / 2.54).toString());
      setWeight(Math.round(parseFloat(weight) * 2.20462).toString());
      setGoalWeight(Math.round(parseFloat(goalWeight) * 2.20462).toString());
    } else {
      // Imperial -> Metric
      setHeight(Math.round(parseFloat(height) * 2.54).toString());
      setWeight(Math.round(parseFloat(weight) / 2.20462).toString());
      setGoalWeight(Math.round(parseFloat(goalWeight) / 2.20462).toString());
    }
  };

  // Calorie & Macro Calculations for preview
  const previewGoals = useMemo(() => {
    const w = parseFloat(weight) || 70;
    const h = parseFloat(height) || 170;
    const a = parseInt(age) || 25;
    const gw = parseFloat(goalWeight) || 65;

    const isMetric = unitSystem === 'metric';
    const weightKg = isMetric ? w : w * 0.453592;
    const heightCm = isMetric ? h : h * 2.54;
    const goalWeightKg = isMetric ? gw : gw * 0.453592;

    // BMR
    let bmr;
    if (gender === 'Male') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * a + 5;
    } else if (gender === 'Female') {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * a - 161;
    } else {
      bmr = 10 * weightKg + 6.25 * heightCm - 5 * a - 78;
    }

    const tdee = Math.round(bmr * 1.375);

    // Deficit
    let deficit = 500;
    if (weightLossRate === 'Conservative') deficit = 250;
    else if (weightLossRate === 'Aggressive') deficit = 1000;

    const calGoal = Math.max(1200, Math.round(tdee - deficit));
    const proteinGoal = Math.round(goalWeightKg * 2.0);
    const fatGoal = Math.round((calGoal * 0.25) / 9);
    const carbGoal = Math.max(50, Math.round((calGoal - (proteinGoal * 4) - (fatGoal * 9)) / 4));

    return { calories: calGoal, protein: proteinGoal, carbs: carbGoal, fats: fatGoal };
  }, [weight, height, age, gender, goalWeight, weightLossRate, unitSystem]);

  // Generate 6-month projection data for SVG graph
  const projectionData = useMemo(() => {
    const startW = parseFloat(weight) || 80;
    const goalW = parseFloat(goalWeight) || 70;
    
    // Loss per month based on selection and unit
    let rate = 2.0; // Metric: 2kg/month
    if (unitSystem === 'imperial') rate = 4.0; // Imperial: 4lbs/month

    if (weightLossRate === 'Conservative') {
      rate = unitSystem === 'metric' ? 1.0 : 2.0;
    } else if (weightLossRate === 'Aggressive') {
      rate = unitSystem === 'metric' ? 4.0 : 8.0;
    }

    const points = [];
    const isLoss = startW > goalW;

    for (let m = 0; m <= 6; m++) {
      const wt = isLoss
        ? Math.max(goalW, startW - rate * m)
        : Math.min(goalW, startW + rate * m);
      points.push({ month: `M${m}`, weight: parseFloat(wt.toFixed(1)) });
    }
    return points;
  }, [weight, goalWeight, weightLossRate, unitSystem]);

  // SVG Drawing Helpers
  const svgPath = useMemo(() => {
    const weights = projectionData.map(p => p.weight);
    const maxW = Math.max(...weights) + 2;
    const minW = Math.min(...weights) - 2;
    const range = maxW - minW || 1;

    const width = 320;
    const height = 140;
    const padding = 20;

    const points = projectionData.map((p, index) => {
      const x = padding + (index * (width - padding * 2)) / 6;
      // Invert Y because SVG coordinates start from top-left
      const y = height - padding - ((p.weight - minW) * (height - padding * 2)) / range;
      return { x, y, val: p.weight };
    });

    const pathD = points.reduce((acc, p, i) => {
      return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }, '');

    // Path for gradient fill area below line
    const areaD = pathD + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { pathD, areaD, points };
  }, [projectionData]);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    completeOnboarding({
      name,
      age: parseInt(age) || 25,
      height: parseFloat(height) || 175,
      gender,
      weight: parseFloat(weight) || 80,
      goalWeight: parseFloat(goalWeight) || 70,
      weightLossRate,
      units: {
        weight: weightUnit,
        distance: unitSystem === 'metric' ? 'km' : 'mi'
      }
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 0%, #171719 0%, var(--bg-amoled) 75%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--text-primary)'
    }}>
      {/* Decorative Neon Halo */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(50, 215, 75, 0.08) 0%, rgba(0,0,0,0) 70%)',
        top: '-5%',
        right: '-10%',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }} />

      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', zIndex: 1 }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Onboarding
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{
              width: '24px',
              height: '4px',
              borderRadius: '2px',
              background: s <= step 
                ? 'linear-gradient(90deg, var(--accent-green) 0%, #10b981 100%)' 
                : 'rgba(255,255,255,0.1)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>
      </div>

      {/* Onboarding Steps Card */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto'
      }}>

        {/* STEP 1: Basic Profile */}
        {step === 1 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>Let's get introduced</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>First, tell us a bit about yourself to get started.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 44px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-green)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                />
                <User size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="120"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                    textAlign: 'center'
                  }}
                >
                  <option value="Male" style={{ background: '#121212' }}>Male</option>
                  <option value="Female" style={{ background: '#121212' }}>Female</option>
                  <option value="Other" style={{ background: '#121212' }}>Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Metrics */}
        {step === 2 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>Your metrics</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Help us understand your current physique and weight goals.</p>
            </div>

            {/* Metric/Imperial Segmented Control */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '4px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <button
                type="button"
                onClick={() => handleUnitChange('metric')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '8px',
                  background: unitSystem === 'metric' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: unitSystem === 'metric' ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Metric (kg / cm)
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('imperial')}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '8px',
                  background: unitSystem === 'imperial' ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: unitSystem === 'imperial' ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Imperial (lbs / in)
              </button>
            </div>

            {/* Height input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Height ({heightUnit})</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Weight inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Weight ({weightUnit})</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Goal Weight ({weightUnit})</label>
                <input
                  type="number"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Goals */}
        {step === 3 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>Weight loss speed</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Choose a safe, realistic speed to reach your goal bodyweight.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  id: 'Conservative',
                  title: 'Conservative',
                  desc: unitSystem === 'metric' ? 'Lose 1 kg / month' : 'Lose 2 lbs / month',
                  accent: 'rgba(10, 132, 255, 0.15)',
                  textAccent: 'var(--accent-blue)'
                },
                {
                  id: 'Moderate',
                  title: 'Moderate (Recommended)',
                  desc: unitSystem === 'metric' ? 'Lose 2 kg / month' : 'Lose 4 lbs / month',
                  accent: 'rgba(50, 215, 75, 0.15)',
                  textAccent: 'var(--accent-green)'
                },
                {
                  id: 'Aggressive',
                  title: 'Aggressive',
                  desc: unitSystem === 'metric' ? 'Lose 4 kg / month' : 'Lose 8 lbs / month',
                  accent: 'rgba(255, 69, 58, 0.15)',
                  textAccent: 'var(--accent-red)'
                }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setWeightLossRate(opt.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid ' + (weightLossRate === opt.id ? opt.textAccent : 'rgba(255,255,255,0.08)'),
                    background: weightLossRate === opt.id ? opt.accent : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: weightLossRate === opt.id ? 'white' : 'var(--text-primary)' }}>
                      {opt.title}
                    </span>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid ' + (weightLossRate === opt.id ? opt.textAccent : 'rgba(255,255,255,0.2)'),
                      background: weightLossRate === opt.id ? opt.textAccent : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {weightLossRate === opt.id && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Projection Graph & Summary */}
        {step === 4 && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.8px', marginBottom: '8px' }}>Your projection path</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Based on your targets, here is your estimated weight trajectory.</p>
            </div>

            {/* Projection Chart Container */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '16px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Weight Trajectory</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-green)' }}>Goal: {goalWeight} {weightUnit}</span>
              </div>

              {/* Custom SVG line chart */}
              <div style={{ position: 'relative', width: '100%', height: '140px', display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 320 140" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-green)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--accent-green)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="20" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  <line x1="20" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                  <line x1="20" y1="120" x2="300" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />

                  {/* Gradient Area under line */}
                  <path d={svgPath.areaD} fill="url(#chartGrad)" />

                  {/* The Line */}
                  <path d={svgPath.pathD} fill="none" stroke="var(--accent-green)" strokeWidth="3" strokeLinecap="round" />

                  {/* Monthly dot indicators */}
                  {svgPath.points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="var(--accent-green)" />
                      {/* Only label Start, Mid and End weights to avoid clutter */}
                      {(i === 0 || i === 3 || i === 6) && (
                        <text x={p.x} y={p.y - 10} fill="white" fontSize="10" fontWeight="600" textAnchor="middle">
                          {p.val}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* X-Axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px', marginTop: '6px', color: 'var(--text-tertiary)', fontSize: '11px', fontWeight: 600 }}>
                <span>Start (Month 0)</span>
                <span>Month 3</span>
                <span>End (Month 6)</span>
              </div>
            </div>

            {/* Calculated Plan Preview Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Setup Generated</span>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(50, 215, 75, 0.12)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--accent-green)', flexShrink: 0, justifyContent: 'center' }}>
                    <Flame size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block' }}>Daily Calories</span>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>{previewGoals.calories} kcal</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.12)', display: 'flex', alignItems: 'center', color: 'var(--accent-blue)', flexShrink: 0, justifyContent: 'center' }}>
                    <Target size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block' }}>Daily Protein</span>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>{previewGoals.protein}g</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 159, 10, 0.12)', display: 'flex', alignItems: 'center', color: 'var(--accent-orange)', flexShrink: 0, justifyContent: 'center' }}>
                    <Activity size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block' }}>Daily Carbs</span>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>{previewGoals.carbs}g</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 69, 58, 0.12)', display: 'flex', alignItems: 'center', color: 'var(--accent-red)', flexShrink: 0, justifyContent: 'center' }}>
                    <Award size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'block' }}>Daily Fats</span>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>{previewGoals.fats}g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Navigation Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginTop: '32px', 
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        margin: '32px auto 0 auto'
      }}>
        {step > 1 && (
          <button
            onClick={handleBack}
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.04)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.08)',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
        
        {step < 4 ? (
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--accent-green) 0%, #10b981 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(50, 215, 75, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(50, 215, 75, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Begin Journey <Award size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
