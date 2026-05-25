import { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Flame, ArrowRight } from 'lucide-react';
import '../index.css';

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  const getRedirectUrl = () => {
    // Check if we're in a Capacitor native app context
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
      return 'capacitor://localhost';
    }
    return window.location.origin + window.location.pathname;
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then tap Forgot password.');
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl()
      });
      if (resetError) throw resetError;
      setInfo('Password reset link sent. Check your email.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add your keys to a .env file and restart.');
      setLoading(false);
      return;
    }
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.session) {
          onLogin(data.session);
        } else {
          setInfo("Account created. Please check your email to verify.");
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) {
          onLogin(data.session);
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "An error occurred during Google sign in");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      padding: '24px', 
      backgroundColor: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Aesthetic Gradients */}
      <div style={{
        position: 'absolute',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(50, 215, 75, 0.15) 0%, rgba(0,0,0,0) 60%)',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(10, 132, 255, 0.1) 0%, rgba(0,0,0,0) 60%)',
        bottom: '-20%',
        right: '-10%',
        filter: 'blur(80px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="fade-in" style={{ 
        width: '100%', 
        maxWidth: '380px', 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Minimal Logo */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #222 0%, #111 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 20px rgba(0,0,0,0.4)',
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <Flame size={28} color="var(--accent-green)" />
        </div>

        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: '#ffffff', 
          letterSpacing: '-0.5px',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          {isSignUp ? 'Create your account' : 'Welcome to Ascend'}
        </h1>
        
        <p style={{
          fontSize: '15px',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          marginBottom: '48px',
          lineHeight: '1.4'
        }}>
          Track your fitness journey instantly.
        </p>

        {info && (
          <div style={{ width: '100%', background: 'rgba(50, 215, 75, 0.1)', color: 'var(--accent-green)', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', textAlign: 'center', fontWeight: 500 }}>
            {info}
          </div>
        )}

        {error && (
          <div style={{ width: '100%', background: 'rgba(255, 69, 58, 0.1)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', textAlign: 'center', fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Primary CTA: Google Sign In */}
        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading} 
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '16px', 
            background: '#ffffff', 
            color: '#000000', 
            fontWeight: 600, 
            fontSize: '16px', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '12px', 
            opacity: loading ? 0.7 : 1,
            transition: 'transform 0.2s ease, filter 0.2s ease',
            boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
          onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ marginTop: '24px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {!showEmailAuth ? (
            <button
              onClick={() => setShowEmailAuth(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                padding: '8px'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              Or use email
            </button>
          ) : (
            <div style={{ width: '100%', animation: 'fadeIn 0.3s ease' }}>
              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email"
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(255,255,255,0.03)', 
                    color: '#fff', 
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.background = 'rgba(255,255,255,0.03)';
                  }}
                />
                
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    background: 'rgba(255,255,255,0.03)', 
                    color: '#fff', 
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.background = 'rgba(255,255,255,0.03)';
                  }}
                />

                {!isSignUp && (
                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: 'var(--accent-green)', 
                    color: '#fff', 
                    fontWeight: 600, 
                    fontSize: '16px', 
                    border: 'none', 
                    cursor: 'pointer',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1,
                    transition: 'filter 0.2s ease'
                  }}
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')} <ArrowRight size={18} />
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'rgba(255,255,255,0.5)', 
                    fontSize: '14px', 
                    cursor: 'pointer'
                  }}
                >
                  {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
