import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Cloud, Lock, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr,0.95fr]">
        <div className="hidden lg:block">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <span className="pill-chip mt-8 inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100/80">
            <ShieldCheck className="h-4 w-4" />
            Secure sign in
          </span>

          <h1 className="mt-6 max-w-xl text-5xl leading-tight font-semibold text-white">
            Pick up where you left your files.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Step back into your dashboard, search faster, and keep every upload within reach.
          </p>

          <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="surface-panel-soft p-5">
              <p className="text-sm font-medium text-white">Instant access</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                Open your workspace with tags, categories, and quick previews already in place.
              </p>
            </div>
            <div className="surface-panel-soft p-5">
              <p className="text-sm font-medium text-white">Focused workflow</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                One place to upload, review, search, and clean up your library.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-panel mx-auto w-full max-w-lg p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/12 text-cyan-100">
              <Cloud className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">CloudDrive</p>
              <h2 className="mt-1 text-3xl font-semibold text-white">Welcome back</h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Sign in to manage your storage, review AI-tagged files, and keep your workspace tidy.
          </p>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-200">
                Username
              </label>
              <div className="surface-panel-soft relative rounded-2xl">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="surface-panel-soft relative rounded-2xl">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/30"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_35px_rgba(56,189,248,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-cyan-100 transition hover:text-white">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
