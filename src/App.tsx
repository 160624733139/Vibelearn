import { useState, useEffect, FormEvent, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Globe, 
  Smartphone, 
  Search, 
  BookOpen, 
  Briefcase, 
  TrendingUp, 
  User, 
  Lock, 
  ChevronRight,
  Sparkles,
  LogOut,
  Cpu,
  LayoutDashboard,
  Target,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  Settings,
  Sun,
  Moon,
  Award,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Download,
  MessageSquare,
  Send
} from 'lucide-react';
import { 
  getDomainSuggestions, 
  getSkillGapAnalysis, 
  generateQuiz, 
  generateCourseModules,
  getFreeCourseSuggestions,
  generateGoalRoadmap,
  DomainSuggestion, 
  SkillGap, 
  QuizQuestion,
  CourseModule,
  FreeCourse,
  GoalRoadmap
} from './lib/gemini';

// --- Components ---

const Logo = () => (
  <motion.div 
    whileHover={{ rotate: 10, scale: 1.1 }}
    className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
  >
    <Globe className="w-8 h-8 text-emerald-500 absolute" />
    <Smartphone className="w-5 h-5 text-white absolute bg-black rounded-sm p-0.5" />
  </motion.div>
);

const BadgePopup = ({ badgeName, onClose, theme }: { badgeName: string, onClose: () => void, theme: 'dark' | 'light' }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.5, y: 50 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.5, y: 50 }}
    className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
  >
    <div className={`w-full max-w-sm p-10 rounded-[40px] border text-center space-y-6 shadow-2xl ${
      theme === 'light' ? 'bg-white border-orange-200' : 'bg-[#0a0a0a] border-white/10'
    }`}>
      <motion.div 
        animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
      >
        <Award className="w-12 h-12 text-emerald-400" />
      </motion.div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Badge Earned!</h3>
        <p className="text-gray-500">Congratulations on completing the course</p>
        <div className={`text-xl font-bold ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{badgeName}</div>
      </div>
      <button 
        onClick={onClose}
        className={`w-full py-4 rounded-2xl font-bold transition-all ${
          theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
        }`}
      >
        Awesome!
      </button>
    </div>
  </motion.div>
);

const Certificate = ({ username, goal, date, theme, onClose }: { username: string, goal: string, date: string, theme: 'dark' | 'light', onClose: () => void }) => {
  const certRef = useRef<HTMLDivElement>(null);

  const downloadCert = () => {
    if (!certRef.current) return;
    const content = certRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Certificate - ${goal}</title>
            <style>
              body { font-family: 'Inter', sans-serif; margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f5f5f5; }
              .cert { width: 800px; padding: 60px; background: white; border: 20px solid #10b981; text-align: center; position: relative; }
              .cert::after { content: ''; position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px; border: 2px solid #10b981; pointer-events: none; }
              h1 { font-size: 48px; color: #064e3b; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 4px; }
              h2 { font-size: 24px; color: #374151; margin-bottom: 40px; font-weight: normal; }
              .name { font-size: 42px; color: #10b981; font-weight: bold; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; display: inline-block; padding: 0 40px; }
              .goal { font-size: 20px; color: #4b5563; margin-bottom: 60px; line-height: 1.6; }
              .footer { display: flex; justify-content: space-between; margin-top: 60px; }
              .sig { border-top: 1px solid #9ca3af; width: 200px; padding-top: 10px; font-size: 14px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="cert">
              <h1>Certificate</h1>
              <h2>of Appreciation</h2>
              <p>This is to certify that</p>
              <div class="name">${username}</div>
              <p class="goal">has successfully completed the entire learning path for the goal:</p>
              <div style="font-size: 24px; font-weight: bold; color: #064e3b; margin-bottom: 40px;">${goal}</div>
              <p>Awarded on ${new Date(date).toLocaleDateString()}</p>
              <div class="footer">
                <div class="sig">SkillPath AI Director</div>
                <div class="sig">AI Learning Coordinator</div>
              </div>
            </div>
            <script>
              window.onload = () => { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
    >
      <div className="w-full max-w-4xl space-y-6">
        <div ref={certRef} className={`p-12 rounded-[40px] border-8 text-center relative overflow-hidden ${
          theme === 'light' ? 'bg-white border-teal-600 text-black' : 'bg-[#0a0a0a] border-emerald-500 text-white'
        }`}>
          <div className="absolute top-0 left-0 w-32 h-32 border-l-8 border-t-8 border-emerald-500/30 rounded-tl-[40px]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-r-8 border-b-8 border-emerald-500/30 rounded-br-[40px]" />
          
          <Award className="w-20 h-20 text-emerald-500 mx-auto mb-8" />
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Certificate</h1>
          <h2 className="text-xl font-medium text-gray-500 mb-12">of Professional Achievement</h2>
          
          <p className="text-lg mb-4">This is proudly presented to</p>
          <div className={`text-4xl font-bold mb-12 inline-block border-b-2 px-12 pb-2 ${theme === 'light' ? 'border-teal-600 text-teal-600' : 'border-emerald-500 text-emerald-400'}`}>
            {username}
          </div>
          
          <p className="text-lg mb-4">for successfully mastering the goal of</p>
          <div className="text-2xl font-bold mb-12">{goal}</div>
          
          <div className="flex justify-between items-end mt-16 px-12">
            <div className="text-left">
              <div className="w-48 h-px bg-gray-500 mb-2" />
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">SkillPath AI Director</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold">{new Date(date).toLocaleDateString()}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">Date Issued</div>
            </div>
            <div className="text-right">
              <div className="w-48 h-px bg-gray-500 mb-2" />
              <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Learning Coordinator</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button 
            onClick={downloadCert}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-600 transition-all"
          >
            <Download className="w-5 h-5" /> Download PDF
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ProgressRing = ({ percentage, label, theme }: { percentage: number, label: string, theme: 'dark' | 'light' }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className={theme === 'dark' ? "text-white/5" : "text-black/5"}
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={theme === 'dark' ? "text-emerald-500" : "text-teal-600"}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
          {percentage}%
        </div>
      </div>
      <span className={`text-[10px] uppercase tracking-widest font-bold ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
};

const Quiz = ({ topic, onComplete, theme }: { topic: string, onComplete: () => void, theme: 'dark' | 'light' }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      const data = await generateQuiz(topic);
      setQuestions(data);
      setLoading(false);
    };
    loadQuiz();
  }, [topic]);

  const handleNext = () => {
    const isCorrect = selected === questions[currentIdx].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    
    const newAnswers = [...userAnswers, selected!];
    setUserAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse">Generating Quiz...</div>;

  if (isFinished) {
    const passed = score >= 3;
    return (
      <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="text-center space-y-2">
          <div className={`text-5xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {score}/5
          </div>
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            {passed ? "Excellent! You've mastered this module." : "Keep learning! You need at least 3 correct answers to proceed."}
          </p>
        </div>

        <div className="space-y-6">
          <h4 className="font-bold text-lg border-b border-white/10 pb-2">Review Answers</h4>
          {questions.map((q, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${
              userAnswers[i] === q.correctAnswer 
                ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20')
                : (theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/20')
            }`}>
              <p className="font-bold text-sm mb-3">{i + 1}. {q.question}</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Your answer:</span>
                  <span className={userAnswers[i] === q.correctAnswer ? 'text-emerald-500 font-bold' : 'text-red-400 font-bold'}>
                    {userAnswers[i]}
                  </span>
                </div>
                {userAnswers[i] !== q.correctAnswer && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Correct answer:</span>
                    <span className="text-emerald-500 font-bold">{q.correctAnswer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          {passed ? (
            <button onClick={onComplete} className={`w-full py-4 rounded-2xl font-bold transition-all ${
              theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
            }`}>Continue to Next Module</button>
          ) : (
            <button 
              onClick={() => { setIsFinished(false); setCurrentIdx(0); setScore(0); setSelected(null); setUserAnswers([]); }} 
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                theme === 'light' ? 'bg-orange-100 text-teal-700 hover:bg-orange-200' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Retry Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
        <span>Question {currentIdx + 1} of 5</span>
        <span>Score: {score}</span>
      </div>
      <h3 className="text-xl font-bold">{q.question}</h3>
      <div className="grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(opt)}
            className={`w-full p-4 rounded-xl text-left border transition-all ${
              selected === opt ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/10 hover:border-white/30'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <button
        disabled={!selected}
        onClick={handleNext}
        className="w-full bg-white text-black font-bold py-3 rounded-xl disabled:opacity-50"
      >
        {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
      </button>
    </div>
  );
};

// --- Pages ---

const LoginPage = ({ onLogin, theme, setTheme }: { onLogin: (user: any, data: any) => void, theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        onLogin(data.user, data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 font-sans selection:bg-emerald-500/30 transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#f5f5f5] text-black' : 'bg-[#050505] text-white'
    }`}>
      <div className="absolute top-8 right-8">
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`p-3 rounded-2xl transition-all ${
            theme === 'light' ? 'bg-orange-100 text-teal-600' : 'bg-white/5 text-emerald-400'
          }`}
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md backdrop-blur-xl border p-8 rounded-3xl shadow-2xl relative z-10 ${
          theme === 'light' ? 'bg-white border-orange-200' : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">SkillPath AI</h1>
        <p className="text-gray-400 text-center mb-8 text-sm">Your intelligent career navigator</p>

        <form onSubmit={handleAuth} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (e.target.value.length > 0) setShowHistory(true);
                }}
                autoComplete={showHistory ? "on" : "off"}
                className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-colors ${
                  theme === 'light' ? 'bg-gray-100 border-gray-200 focus:border-teal-500' : 'bg-white/5 border-white/10 focus:border-emerald-500/50'
                }`}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-colors ${
                    theme === 'light' ? 'bg-gray-100 border-gray-200 focus:border-teal-500' : 'bg-white/5 border-white/10 focus:border-emerald-500/50'
                  }`}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-gray-500 font-semibold ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:outline-none transition-colors ${
                  theme === 'light' ? 'bg-gray-100 border-gray-200 focus:border-teal-500' : 'bg-white/5 border-white/10 focus:border-emerald-500/50'
                }`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3 rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 mt-4 ${
              theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
            }`}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-400 hover:underline font-medium"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const SettingsPage = ({ theme, setTheme, userId, onReset }: { theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void, userId: number, onReset: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Password updated successfully!');
        setNewPassword('');
      } else {
        setStatus(data.error);
      }
    } catch (err) {
      setStatus('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("DANGER: This will permanently delete ALL your courses, badges, goals, and profile data. You cannot undo this. Continue?")) return;
    if (!confirm("Are you absolutely sure you want to reset your entire account? This action is permanent and cannot be undone.")) return;
    setResetLoading(true);
    try {
      const res = await fetch('/api/reset-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        onReset();
        alert("Account data has been reset successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reset account.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <h2 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>Settings</h2>
      
      <div className={`p-8 rounded-[32px] border ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}>
        <h3 className="text-xl font-bold mb-6">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-bold">Theme Mode</div>
            <div className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Switch between light and dark interface</div>
          </div>
          <div className="flex bg-black/10 p-1 rounded-xl">
            <button 
              onClick={() => setTheme('light')}
              className={`p-2 rounded-lg flex items-center gap-2 transition-all ${theme === 'light' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs font-bold">Light</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-2 rounded-lg flex items-center gap-2 transition-all ${theme === 'dark' ? 'bg-emerald-500 text-black shadow-sm' : 'text-gray-500'}`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs font-bold">Dark</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`p-8 rounded-[32px] border ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}>
        <h3 className="text-xl font-bold mb-6">Security</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>New Password</label>
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 outline-none transition-all ${
                theme === 'light' ? 'bg-white border-orange-200 focus:border-teal-500' : 'bg-white/5 border-white/10 focus:border-emerald-500'
              }`}
              placeholder="Enter new unique password"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !newPassword}
            className={`w-full font-bold py-3 rounded-xl transition-all disabled:opacity-50 ${
              theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
            }`}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
          {status && <p className={`text-center text-xs font-bold ${status.includes('success') ? 'text-emerald-500' : 'text-red-400'}`}>{status}</p>}
        </form>
      </div>

      <div className={`p-8 rounded-[32px] border border-emerald-500/20 ${theme === 'light' ? 'bg-emerald-50' : 'bg-emerald-500/5'}`}>
        <h3 className="text-xl font-bold mb-2 text-emerald-500">Account Status</h3>
        <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          Your account is active and all your progress is being securely synced to our servers.
        </p>
      </div>
    </div>
  );
};

const Dashboard = ({ username, theme, badges, userCourses, setUserCourses }: { username: string, theme: 'dark' | 'light', badges: any[], userCourses: any[], setUserCourses: any }) => {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setBlink(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const deleteCourse = async (id: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this learning path?")) return;
    
    // Optimistic update
    setUserCourses(userCourses.filter((c: any) => c.id !== id));
    
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 pt-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: blink ? [0, 1, 0, 1] : 1 }}
        transition={{ duration: 1, times: [0, 0.2, 0.5, 1] }}
        className="text-center space-y-4"
      >
        <h2 className="text-5xl font-bold tracking-tighter">
          Welcome back, <span className={theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}>{username}</span>
        </h2>
      </motion.div>

      <div className={`p-8 rounded-[32px] border ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className={theme === 'light' ? 'text-teal-600' : 'text-emerald-400'} />
            Career Value & Progress
          </h3>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto pr-4 custom-scrollbar space-y-4">
          {userCourses.length > 0 ? (
            userCourses.map((course: any) => (
              <div key={course.id} className={`p-6 rounded-2xl border flex items-center gap-6 ${theme === 'light' ? 'bg-white/50 border-orange-100' : 'bg-white/5 border-white/5'}`}>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">{course.title}</span>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{course.progress}%</span>
                      <button 
                        onClick={() => deleteCourse(course.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete learning path"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${theme === 'light' ? 'bg-teal-600' : 'bg-emerald-500'}`} 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 italic">No active courses yet. Start learning to see your progress!</div>
          )}
          
          <div className={`p-6 rounded-2xl border ${theme === 'light' ? 'bg-white/50 border-orange-100' : 'bg-white/5 border-white/5'}`}>
            <div className="font-bold mb-2 text-gray-500 uppercase tracking-widest text-xs">Total Badges Earned</div>
            <div className={`text-4xl font-bold ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{badges.length}</div>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4">
          {badges.map((badge, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border ${theme === 'light' ? 'bg-orange-100 border-orange-200 text-teal-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
            >
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">{badge.badgeName}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Skills & Interests", desc: "Map your skills to global job markets", icon: Target, path: "/skills", color: theme === 'light' ? "text-teal-600" : "text-emerald-400" },
          { title: "Learning Hub", desc: "Master new domains with AI-curated courses", icon: GraduationCap, path: "/courses", color: "text-blue-400" },
          { title: "Skill Gap Analysis", desc: "Identify and bridge your professional gaps", icon: AlertCircle, path: "/gap", color: "text-purple-400" },
        ].map((item, i) => (
          <Link key={i} to={item.path}>
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              className={`border p-8 rounded-[32px] transition-all group h-full ${
                theme === 'light' 
                  ? 'bg-[#FFDAB9] border-orange-200 hover:border-teal-500/30' 
                  : 'bg-white/5 border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 transition-colors ${theme === 'light' ? 'group-hover:text-teal-600' : 'group-hover:text-emerald-400'}`}>{item.title}</h3>
              <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-500'} text-sm leading-relaxed`}>{item.desc}</p>
              <div className={`mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>
                Explore <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const SkillsPage = ({ skills, setSkills, interests, setInterests, userId, suggestions, setSuggestions, theme }: any) => {
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [freeCourses, setFreeCourses] = useState<FreeCourse[]>([]);
  const [loadingFree, setLoadingFree] = useState(false);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!userId) return;
      setIsSaving(true);
      try {
        await fetch('/api/user-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, skills, interests, suggestions }),
        });
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [skills, interests, suggestions, userId]);

  const findDomains = async () => {
    if (!skills || !interests) return;
    setIsSearching(true);
    setLoadingFree(true);
    try {
      const [domains, courses] = await Promise.all([
        getDomainSuggestions(skills, interests),
        getFreeCourseSuggestions(skills, interests)
      ]);
      setSuggestions(domains);
      setFreeCourses(courses);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
      setLoadingFree(false);
    }
  };

  const deleteSuggestion = (index: number) => {
    if (!confirm("Are you sure you want to delete this domain suggestion?")) return;
    const updated = suggestions.filter((_: any, i: number) => i !== index);
    setSuggestions(updated);
  };

  return (
    <div className="space-y-12">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>Skills & Interests</h2>
            <div className="flex items-center gap-2">
              {isSaving && <span className="text-[10px] uppercase tracking-widest text-gray-500 animate-pulse">Saving...</span>}
              <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500/20'}`} />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>Your Current Skills</label>
              <textarea 
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className={`w-full border rounded-2xl p-4 min-h-[120px] outline-none transition-all resize-none ${
                  theme === 'light' 
                    ? 'bg-white border-orange-200 focus:border-teal-500 text-black' 
                    : 'bg-white/5 border-white/10 focus:border-emerald-500/50 text-white'
                }`}
                placeholder="e.g. React, Node.js, UI Design, Project Management..."
              />
            </div>
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>Your Interests</label>
              <textarea 
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className={`w-full border rounded-2xl p-4 min-h-[120px] outline-none transition-all resize-none ${
                  theme === 'light' 
                    ? 'bg-white border-orange-200 focus:border-teal-500 text-black' 
                    : 'bg-white/5 border-white/10 focus:border-emerald-500/50 text-white'
                }`}
                placeholder="e.g. Artificial Intelligence, Renewable Energy, Fintech..."
              />
            </div>
            <button 
              onClick={findDomains}
              disabled={isSearching || !skills || !interests}
              className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
              }`}
            >
              {isSearching ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isSearching ? "Analyzing Market Data..." : "Generate Career Paths"}
            </button>
          </div>
        </div>

        <div className={`border rounded-[32px] p-8 backdrop-blur-xl ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`} />
            Market Demand Analysis
          </h3>
          <div className="space-y-8">
            {suggestions && suggestions.length > 0 ? (
              suggestions.map((item: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${theme === 'light' ? 'bg-white/50 border-orange-100' : 'bg-white/5 border-white/5'}`}
                >
                  <div className="space-y-1">
                    <div className="font-bold">{item.domain}</div>
                    <div className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>{item.marketStanding}</div>
                  </div>
                  <ProgressRing percentage={item.demandPercentage} label="Demand" theme={theme} />
                </motion.div>
              ))
            ) : (
              <div className={`text-center py-12 italic ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                Input your skills to see market demand rings.
              </div>
            )}
          </div>
        </div>
      </div>

      {freeCourses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <GraduationCap className={`w-6 h-6 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`} />
            <h3 className="text-2xl font-bold">Recommended Free Certifications</h3>
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Courses Recommended</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeCourses.map((course, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
                  theme === 'light' ? 'bg-white border-orange-200' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="space-y-2">
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{course.provider}</div>
                  <h4 className="font-bold text-lg leading-tight">{course.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{course.description}</p>
                </div>
                <div className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border ${
                  theme === 'light' ? 'bg-teal-50/50 border-teal-100 text-teal-600' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80'
                }`}>
                  Suggested on {course.provider}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {suggestions && suggestions.map((item: any, i: number) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-3xl p-8 space-y-6 ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}
          >
            <div className="flex justify-between items-start">
              <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{item.domain}</h3>
              <button 
                onClick={() => deleteSuggestion(i)}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                title="Delete suggestion"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'} text-sm leading-relaxed`}>{item.description}</p>
            <div className="space-y-4">
              <div className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>Job Opportunities on this Domain</div>
              <div className="flex flex-wrap gap-2">
                {item.companies.map((c: string, j: number) => (
                  <span key={j} className={`px-3 py-1 border rounded-lg text-xs ${theme === 'light' ? 'bg-white/50 border-orange-100' : 'bg-white/5 border-white/5'}`}>{c}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CoursesPage = ({ userId, userCourses, setUserCourses, badges, setBadges, goals, setGoals, theme, username }: any) => {
  const [newCourseName, setNewCourseName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);
  const [earnedBadge, setEarnedBadge] = useState<string | null>(null);
  
  const [goalInput, setGoalInput] = useState('');
  const [goalDifficulty, setGoalDifficulty] = useState('Intermediate');
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [activeGoalModule, setActiveGoalModule] = useState<any>(null);
  const [activeGoalQuiz, setActiveGoalQuiz] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<any>(null);

  const calculateGoalProgress = (roadmap: any[]) => {
    if (!roadmap || roadmap.length === 0) return 0;
    const completed = roadmap.filter((s: any) => s.completed).length;
    return Math.round((completed / roadmap.length) * 100);
  };

  const addCourse = async (name?: string, domain?: string) => {
    const courseName = name || newCourseName;
    if (!courseName) return;
    setIsCreating(true);
    try {
      const modules = await generateCourseModules(courseName);
      const res = await fetch('/api/courses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title: courseName, domain: domain || "Custom Path", modules }),
      });
      const data = await res.json();
      if (data.success) {
        setUserCourses([...userCourses, { id: data.courseId, title: courseName, domain: domain || "Custom Path", modules, progress: 0, completed: 0 }]);
        setNewCourseName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteCourse = async (id: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this learning path?")) return;
    
    // Optimistic update
    setUserCourses(userCourses.filter((c: any) => c.id !== id));
    
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoalSubmit = async () => {
    if (!goalInput) return;
    setIsGeneratingGoal(true);
    try {
      const roadmap = await generateGoalRoadmap(goalInput, goalDifficulty);
      const res = await fetch('/api/goals/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, goalTitle: goalInput, roadmap: roadmap.steps }),
      });
      const data = await res.json();
      if (data.success) {
        setGoals([...goals, { id: data.goalId, goalTitle: goalInput, roadmap: roadmap.steps, completed: 0 }]);
        setGoalInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingGoal(false);
    }
  };

  const deleteGoal = async (id: number) => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this goal and its roadmap?")) return;
    
    // Optimistic update
    setGoals(goals.filter((g: any) => g.id !== id));
    
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleModuleComplete = async () => {
    if (!activeCourse || !activeModule) return;
    
    const updatedModules = activeCourse.modules.map((m: any) => 
      m.id === activeModule.id ? { ...m, completed: true } : m
    );
    
    const completedCount = updatedModules.filter((m: any) => m.completed).length;
    const progress = Math.round((completedCount / updatedModules.length) * 100);
    const isFullyCompleted = completedCount === updatedModules.length;

    try {
      await fetch('/api/courses/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: activeCourse.id, progress, modules: updatedModules, completed: isFullyCompleted }),
      });

      const updatedCourses = userCourses.map((c: any) => 
        c.id === activeCourse.id ? { ...c, modules: updatedModules, progress, completed: isFullyCompleted ? 1 : 0 } : c
      );
      setUserCourses(updatedCourses);
      setActiveCourse(updatedCourses.find((c: any) => c.id === activeCourse.id));
      setActiveModule(null);
      setActiveQuiz(null);

      if (isFullyCompleted) {
        const badgeName = `${activeCourse.title} Master`;
        if (!badges.find((b: any) => b.badgeName === badgeName)) {
          await fetch('/api/badges/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, badgeName }),
          });
          setBadges([...badges, { badgeName, dateEarned: new Date().toISOString() }]);
          setEarnedBadge(badgeName);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGoalStep = async (goalId: number, stepIndex: number) => {
    if (!confirm("Are you sure you want to delete this learning path (step) from your roadmap?")) return;
    
    const updatedGoals = goals.map((g: any) => {
      if (g.id === goalId) {
        const newRoadmap = g.roadmap.filter((_: any, i: number) => i !== stepIndex);
        return { ...g, roadmap: newRoadmap };
      }
      return g;
    });

    setGoals(updatedGoals);
    const targetGoal = updatedGoals.find((g: any) => g.id === goalId);
    
    try {
      await fetch('/api/goals/update-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, roadmap: targetGoal.roadmap }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoalModuleComplete = async (goalId: number, stepIndex: number, moduleIndex: number) => {
    const updatedGoals = goals.map((g: any) => {
      if (g.id === goalId) {
        const newRoadmap = JSON.parse(JSON.stringify(g.roadmap));
        newRoadmap[stepIndex].modules[moduleIndex].completed = true;
        
        const allModulesDone = newRoadmap[stepIndex].modules.every((m: any) => m.completed);
        if (allModulesDone && !newRoadmap[stepIndex].completed) {
          newRoadmap[stepIndex].completed = true;
          const badgeName = `${g.goalTitle}: ${newRoadmap[stepIndex].title}`;
          
          fetch('/api/badges/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, badgeName }),
          });
          setBadges([...badges, { badgeName, dateEarned: new Date().toISOString() }]);
          setEarnedBadge(badgeName);
          confetti({ particleCount: 100, spread: 50 });
        }
        
        return { ...g, roadmap: newRoadmap };
      }
      return g;
    });

    setGoals(updatedGoals);
    const targetGoal = updatedGoals.find((g: any) => g.id === goalId);
    
    await fetch('/api/goals/update-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, roadmap: targetGoal.roadmap }),
    });

    setActiveGoalModule(null);
    
    const allStepsDone = targetGoal.roadmap.every((s: any) => s.completed);
    if (allStepsDone && targetGoal.completed === 0) {
      await fetch('/api/goals/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      });
      const finalGoals = updatedGoals.map((g: any) => g.id === goalId ? { ...g, completed: 1 } : g);
      setGoals(finalGoals);
      setShowCertificate({ goal: targetGoal.goalTitle, date: new Date().toISOString() });
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    }
  };

  const checkGoalCompletion = async (goal: any) => {
    // Legacy check for old roadmap structure
    if (goal.roadmap[0]?.courses) {
      const roadmapCourses = goal.roadmap.flatMap((s: any) => s.courses);
      const completedCourses = userCourses.filter(c => c.completed === 1).map(c => c.title);
      const allCompleted = roadmapCourses.every((rc: string) => completedCourses.includes(rc));

      if (allCompleted && goal.completed === 0) {
        try {
          await fetch('/api/goals/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ goalId: goal.id }),
          });
          const updatedGoals = goals.map((g: any) => g.id === goal.id ? { ...g, completed: 1 } : g);
          setGoals(updatedGoals);
          setShowCertificate({ goal: goal.goalTitle, date: new Date().toISOString() });
        } catch (err) {
          console.error(err);
        }
      }
      return;
    }

    // New structure check
    const allStepsDone = goal.roadmap.every((s: any) => s.completed);
    if (allStepsDone && goal.completed === 0) {
      try {
        await fetch('/api/goals/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalId: goal.id }),
        });
        const updatedGoals = goals.map((g: any) => g.id === goal.id ? { ...g, completed: 1 } : g);
        setGoals(updatedGoals);
        setShowCertificate({ goal: goal.goalTitle, date: new Date().toISOString() });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (activeModule) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <button onClick={() => setActiveModule(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Course
        </button>
        <div className={`p-10 rounded-[40px] border ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}>
          <h2 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{activeModule.title}</h2>
          <div className={`prose prose-invert max-w-none ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'} leading-relaxed`}>
            {activeModule.content.split('\n').map((p: string, i: number) => <p key={i} className="mb-4">{p}</p>)}
          </div>
          <div className="mt-12 pt-8 border-t border-white/10">
            {activeModule.completed ? (
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-6 h-6" /> Module Completed
              </div>
            ) : (
              <button 
                onClick={() => setActiveQuiz(activeModule.title)}
                className={`px-8 py-4 rounded-2xl font-bold transition-all ${
                  theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
                }`}
              >
                Take Quiz to Complete
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {activeQuiz && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`w-full max-w-xl border rounded-[40px] shadow-2xl overflow-hidden relative ${theme === 'light' ? 'bg-white border-orange-200' : 'bg-[#0a0a0a] border-white/10'}`}
              >
                <button 
                  onClick={() => setActiveQuiz(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
                <Quiz 
                  topic={activeQuiz} 
                  onComplete={handleModuleComplete} 
                  theme={theme}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (activeCourse) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        <button onClick={() => setActiveCourse(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Hub
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{activeCourse.title}</h2>
            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">{activeCourse.domain}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Progress</div>
              <div className="text-2xl font-bold">{activeCourse.progress}%</div>
            </div>
            <div className="w-32 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${activeCourse.progress}%` }}
                className={`h-full ${theme === 'light' ? 'bg-teal-600' : 'bg-emerald-500'}`}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {activeCourse.modules.map((module: any, i: number) => {
            const isUnlocked = i === 0 || activeCourse.modules[i-1].completed;
            return (
              <button 
                key={module.id}
                disabled={!isUnlocked}
                onClick={() => setActiveModule(module)}
                className={`flex items-center justify-between p-6 rounded-3xl border transition-all text-left ${
                  !isUnlocked 
                    ? 'opacity-50 cursor-not-allowed grayscale' 
                    : (theme === 'light' 
                        ? 'bg-[#FFDAB9] border-orange-200 hover:border-teal-500' 
                        : 'bg-white/5 border-white/10 hover:border-emerald-500/50')
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    module.completed 
                      ? (theme === 'light' ? 'bg-teal-600 text-white' : 'bg-emerald-500 text-black') 
                      : (isUnlocked ? 'bg-white/10 text-emerald-400' : 'bg-white/5 text-gray-500')
                  }`}>
                    {module.completed ? <CheckCircle2 className="w-5 h-5" /> : (isUnlocked ? i + 1 : <Lock className="w-4 h-4" />)}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{module.title}</h4>
                    <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                      {module.completed ? 'Completed' : (isUnlocked ? 'Click to start learning' : 'Complete previous module to unlock')}
                    </p>
                  </div>
                </div>
                {isUnlocked ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <Lock className="w-4 h-4 text-gray-500" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-12">
      <AnimatePresence>
        {earnedBadge && (
          <BadgePopup badgeName={earnedBadge} theme={theme} onClose={() => setEarnedBadge(null)} />
        )}
        {showCertificate && (
          <Certificate 
            username={username} 
            goal={showCertificate.goal} 
            date={showCertificate.date} 
            theme={theme} 
            onClose={() => setShowCertificate(null)} 
          />
        )}
        {activeGoalModule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-2xl p-10 rounded-[40px] border shadow-2xl relative max-h-[80vh] overflow-y-auto ${theme === 'light' ? 'bg-white border-orange-200' : 'bg-[#0a0a0a] border-white/10'}`}
            >
              <button 
                onClick={() => setActiveGoalModule(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>Learning Path Module</div>
                  <h3 className="text-3xl font-bold">{activeGoalModule.title}</h3>
                </div>
                
                <div className={`prose prose-invert max-w-none ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                  <p className="leading-relaxed">{activeGoalModule.content}</p>
                </div>
                
                {!activeGoalModule.completed && (
                  <button 
                    onClick={() => setActiveGoalQuiz(activeGoalModule.title)}
                    className={`w-full py-4 rounded-2xl font-bold transition-all ${
                      theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
                    }`}
                  >
                    Take Quiz to Complete
                  </button>
                )}
              </div>

              <AnimatePresence>
                {activeGoalQuiz && (
                  <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`w-full max-w-xl border rounded-[40px] shadow-2xl overflow-hidden relative ${theme === 'light' ? 'bg-white border-orange-200' : 'bg-[#0a0a0a] border-white/10'}`}
                    >
                      <button 
                        onClick={() => setActiveGoalQuiz(null)}
                        className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full"
                      >
                        <XCircle className="w-6 h-6 text-gray-500" />
                      </button>
                      <Quiz 
                        topic={activeGoalQuiz} 
                        onComplete={() => {
                          handleGoalModuleComplete(activeGoalModule.goalId, activeGoalModule.stepIndex, activeGoalModule.moduleIndex);
                          setActiveGoalQuiz(null);
                        }} 
                        theme={theme}
                      />
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>Set Your Goal</h2>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>What do you want to achieve? We'll build a roadmap of learning paths for you.</p>
            
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setGoalDifficulty(level)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      goalDifficulty === level
                        ? (theme === 'light' ? 'bg-teal-600 text-white border-teal-600' : 'bg-emerald-500 text-black border-emerald-500')
                        : (theme === 'light' ? 'bg-white border-orange-200 text-gray-500 hover:border-teal-500' : 'bg-white/5 border-white/10 text-gray-400 hover:border-emerald-500')
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Become a Senior Frontend Engineer"
                  className={`flex-1 border rounded-2xl px-6 py-4 outline-none transition-all ${
                    theme === 'light' ? 'bg-white border-orange-200 focus:border-teal-500 text-black' : 'bg-white/5 border-white/10 focus:border-emerald-500/50 text-white'
                  }`}
                />
                <button 
                  onClick={handleGoalSubmit}
                  disabled={isGeneratingGoal || !goalInput}
                  className={`px-8 rounded-2xl font-bold transition-all disabled:opacity-50 ${
                    theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
                  }`}
                >
                  {isGeneratingGoal ? <Sparkles className="w-6 h-6 animate-spin" /> : "Set Goal"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Target className={theme === 'light' ? 'text-teal-600' : 'text-emerald-400'} />
              Active Goals & Roadmaps
            </h3>
            <div className="space-y-4">
              {goals.length > 0 ? goals.map((goal: any) => (
                <motion.div 
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl border ${theme === 'light' ? 'bg-white border-orange-200' : 'bg-white/5 border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-bold">{goal.goalTitle}</h4>
                      {goal.completed === 1 && <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Goal Achieved!</span>}
                      <div className={`mt-2 p-3 rounded-xl text-s font-bold underline bg-grey-200 text-center border ${
                          theme === 'light' ? 'border-yellow-100 text-blue-700' : 'border-yellow-500/10 text-blue-400'
                    }`}>
                          Complete this goal to get an appreciation certificate.
                        </div>

                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Goal Status</div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-black/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${theme === 'light' ? 'bg-teal-600' : 'bg-emerald-500'}`} 
                              style={{ width: `${calculateGoalProgress(goal.roadmap)}%` }} 
                            />
                          </div>
                          <span className="text-sm font-bold">{calculateGoalProgress(goal.roadmap)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {goal.completed === 1 && (
                          <button 
                            onClick={() => setShowCertificate({ goal: goal.goalTitle, date: new Date().toISOString() })}
                            className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}
                        {goal.completed === 1 && <Award className="w-5 h-5 text-emerald-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {goal.roadmap.map((step: any, i: number) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-emerald-500 text-black' : (theme === 'light' ? 'bg-teal-600 text-white' : 'bg-emerald-500 text-black')}`}>
                              {step.completed ? <CheckCircle2 className="w-4 h-4" /> : i+1}
                            </div>
                            <div className="font-bold text-sm">{step.title}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {step.completed && <Award className="w-4 h-4 text-emerald-400" />}
                            {/* Delete option removed as per request */}
                          </div>
                        </div>
                        
                        {step.modules ? (
                          <div className="pl-9 space-y-4">
                            <div className="space-y-2">
                              {step.modules.map((mod: any, j: number) => (
                                <button 
                                  key={j}
                                  onClick={() => setActiveGoalModule({ goalId: goal.id, stepIndex: i, moduleIndex: j, ...mod })}
                                  className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                                    mod.completed 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : (theme === 'light' ? 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10')
                                  }`}
                                >
                                  <span>{mod.title}</span>
                                  {mod.completed ? <CheckCircle2 className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                                </button>
                              ))}
                            </div>

                            {step.resources && step.resources.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
                                  <BookOpen className="w-3 h-3" /> Recommended Resources
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {step.resources.map((res: any, j: number) => (
                                    <a 
                                      key={j}
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                        theme === 'light' ? 'bg-white border border-orange-100 text-teal-600 hover:border-teal-500' : 'bg-white/5 border border-white/10 text-emerald-400 hover:border-emerald-500/50'
                                      }`}
                                    >
                                      {res.title} <ExternalLink className="w-2 h-2" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="pl-9 flex flex-wrap gap-2">
                            {step.courses.map((course: string, j: number) => {
                              const isAdded = userCourses.find((c: any) => c.title === course);
                              const isCompleted = isAdded?.completed === 1;
                              return (
                                <button 
                                  key={j}
                                  disabled={isAdded}
                                  onClick={() => addCourse(course, goal.goalTitle)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                    isCompleted 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : (isAdded 
                                          ? 'bg-white/10 text-gray-400 border border-white/5' 
                                          : (theme === 'light' ? 'bg-teal-50 text-teal-600 border border-teal-100 hover:bg-teal-100' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'))
                                  }`}
                                >
                                  {course} {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : (isAdded ? <Plus className="w-3 h-3 rotate-45" /> : <Plus className="w-3 h-3" />)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-12 text-gray-500 italic border border-dashed border-white/10 rounded-3xl">
                  No goals set yet. Tell us what you want to achieve!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-8">
          <div className="space-y-4">
              <h2 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>Learning Hub</h2>
              <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Add a specific course name to generate a personalized AI learning path.</p>
            <div className="flex gap-4">
              <input 
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Enter course name (e.g. AI Ethics)"
                className={`flex-1 border rounded-2xl px-6 py-4 outline-none transition-all ${
                  theme === 'light' ? 'bg-white border-orange-200 focus:border-teal-500 text-black' : 'bg-white/5 border-white/10 focus:border-emerald-500/50 text-white'
                }`}
              />
              <button 
                onClick={() => addCourse()}
                disabled={isCreating || !newCourseName}
                className={`p-4 rounded-2xl font-bold transition-all disabled:opacity-50 ${
                  theme === 'light' ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-emerald-500 text-black hover:bg-emerald-600'
                }`}
              >
                {isCreating ? <Sparkles className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {userCourses.map((course: any) => (
              <motion.div 
                key={course.id} 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-[32px] overflow-hidden flex flex-col ${
                  theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="p-8 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-teal-700' : 'text-emerald-400'}`}>{course.domain}</div>
                    {/* Delete option removed as per request */}
                  </div>
                  <h3 className="text-2xl font-bold">{course.title}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-black/10 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${theme === 'light' ? 'bg-teal-600' : 'bg-emerald-500'}`} style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>

                  {course.completed === 1 && (
                    <div className={`flex items-center gap-2 text-sm font-bold ${theme === 'light' ? 'text-teal-700' : 'text-emerald-400'}`}>
                      <Award className="w-4 h-4" /> Course Completed
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-black/5 border-t border-white/5">
                  <button 
                    onClick={() => setActiveCourse(course)}
                    className={`w-full font-bold py-3 rounded-xl transition-colors ${
                      theme === 'light' ? 'bg-white text-teal-600 hover:bg-gray-100' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {course.completed === 1 ? 'Review Course' : 'Continue Learning'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className={`w-6 h-6 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`} />
              Learning Support
            </h3>
            <ChatAssistant theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GapPage = ({ skills, interests, theme }: { skills: string, interests: string, theme: 'dark' | 'light' }) => {
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!skills || !interests) return;
    const analyze = async () => {
      setLoading(true);
      const domains = interests.split(',').map(s => s.trim());
      const data = await getSkillGapAnalysis(skills, domains);
      setGaps(data);
      setLoading(false);
    };
    analyze();
  }, [skills, interests]);

  if (loading) return <div className="text-center py-24 animate-pulse">Analyzing your professional gaps...</div>;

  return (
    <div className="space-y-12">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h2 className={`text-4xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>Skill Gap Analysis</h2>
        <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Identify exactly what you're missing to reach your target domains.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {gaps.map((gap, i) => (
          <div key={i} className={`border rounded-[32px] p-8 space-y-8 ${theme === 'light' ? 'bg-[#FFDAB9] border-orange-200' : 'bg-white/5 border-white/10'}`}>
            <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`}>{gap.domain}</h3>
            
            <div className="space-y-4">
              <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                <AlertCircle className="w-4 h-4 text-red-400" />
                Lacking Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {gap.lackingSkills.map((s, j) => (
                  <span key={j} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                <TrendingUp className={`w-4 h-4 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`} />
                Bridge Roadmap
              </div>
              <div className="space-y-3">
                {gap.roadmap.map((step, j) => (
                  <div key={j} className="flex gap-4 items-start">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 ${
                      theme === 'light' ? 'bg-teal-600/20 text-teal-600' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {j + 1}
                    </div>
                    <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-500'}`}>
                <Sparkles className={`w-4 h-4 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`} />
                Suggested Skills to Acquire
              </div>
              <div className="flex flex-wrap gap-2">
                {gap.lackingSkills.map((s, j) => (
                  <span key={j} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    theme === 'light' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatAssistant = ({ theme }: { theme: 'dark' | 'light' }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMsg].map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        config: {
          systemInstruction: "You are a helpful learning assistant for SkillPath AI. Help users clear their doubts about their learning goals and courses. Be concise and encouraging.",
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Service unavailable. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`border rounded-3xl overflow-hidden flex flex-col h-[400px] ${theme === 'light' ? 'bg-white border-orange-200' : 'bg-white/5 border-white/10'}`}>
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <MessageSquare className={`w-5 h-5 ${theme === 'light' ? 'text-teal-600' : 'text-emerald-400'}`} />
        <span className="font-bold text-sm">AI Learning Assistant</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs italic">
            Ask me anything about your learning path!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
              m.role === 'user' 
                ? (theme === 'light' ? 'bg-teal-600 text-white' : 'bg-emerald-500 text-black')
                : (theme === 'light' ? 'bg-gray-100 text-gray-800' : 'bg-white/10 text-gray-200')
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] animate-pulse text-gray-500">Assistant is thinking...</div>}
      </div>
      <div className="p-3 border-t border-white/5 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a doubt..."
          className={`flex-1 bg-transparent outline-none text-xs ${theme === 'light' ? 'text-black' : 'text-white'}`}
        />
        <button onClick={handleSend} className={`p-2 rounded-xl ${theme === 'light' ? 'bg-teal-600 text-white' : 'bg-emerald-500 text-black'}`}>
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<{ id: number, username: string, email: string } | null>(() => {
    const saved = localStorage.getItem('skillpath_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [skills, setSkills] = useState(() => localStorage.getItem('skillpath_skills') || '');
  const [interests, setInterests] = useState(() => localStorage.getItem('skillpath_interests') || '');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>(() => {
    const saved = localStorage.getItem('skillpath_suggestions');
    return saved ? JSON.parse(saved) : [];
  });
  const [userCourses, setUserCourses] = useState<any[]>(() => {
    const saved = localStorage.getItem('skillpath_courses');
    return saved ? JSON.parse(saved) : [];
  });
  const [badges, setBadges] = useState<any[]>(() => {
    const saved = localStorage.getItem('skillpath_badges');
    return saved ? JSON.parse(saved) : [];
  });
  const [goals, setGoals] = useState<any[]>(() => {
    const saved = localStorage.getItem('skillpath_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('skillpath_theme') as 'dark' | 'light') || 'dark';
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('skillpath_user', JSON.stringify(user));
    else localStorage.removeItem('skillpath_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('skillpath_skills', skills);
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('skillpath_interests', interests);
  }, [interests]);

  useEffect(() => {
    localStorage.setItem('skillpath_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('skillpath_courses', JSON.stringify(userCourses));
  }, [userCourses]);

  useEffect(() => {
    localStorage.setItem('skillpath_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('skillpath_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('skillpath_theme', theme);
  }, [theme]);

  const handleLogin = (userData: any, fullData: any) => {
    setUser(userData);
    setSkills(fullData.data.skills || '');
    setInterests(fullData.data.interests || '');
    setSuggestions(JSON.parse(fullData.data.suggestions || '[]'));
    setUserCourses(fullData.courses || []);
    setBadges(fullData.badges || []);
    fetchGoals(userData.id);
  };

  const fetchGoals = async (uid: number) => {
    try {
      const res = await fetch(`/api/goals/${uid}`);
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSkills('');
    setInterests('');
    setSuggestions([]);
    setUserCourses([]);
    setBadges([]);
    setGoals([]);
    localStorage.clear();
  };

  const handleResetData = () => {
    setSkills('');
    setInterests('');
    setSuggestions([]);
    setUserCourses([]);
    setBadges([]);
    setGoals([]);
    localStorage.removeItem('skillpath_skills');
    localStorage.removeItem('skillpath_interests');
    localStorage.removeItem('skillpath_suggestions');
    localStorage.removeItem('skillpath_courses');
    localStorage.removeItem('skillpath_badges');
    localStorage.removeItem('skillpath_goals');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} theme={theme} setTheme={setTheme} />;
  }

  return (
    <Router>
      <div className={`min-h-screen font-sans selection:bg-emerald-500/30 pb-20 transition-colors duration-300 ${
        theme === 'light' ? 'bg-white text-black' : 'bg-[#050505] text-white'
      }`}>
        <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors ${
          theme === 'light' ? 'bg-white/80 border-orange-100' : 'bg-black/50 border-white/5'
        }`}>
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Logo />
              <span className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-teal-600' : 'text-white'}`}>SkillPath AI</span>
            </Link>
            
            <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              <Link to="/" className="hover:text-teal-500 transition-colors">Dashboard</Link>
              <Link to="/skills" className="hover:text-teal-500 transition-colors">Skills</Link>
              <Link to="/courses" className="hover:text-teal-500 transition-colors">Courses</Link>
              <Link to="/gap" className="hover:text-teal-500 transition-colors">Gap Analysis</Link>
              <Link to="/settings" className="hover:text-teal-500 transition-colors flex items-center gap-1">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </nav>

            <div className="flex items-center gap-6">
              <div className="relative" ref={profileMenuRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-3 p-1.5 rounded-2xl transition-all ${
                    theme === 'light' ? 'hover:bg-orange-100' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme === 'light' ? 'bg-teal-600 text-white' : 'bg-emerald-500 text-black'
                  }`}>
                    <User className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-semibold hidden sm:inline ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    {user.username}
                  </span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-3 w-72 rounded-3xl border shadow-2xl overflow-hidden z-[60] ${
                        theme === 'light' ? 'bg-white border-orange-100' : 'bg-[#0a0a0a] border-white/10'
                      }`}
                    >
                      <div className="p-6 space-y-6">
                        <div className="space-y-1">
                          <div className="font-bold text-lg">{user.username}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>

                        <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                          theme === 'light' ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/80'
                        }`}>
                          <div className="flex gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>Your data is automatically saved and synced. Please logout before closing the website to ensure session security.</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link 
                            to="/settings" 
                            onClick={() => setShowProfileMenu(false)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${
                              theme === 'light' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/5 text-gray-300'
                            }`}
                          >
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          <button 
                            onClick={() => {
                              setShowProfileMenu(false);
                              handleLogout();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-red-400 transition-colors ${
                              theme === 'light' ? 'hover:bg-red-50' : 'hover:bg-red-400/10'
                            }`}
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6">
          <Routes>
            <Route path="/" element={<Dashboard username={user.username} theme={theme} badges={badges} userCourses={userCourses} setUserCourses={setUserCourses} />} />
            <Route path="/skills" element={<SkillsPage skills={skills} setSkills={setSkills} interests={interests} setInterests={setInterests} userId={user.id} suggestions={suggestions} setSuggestions={setSuggestions} theme={theme} />} />
            <Route path="/courses" element={<CoursesPage userId={user.id} userCourses={userCourses} setUserCourses={setUserCourses} badges={badges} setBadges={setBadges} goals={goals} setGoals={setGoals} theme={theme} username={user.username} />} />
            <Route path="/gap" element={<GapPage skills={skills} interests={interests} theme={theme} />} />
            <Route path="/settings" element={<SettingsPage theme={theme} setTheme={setTheme} userId={user.id} onReset={handleResetData} />} />
          </Routes>
        </main>

        <footer className={`mt-24 border-t py-12 ${theme === 'light' ? 'border-orange-100' : 'border-white/5'}`}>
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <Logo />
              <span className={`font-bold ${theme === 'light' ? 'text-teal-600' : 'text-white'}`}>SkillPath AI</span>
            </div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-teal-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-teal-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-teal-500 transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5" />
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
