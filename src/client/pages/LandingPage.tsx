import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Kanban,
  BarChart3,
  Users2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Target,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (role: 'admin' | 'project_manager' | 'member') => {
    const emailMap = {
      admin: 'alex.admin@taskflow.dev',
      project_manager: 'sarah.pm@taskflow.dev',
      member: 'david.dev@taskflow.dev',
    };
    try {
      await login({ email: emailMap[role], password: 'TaskFlow2026!' });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">TaskFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflows" className="hover:text-white transition-colors">Workflows</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo Accounts</a>
            <a href="#tech" className="hover:text-white transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
              >
                Go to Workspace <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Built for High-Velocity Product Teams & Internships</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Orchestrate sprints, track deadlines, and <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">deliver together</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            TaskFlow combines drag-and-drop Kanban boards, real-time workload analytics, role-based authorization, and threaded collaboration in a unified SaaS platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/25 transition-all"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" /> Instant Demo Access
            </a>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-5 shadow-2xl backdrop-blur-xl text-left max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-3 text-xs font-mono text-slate-400">taskflow.internal/workspace/sprint-3</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Active
              </div>
            </div>

            {/* Mock Kanban preview mini-board */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>To Do (3)</span>
                  <span className="text-slate-500">···</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs mb-2">
                  <div className="text-[10px] text-indigo-400 font-bold mb-1">MOB-101</div>
                  <div className="font-semibold text-white">OAuth token refresh logic</div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span className="text-rose-400">Urgent</span>
                    <span>David Kim</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>In Progress (2)</span>
                  <span className="text-slate-500">···</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs mb-2">
                  <div className="text-[10px] text-sky-400 font-bold mb-1">OPS-402</div>
                  <div className="font-semibold text-white">Kubernetes node auto-scaling</div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span className="text-amber-400">High</span>
                    <span>Alex Rivers</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>Completed (5)</span>
                  <span className="text-slate-500">···</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs mb-2">
                  <div className="text-[10px] text-emerald-400 font-bold mb-1">PORT-210</div>
                  <div className="font-semibold text-white">Design system token release</div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">Done</span>
                    <span>Sarah Chen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instant Demo Accounts Section */}
      <section id="demo" className="py-16 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              One-Click Interactive Demo Accounts
            </h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Test out real role-based permissions immediately without registering. Click any persona below to launch the live app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Workspace Admin
                  </span>
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Alex Rivers</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Full control: create projects, manage team members, access global analytics, delete workspaces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Log In as Admin
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Project Manager
                  </span>
                  <Target className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Sarah Chen</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Manage sprints, assign tasks to engineers, track team velocity, and review milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('project_manager')}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Log In as Project Manager
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Team Member
                  </span>
                  <Users2 className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">David Kim</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Execute sprint tasks, advance Kanban cards, reply in comment threads, and view personal workload.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('member')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Log In as Member
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Everything your team needs to stay aligned
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Built from first principles for performance, clarity, and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Interactive Kanban Boards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag and drop task cards across To Do, In Progress, In Review, and Completed with immediate backend persistence and accessible keyboard alternatives.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Real-Time Database Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No simulated data. Live status breakdowns, priority distributions, and completion velocity computed directly from persistent database records.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Role-Based Authorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforced server-side with JWT authentication and BCrypt password hashing. Private project data is protected against IDOR vulnerabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Architecture Section */}
      <section id="tech" className="py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
            Production-Ready Full-Stack Technology Stack
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              'React 19',
              'TypeScript',
              'Express.js',
              'MongoDB / Mongoose',
              'Tailwind CSS v4',
              'TanStack Query',
              'Zod Validation',
              'BCrypt Hashing',
              'JWT Tokens',
              'Recharts',
              'Vitest Suite',
            ].map((badge) => (
              <span
                key={badge}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">TaskFlow System</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300">Create Account</Link>
            <a href="#demo" className="hover:text-slate-300">Demo Accounts</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
