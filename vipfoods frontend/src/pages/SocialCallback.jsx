import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import vipLogo from '../assets/viplogo.jpg';

export default function SocialCallback() {
  const [params] = useState(() => new URLSearchParams(window.location.hash.slice(1)));
  const [session] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('vipfoods_social_login')) || {}; } catch { return {}; }
  });
  const [error, setError] = useState(params.get('error') || '');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(!params.get('error'));
  const request = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  function complete(data) {
    if (!data.success || !data.token) throw new Error('Unable to complete login.');
    login(data.user, data.token);
    sessionStorage.removeItem('vipfoods_social_login');
    navigate(session.returnTo === '/checkout' ? '/checkout' : '/', {
      replace: true,
      state: { showBrandIntro: true },
    });
  }
  function failed(err) {
    if (err.response?.data?.code === 'PASSWORD_REQUIRED') setNeedsPassword(true);
    setError(err.response?.data?.message || err.message || 'Unable to sign in. Please try again.');
    setBusy(false);
  }
  useEffect(() => {
    window.history.replaceState(window.history.state, '', window.location.pathname);
    if (params.get('error')) return;
    if (!params.get('ticket') || !session.verifier) {
      setError('Sign-in session is missing. Please start again in this browser.');
      setBusy(false);
      return;
    }
    let active = true;
    // Reuse the redemption request across React StrictMode effect replays.
    request.current ||= api.post('/auth/social/finish', { ticket: params.get('ticket'), verifier: session.verifier });
    request.current.then(({ data }) => { if (active) complete(data); }).catch(err => { if (active) failed(err); });
    return () => { active = false; };
    // This callback consumes the captured ticket once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function confirm(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post('/auth/social/finish', { ticket: params.get('ticket'), verifier: session.verifier, password });
      complete(data);
    } catch (err) { failed(err); }
  }
  return <main className="min-h-screen bg-[#43238a] flex items-center justify-center p-6">
    <section className="bg-white rounded-3xl p-8 max-w-md w-full space-y-5">
      <img src={vipLogo} alt="VIP Foods" className="w-40 mx-auto" />
      <h1 className="text-xl font-bold">{needsPassword ? 'Link your existing account' : 'Signing you in'}</h1>
      {busy && <p role="status">Completing secure sign-in…</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {needsPassword && <form onSubmit={confirm} className="space-y-4">
        <label className="block">Existing VIP Foods password
          <input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="block w-full border rounded-xl p-3 mt-2" />
        </label>
        <button disabled={busy} className="bg-green-700 text-white rounded-xl p-3 w-full">Confirm and sign in</button>
      </form>}
      <Link to="/login" className="block text-green-700 underline">Back to login</Link>
    </section>
  </main>;
}
