import { Scan, Plus, Info, ChevronRight, Apple } from 'lucide-react';

export default function CalorieTracker() {
  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: '20px' }}>
        <h1 className="text-h1">Nutrition</h1>
        <div className="avatar" style={{ backgroundColor: 'var(--accent-green-dim)', color: 'var(--accent-green)' }}>
          <Apple size={24} />
        </div>
      </header>

      {/* Main Calorie Ring Card */}
      <section className="mb-section">
        <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* SVG Ring */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--bg-surface-elevated)" strokeWidth="12" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="var(--accent-green)" strokeWidth="12" strokeDasharray="565.48" strokeDashoffset="135" strokeLinecap="round" />
            </svg>
            
            <div className="flex-col align-center" style={{ zIndex: 2 }}>
              <span className="text-h1" style={{ fontSize: '40px' }}>1,840</span>
              <span className="text-label" style={{ marginTop: '4px' }}>of 2,400 kcal</span>
            </div>
            
            <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'var(--accent-green)', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)', zIndex: 1 }} />
          </div>

          <div className="flex-row justify-between" style={{ width: '100%', marginTop: '32px' }}>
            <div className="flex-col align-center">
              <span className="text-caption" style={{ color: '#0a84ff', marginBottom: '8px' }}>Protein</span>
              <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>145g <span className="text-label" style={{ fontWeight: 400 }}>/ 160g</span></span>
              <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', marginTop: '8px' }}>
                <div style={{ width: '90%', height: '100%', backgroundColor: '#0a84ff', borderRadius: '2px' }} />
              </div>
            </div>
            <div className="flex-col align-center">
              <span className="text-caption" style={{ color: '#ff9f0a', marginBottom: '8px' }}>Carbs</span>
              <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>210g <span className="text-label" style={{ fontWeight: 400 }}>/ 250g</span></span>
              <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', marginTop: '8px' }}>
                <div style={{ width: '84%', height: '100%', backgroundColor: '#ff9f0a', borderRadius: '2px' }} />
              </div>
            </div>
            <div className="flex-col align-center">
              <span className="text-caption" style={{ color: '#ff453a', marginBottom: '8px' }}>Fats</span>
              <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>56g <span className="text-label" style={{ fontWeight: 400 }}>/ 70g</span></span>
              <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px', marginTop: '8px' }}>
                <div style={{ width: '80%', height: '100%', backgroundColor: '#ff453a', borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Scanner Action */}
      <section className="mb-section">
        <button className="card flex-row justify-between align-center" style={{ width: '100%', padding: '20px', border: '1px solid var(--accent-green-dim)', background: 'linear-gradient(90deg, var(--bg-surface) 0%, rgba(50, 215, 75, 0.05) 100%)' }}>
          <div className="flex-row gap-md">
            <div className="btn-icon" style={{ backgroundColor: 'var(--accent-green)', color: 'var(--bg-amoled)' }}>
              <Scan size={20} />
            </div>
            <div className="flex-col align-start">
              <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Food Scanner</span>
              <span className="text-label">Scan a meal to log instantly</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-tertiary" />
        </button>
      </section>

      {/* Meals */}
      <section className="mb-section">
        <div className="flex-row justify-between align-center" style={{ marginBottom: '16px' }}>
          <h2 className="text-h2" style={{ fontSize: '18px' }}>Today's Meals</h2>
          <div className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <Plus size={18} />
          </div>
        </div>

        <div className="flex-col gap-sm">
          {[
            { time: 'Breakfast', name: 'Oatmeal & Protein Shake', cal: '450 kcal', p: '35g', c: '45g', f: '12g' },
            { time: 'Lunch', name: 'Grilled Chicken Salad', cal: '620 kcal', p: '55g', c: '20g', f: '25g' },
            { time: 'Dinner', name: 'Salmon & Sweet Potato', cal: '770 kcal', p: '55g', c: '85g', f: '19g' }
          ].map((meal, i) => (
            <div key={i} className="card" style={{ padding: '16px' }}>
              <div className="flex-row justify-between align-start" style={{ marginBottom: '12px' }}>
                <div className="flex-col">
                  <span className="text-caption" style={{ marginBottom: '4px' }}>{meal.time}</span>
                  <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{meal.name}</span>
                </div>
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--accent-green)' }}>{meal.cal}</span>
              </div>
              <div className="flex-row gap-md text-label" style={{ fontSize: '13px' }}>
                <span><span style={{ color: '#0a84ff' }}>P</span> {meal.p}</span>
                <span><span style={{ color: '#ff9f0a' }}>C</span> {meal.c}</span>
                <span><span style={{ color: '#ff453a' }}>F</span> {meal.f}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
