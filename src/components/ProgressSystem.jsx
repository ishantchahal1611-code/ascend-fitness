import { Trophy, TrendingUp, Medal, Star, ChevronRight, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', weight: 82 },
  { name: 'Feb', weight: 81.5 },
  { name: 'Mar', weight: 80.2 },
  { name: 'Apr', weight: 79.5 },
  { name: 'May', weight: 78.8 },
  { name: 'Jun', weight: 78.0 },
];

export default function ProgressSystem() {
  return (
    <div className="p-screen fade-in">
      <header className="flex-row justify-between mb-section" style={{ marginTop: '20px' }}>
        <h1 className="text-h1">Progress</h1>
        <div className="avatar" style={{ backgroundColor: 'var(--accent-red-dim)', color: 'var(--accent-red)' }}>
          <TrendingUp size={24} />
        </div>
      </header>

      {/* Body Progress Chart */}
      <section className="mb-section">
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex-row justify-between align-center mb-section" style={{ marginBottom: '24px' }}>
            <div className="flex-col">
              <span className="text-caption" style={{ color: 'var(--accent-blue)' }}>Bodyweight</span>
              <span className="text-h2" style={{ marginTop: '4px' }}>78.0 <span className="text-body">kg</span></span>
            </div>
            <div className="badge badge-green" style={{ display: 'flex', gap: '4px' }}>
              <TrendingUp size={14} /> -4.0 kg
            </div>
          </div>
          
          <div style={{ width: '100%', height: '180px', marginLeft: '-16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0a84ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }} dy={10} />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-surface-elevated)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: '#0a84ff' }}
                />
                <Area type="monotone" dataKey="weight" stroke="#0a84ff" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Consistency Score */}
      <section className="mb-section">
        <div className="flex-row gap-md">
          <div className="card flex-1 flex-col align-center justify-center" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'var(--accent-green)', opacity: 0.1, borderRadius: '50%', filter: 'blur(20px)' }} />
            <span className="text-h1" style={{ color: 'var(--accent-green)', fontSize: '48px' }}>92<span style={{ fontSize: '24px' }}>%</span></span>
            <span className="text-label" style={{ marginTop: '8px' }}>Consistency Score</span>
          </div>
          
          <div className="card flex-1 flex-col justify-between" style={{ padding: '24px' }}>
            <div className="flex-col">
              <span className="text-caption text-orange">Best Streak</span>
              <span className="text-h2" style={{ marginTop: '4px' }}>28 Days</span>
            </div>
            <div className="flex-col" style={{ marginTop: '16px' }}>
              <span className="text-caption text-red">Current</span>
              <span className="text-h2" style={{ marginTop: '4px' }}>14 Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="mb-section">
        <div className="flex-row justify-between align-center" style={{ marginBottom: '16px' }}>
          <h2 className="text-h2" style={{ fontSize: '18px' }}>Achievements</h2>
          <span className="text-body" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>View All</span>
        </div>
        
        <div className="flex-col gap-sm">
          {[
            { title: 'Early Bird', desc: 'Complete 10 morning workouts', icon: Star, color: 'var(--accent-orange)' },
            { title: 'Heavy Lifter', desc: 'Reach 100kg Bench Press', icon: Medal, color: 'var(--accent-blue)' },
            { title: 'Marathoner', desc: 'Run 42km in a single month', icon: Trophy, color: 'var(--accent-red)' }
          ].map((ach, i) => (
            <div key={i} className="card flex-row align-center" style={{ padding: '16px' }}>
              <div className="avatar" style={{ backgroundColor: 'var(--bg-surface-elevated)', marginRight: '16px' }}>
                <ach.icon size={24} style={{ color: ach.color }} />
              </div>
              <div className="flex-col flex-1">
                <span className="text-body" style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{ach.title}</span>
                <span className="text-label">{ach.desc}</span>
              </div>
              {i < 2 ? (
                <div className="badge" style={{ backgroundColor: ach.color + '20', color: ach.color }}>Unlocked</div>
              ) : (
                <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '2px' }}>
                  <div style={{ width: '60%', height: '100%', backgroundColor: ach.color, borderRadius: '2px' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
