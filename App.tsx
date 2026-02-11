
import React, { useState, createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
   Home, ChevronLeft, X, ArrowRight, CheckCircle2, Award, ShoppingCart,
   MapPin, Sparkles, Lock, Bell, Trophy, BookOpen, User, Info,
   TrendingUp, Clock, Scan, Camera, Map as MapIcon, Share2, Heart, QrCode, Rocket, Menu,
   RotateCcw, History, Gift, HelpCircle, Play, Smartphone, MessageCircle, Edit3, Copy, Wallet, Users, Mail, PlusCircle, Search, Zap, CameraIcon, Save, Globe, Phone, MapPinIcon, ChevronRight
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserPersona, UserProfile, Stamp, Finalist, FeatureSet, TriviaCategory, TriviaQuestion, TriviaHistoryItem, CartItem } from './types';
import { STAMPS, NEIGHBORHOODS, FINALISTS, TRIVIA_CATEGORIES, TRIVIA_QUESTIONS, TRIVIA_HISTORY, FAMILY_MEMBERS, FAMILY_GOAL, FAMILY_CONTRIBUTIONS, LAB_OPTIONS } from './constants';
import { PromosView } from './Promos';
import { MenuView } from './Menu';
import { CartView } from './Cart';

// --- Context ---
interface AppState {
   profile: UserProfile;
   setProfile: (p: UserProfile) => void;
   stamps: Stamp[];
   currentDay: number;
   activeFeature: FeatureSet;
   setActiveFeature: (f: FeatureSet) => void;
   isAuthenticated: boolean;
   login: (email?: string, password?: string) => void;
   logout: () => void;
   register: (user: UserProfile) => void;
   cart: CartItem[];
   addToCart: (item: CartItem) => void;
   removeFromCart: (itemId: string) => void;
   clearCart: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const useApp = () => {
   const context = useContext(AppContext);
   if (!context) throw new Error('useApp must be used within AppProvider');
   return context;
};

// --- Components ---

const LoginView: React.FC = () => {
   const { login } = useApp();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   // Load users from localStorage or use default
   const [users, setUsers] = useState<UserProfile[]>(() => {
      const savedUsers = localStorage.getItem('bon_users');
      return savedUsers ? JSON.parse(savedUsers) : [];
   });

   const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();

      // Check hardcoded admin user (legacy support)
      if (email === 'josemiguel6@gmail.com' && password === '123456') {
         login(email, password);
         return;
      }

      // Check registered users
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
         login(email, password);
      } else {
         setError('Credenciales incorrectas');
      }
   };

   return (
      <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-8 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

         <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm relative z-10 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center mb-8">
               <img src="/helados-bon.jpg" className="w-32 h-32 object-contain mb-4" />
               <h1 className="text-2xl font-black italic text-gray-900 uppercase tracking-tighter">Bienvenido</h1>
               <p className="text-sm font-medium text-gray-400 italic">Inicia sesión para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
               <div>
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block italic">Correo Electrónico</label>
                  <input
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-600 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     placeholder="correo@ejemplo.com"
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block italic">Contraseña</label>
                  <input
                     type="password"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-600 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     placeholder="••••••"
                  />
               </div>

               {error && <p className="text-red-500 text-xs font-black italic text-center animate-pulse">{error}</p>}

               <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] uppercase italic shadow-lg active:scale-95 transition-all"
               >
                  Entrar
               </button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-xs font-bold text-gray-400 italic">¿No tienes cuenta?</p>
               <a href="/#/register" className="text-red-600 font-black italic uppercase text-xs tracking-widest hover:underline mt-1 inline-block">
                  Regístrate aquí
               </a>
            </div>
         </div>
         <p className="text-white/60 text-[10px] font-bold mt-8 uppercase tracking-widest">Helados Bon App v2.9.0</p>
      </div>
   );
};

const RegisterView: React.FC = () => {
   const { register } = useApp();
   const navigate = useNavigate();

   const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
   });
   const [error, setError] = useState('');

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
         setError('Por favor completa todos los campos');
         return;
      }

      if (formData.password !== formData.confirmPassword) {
         setError('Las contraseñas no coinciden');
         return;
      }

      if (formData.password.length < 6) {
         setError('La contraseña debe tener al menos 6 caracteres');
         return;
      }

      // Check if user already exists
      const savedUsers = localStorage.getItem('bon_users');
      const users: UserProfile[] = savedUsers ? JSON.parse(savedUsers) : [];

      if (users.some(u => u.email === formData.email)) {
         setError('Este correo ya está registrado');
         return;
      }

      // Create new user profile with default values
      const newUser: UserProfile = {
         name: formData.name,
         email: formData.email,
         password: formData.password,
         phone: '',
         city: '',
         country: 'República Dominicana',
         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
         level: 1,
         points: 100, // Welcome bonus
         stampsCount: 0,
         totalStampsNeeded: 40,
         persona: UserPersona.TRADITIONAL,
         sector: '',
         triviaPoints: 0,
         familyMembers: [], // Initialize empty for new users
         collectedStamps: [], // New users start with 0 stamps
         coupons: [
            {
               id: 'welcome-coupon',
               title: 'Bienvenido a la Familia',
               description: 'Disfruta de un 5% de descuento en tu primera compra.',
               discount: '5%',
               code: 'HOLA5BON',
               isWelcome: true
            }
         ]
      };

      register(newUser);
      navigate('/');
   };

   return (
      <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-8 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

         <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-500">
            <button
               onClick={() => navigate('/login')}
               className="absolute top-6 left-6 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
               <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center mb-8 mt-4">
               <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl mb-4">
                  <User size={32} />
               </div>
               <h1 className="text-2xl font-black italic text-gray-900 uppercase tracking-tighter">Crear Cuenta</h1>
               <p className="text-sm font-medium text-gray-400 italic">Únete a la familia Bon</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 block italic">Nombre Completo</label>
                  <input
                     type="text"
                     value={formData.name}
                     onChange={e => setFormData({ ...formData, name: e.target.value })}
                     className="w-full bg-gray-50 border-2 border-gray-100 focus:border-yellow-400 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     placeholder="Tu nombre"
                  />
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 block italic">Correo Electrónico</label>
                  <input
                     type="email"
                     value={formData.email}
                     onChange={e => setFormData({ ...formData, email: e.target.value })}
                     className="w-full bg-gray-50 border-2 border-gray-100 focus:border-yellow-400 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     placeholder="correo@ejemplo.com"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 block italic">Contraseña</label>
                     <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-yellow-400 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                        placeholder="••••••"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 block italic">Confirmar</label>
                     <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-yellow-400 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                        placeholder="••••••"
                     />
                  </div>
               </div>

               {error && <p className="text-red-500 text-xs font-black italic text-center animate-pulse">{error}</p>}

               <button
                  type="submit"
                  className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] uppercase italic shadow-lg active:scale-95 transition-all mt-2"
               >
                  Registrarse
               </button>
            </form>
         </div>
         <p className="text-black/40 text-[10px] font-bold mt-8 uppercase tracking-widest">Helados Bon App v2.9.0</p>
      </div>
   );
};

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
   const { isAuthenticated } = useApp();
   const location = useLocation();

   if (!isAuthenticated) {
      return <LoginView />;
   }

   return children;
};

const FeatureSwitcher: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
   const { activeFeature, setActiveFeature, profile, logout } = useApp();
   const navigate = useNavigate();

   const handleSelect = (feature: FeatureSet) => {
      setActiveFeature(feature);
      onClose();
      if (feature === FeatureSet.EXPLORADOR) navigate('/');
      else if (feature === FeatureSet.COPA) navigate('/copa');
      else if (feature === FeatureSet.TRIVIA) navigate('/trivia');
      else navigate('/familia');
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[100] flex">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
         <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-8 bg-red-600 text-white relative">
               <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full z-10">
                  <X size={20} />
               </button>
               <div className="flex flex-col items-center mb-8">
                  <h2 className="font-black text-2xl italic tracking-tighter mb-6 relative z-10">MENÚ BON</h2>
                  <img src="/helados-bon.jpg" alt="Logo" className="w-60 h-60 object-contain bg-white rounded-full p-4 shadow-xl" />
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white">
                     <img src={profile.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <p className="font-black text-lg">{profile.name}</p>
                  </div>
               </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Elige tu experiencia</p>

               <button
                  onClick={() => handleSelect(FeatureSet.EXPLORADOR)}
                  className={`w-full text-left p-6 rounded-[2rem] mb-4 transition-all flex items-center gap-4 ${activeFeature === FeatureSet.EXPLORADOR ? 'bg-red-50 border-2 border-red-600' : 'bg-gray-50 border-2 border-transparent'}`}
               >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeFeature === FeatureSet.EXPLORADOR ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                     <MapIcon size={24} />
                  </div>
                  <div>
                     <p className="font-black text-gray-900 leading-none">Explorador de Sabores</p>
                     <p className="text-[10px] text-gray-500 mt-1 font-medium italic">Mi Álbum de Estampas</p>
                  </div>
               </button>

               <button
                  onClick={() => handleSelect(FeatureSet.COPA)}
                  className={`w-full text-left p-6 rounded-[2rem] mb-4 transition-all flex items-center gap-4 ${activeFeature === FeatureSet.COPA ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-gray-50 border-2 border-transparent'}`}
               >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeFeature === FeatureSet.COPA ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-500'}`}>
                     <Trophy size={24} />
                  </div>
                  <div>
                     <p className="font-black text-gray-900 leading-none">Bon Community Cup</p>
                     <p className="text-[10px] text-gray-500 mt-1 font-medium italic">Votaciones y retos</p>
                  </div>
               </button>

               <button
                  onClick={() => handleSelect(FeatureSet.TRIVIA)}
                  className={`w-full text-left p-6 rounded-[2rem] mb-4 transition-all flex items-center gap-4 ${activeFeature === FeatureSet.TRIVIA ? 'bg-orange-50 border-2 border-red-500' : 'bg-gray-50 border-2 border-transparent'}`}
               >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeFeature === FeatureSet.TRIVIA ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                     <HelpCircle size={24} />
                  </div>
                  <div>
                     <p className="font-black text-gray-900 leading-none">Trivia-BON</p>
                     <p className="text-[10px] text-gray-500 mt-1 font-medium italic">El Baúl de los Recuerdos</p>
                  </div>
               </button>

               <button
                  onClick={() => handleSelect(FeatureSet.FAMILIA)}
                  className={`w-full text-left p-6 rounded-[2rem] mb-4 transition-all flex items-center gap-4 ${activeFeature === FeatureSet.FAMILIA ? 'bg-cream-50 border-2 border-red-600 shadow-sm' : 'bg-gray-50 border-2 border-transparent'}`}
               >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeFeature === FeatureSet.FAMILIA ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                     <Users size={24} />
                  </div>
                  <div>
                     <p className="font-black text-gray-900 leading-none">Cómplices del Antojo</p>
                     <p className="text-[10px] text-gray-500 mt-1 font-medium italic">Metas de los Recuerdos</p>
                  </div>
               </button>
            </div>

            <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-gray-50 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
               <span>Bon v2.8.0</span>
               <button onClick={logout} className="flex items-center gap-2 hover:text-red-600">Cerrar Sesión</button>
            </div>
         </div>
      </div>
   );
};

const BottomNav: React.FC = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { activeFeature, isAuthenticated } = useApp();

   if (!isAuthenticated) return null;

   const getActiveTab = () => {
      const p = location.pathname;
      if (p === '/' || p === '/copa' || p === '/trivia' || p === '/familia') return 'inicio';
      if (p === '/trivia/history' || p === '/ranking' || p === '/familia/goals') return 'actividad';
      if (p === '/promos') return 'promos';
      if (p === '/profile' || p === '/redeem') return 'perfil';
      return '';
   };

   return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] max-w-md mx-auto h-20">
         <button onClick={() => navigate(activeFeature === FeatureSet.COPA ? '/copa' : activeFeature === FeatureSet.TRIVIA ? '/trivia' : activeFeature === FeatureSet.FAMILIA ? '/familia' : '/')} className={`flex flex-col items-center flex-1 ${getActiveTab() === 'inicio' ? 'text-red-600 font-black' : 'text-gray-400 font-bold'}`}>
            <Home size={22} />
            <span className="text-[10px] mt-1 uppercase tracking-tighter">Inicio</span>
         </button>
         <button onClick={() => navigate(activeFeature === FeatureSet.TRIVIA ? '/trivia/history' : activeFeature === FeatureSet.FAMILIA ? '/familia/goals' : '/ranking')} className={`flex flex-col items-center flex-1 ${getActiveTab() === 'actividad' ? 'text-red-600 font-black' : 'text-gray-400 font-bold'}`}>
            {activeFeature === FeatureSet.TRIVIA || activeFeature === FeatureSet.FAMILIA ? <TrendingUp size={22} /> : <MapIcon size={22} />}
            <span className="text-[10px] mt-1 uppercase tracking-tighter">Actividad</span>
         </button>

         <div className="relative -top-10 flex-1 flex justify-center">
            <button
               onClick={() => navigate('/menu')}
               className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all ring-8 ring-white"
            >
               <ShoppingCart size={30} />
            </button>
         </div>

         <button onClick={() => navigate('/promos')} className={`flex flex-col items-center flex-1 ${getActiveTab() === 'promos' ? 'text-red-600 font-black' : 'text-gray-400 font-bold'}`}>
            <Award size={22} />
            <span className="text-[10px] mt-1 uppercase tracking-tighter">Promos</span>
         </button>
         <button onClick={() => navigate('/profile')} className={`flex flex-col items-center flex-1 ${getActiveTab() === 'perfil' ? 'text-red-600 font-black' : 'text-gray-400 font-bold'}`}>
            <User size={22} />
            <span className="text-[10px] mt-1 uppercase tracking-tighter">Perfil</span>
         </button>
      </div>
   );
};

// --- SECTION: PROFILE & REDEEM ---

const ProfileView: React.FC = () => {
   const { profile, setProfile } = useApp();
   const navigate = useNavigate();
   const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState({ ...profile });
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleAvatarClick = () => {
      fileInputRef.current?.click();
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setFormData(prev => ({ ...prev, avatar: reader.result as string }));
         };
         reader.readAsDataURL(file);
      }
   };

   const handleSave = () => {
      setProfile(formData);
      setIsEditing(false);
   };

   return (
      <div className="bg-[#F9F9F9] min-h-screen pb-24 overflow-y-auto">
         <div className="bg-red-600 p-8 pt-12 rounded-b-[4rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex justify-between items-center mb-10 relative z-10">
               <button onClick={() => navigate(-1)} className="p-3 bg-white/20 rounded-full"><ChevronLeft size={24} /></button>
               <h1 className="text-xl font-black italic uppercase tracking-widest">Mi Perfil Bon</h1>
               <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="p-3 bg-white/20 rounded-full">
                  {isEditing ? <Save size={24} /> : <Edit3 size={24} />}
               </button>
            </div>

            <div className="flex flex-col items-center relative z-10">
               <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-white group cursor-pointer" onClick={handleAvatarClick}>
                     <img src={formData.avatar} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" />
                     {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                           <CameraIcon size={32} />
                        </div>
                     )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
               </div>
               <h2 className="text-3xl font-black italic mb-2 tracking-tighter uppercase">{profile.name}</h2>
               <div className="flex items-center gap-2 bg-yellow-400 px-4 py-1.5 rounded-full text-black font-black text-[10px] uppercase shadow-lg border border-white/40">
                  <Trophy size={14} /> Nivel {profile.level} • Explorador
               </div>
            </div>
         </div>

         <div className="px-6 -mt-10 relative z-20">
            {/* Points Summary Card */}
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl mb-8 border border-gray-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Puntos Acumulados</p>
                  <h3 className="text-4xl font-black italic text-red-600 leading-none">{profile.points.toLocaleString()} <span className="text-lg opacity-40">pts</span></h3>
               </div>
               <button
                  onClick={() => navigate('/redeem')}
                  className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-black shadow-xl active:scale-95 transition-transform"
               >
                  <Gift size={32} />
               </button>
            </div>

            {/* User Info Form */}
            <div className="bg-white rounded-[3rem] p-8 shadow-xl mb-12 border border-gray-100">
               <h4 className="text-xl font-black italic text-gray-900 mb-8 uppercase tracking-tighter">Información Personal</h4>
               <div className="space-y-6">
                  <InfoField label="Nombre Completo" value={formData.name} icon={<User size={18} />} editable={isEditing} onChange={(val) => setFormData({ ...formData, name: val })} />
                  <InfoField label="Correo Electrónico" value={formData.email} icon={<Mail size={18} />} editable={isEditing} onChange={(val) => setFormData({ ...formData, email: val })} />
                  <InfoField label="Teléfono" value={formData.phone} icon={<Phone size={18} />} editable={isEditing} onChange={(val) => setFormData({ ...formData, phone: val })} />
                  <div className="grid grid-cols-2 gap-4">
                     <InfoField label="Ciudad" value={formData.city} icon={<MapPinIcon size={18} />} editable={isEditing} onChange={(val) => setFormData({ ...formData, city: val })} />
                     <InfoField label="País" value={formData.country} icon={<Globe size={18} />} editable={isEditing} onChange={(val) => setFormData({ ...formData, country: val })} />
                  </div>
               </div>
            </div>

            <button className="w-full bg-gray-900 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 italic uppercase text-xs mb-12 shadow-xl opacity-20">
               <Lock size={18} /> Eliminar Cuenta
            </button>
         </div>
      </div>
   );
};

const InfoField: React.FC<{ label: string, value: string, icon: React.ReactNode, editable?: boolean, onChange: (val: string) => void }> = ({ label, value, icon, editable, onChange }) => {
   return (
      <div className="group">
         <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2 block italic">{label}</label>
         <div className={`flex items-center gap-4 pb-3 border-b-2 transition-all ${editable ? 'border-red-600' : 'border-gray-100'}`}>
            <div className={`text-gray-400 group-focus-within:text-red-600 transition-colors ${editable && 'text-red-500'}`}>
               {icon}
            </div>
            {editable ? (
               <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 bg-transparent font-black italic text-gray-900 outline-none text-sm placeholder:text-gray-200"
                  autoFocus={label === "Nombre Completo"}
               />
            ) : (
               <p className="flex-1 font-black italic text-gray-900 text-sm">{value}</p>
            )}
         </div>
      </div>
   );
};

const RedeemPointsView: React.FC = () => {
   const navigate = useNavigate();
   const { profile } = useApp();

   const rewards = [
      { id: 1, title: 'Barquilla Regular', points: 500, description: 'Cualquier sabor del mes.', icon: '🍦', color: 'bg-orange-100' },
      { id: 2, title: 'Sunda Especial', points: 1200, description: 'Base + 2 toppings + sirope.', icon: '🍨', color: 'bg-red-50' },
      { id: 3, title: 'Vaso Familiar', points: 2500, description: 'Para compartir en casa.', icon: '📦', color: 'bg-yellow-50' },
      { id: 4, title: 'Experiencia Bon Lab', points: 5000, description: 'Crea tu propio sabor.', icon: '🔬', color: 'bg-purple-50' },
   ];

   return (
      <div className="bg-[#FEFBF2] min-h-screen pb-24 overflow-y-auto">
         <div className="px-6 pt-12 pb-8 flex items-center justify-between sticky top-0 bg-[#FEFBF2]/80 backdrop-blur-md z-10">
            <button onClick={() => navigate(-1)} className="p-3 bg-white text-red-600 rounded-full shadow-lg"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-black italic uppercase text-gray-900">Canjear Puntos</h1>
            <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-black italic text-xs shadow-lg">
               {profile.points}
            </div>
         </div>

         <div className="px-6 space-y-6 mt-4">
            {rewards.map(reward => (
               <div key={reward.id} className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-50 flex items-center gap-6 group active:scale-[0.98] transition-transform">
                  <div className={`w-20 h-20 ${reward.color} rounded-3xl flex items-center justify-center text-4xl shadow-inner`}>
                     {reward.icon}
                  </div>
                  <div className="flex-1">
                     <h4 className="font-black text-lg italic text-gray-900 leading-none mb-1">{reward.title}</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase italic mb-3">{reward.description}</p>
                     <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center"><Zap size={8} fill="black" /></div>
                        <p className="text-sm font-black text-red-600 italic leading-none">{reward.points} PUNTOS</p>
                     </div>
                  </div>
                  <button
                     disabled={profile.points < reward.points}
                     className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${profile.points >= reward.points ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'bg-gray-100 text-gray-300 opacity-50'}`}
                  >
                     <ChevronRight size={24} />
                  </button>
               </div>
            ))}
         </div>

         <div className="px-6 mt-12 pb-12">
            <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full"></div>
               <h3 className="text-2xl font-black italic mb-4 leading-tight uppercase">¿Quieres más puntos?</h3>
               <p className="text-xs font-medium opacity-60 italic mb-10 max-w-[200px] leading-relaxed">Invita a tus amigos y gana 200 puntos por cada uno que complete su primer álbum.</p>
               <button className="bg-yellow-400 text-black font-black px-10 py-4 rounded-[2rem] text-xs uppercase italic tracking-widest shadow-xl active:scale-95 transition-all">
                  Invitar Amigos
               </button>
            </div>
         </div>
      </div>
   );
};

// --- SECTION: WALLET FAMILIAR ---

const FamilyDashboard: React.FC = () => {
   const navigate = useNavigate();
   const { profile } = useApp();
   const [menuOpen, setMenuOpen] = useState(false);

   // Fallback to constants if profile.familyMembers is undefined (legacy support)
   const members = profile.familyMembers ?? [];
   const hasFamily = members.length > 0;

   // Calculate percentage only if there is a goal/family
   const percentage = hasFamily ? Math.round((FAMILY_GOAL.current / FAMILY_GOAL.target) * 100) : 0;

   return (
      <div className="bg-[#FEFBF2] min-h-screen pb-24 overflow-y-auto hide-scrollbar">
         <FeatureSwitcher isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

         <div className="px-6 pt-10 pb-4 flex items-center justify-between">
            <button onClick={() => setMenuOpen(true)} className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center text-red-600">
               <Menu size={24} />
            </button>
            <h1 className="text-xl font-black text-green-900 italic tracking-tighter uppercase flex items-center gap-2">
               <img src="/helados-bon.jpg" alt="Logo" className="w-32 h-32 object-contain" />
               Cómplices del Antojo
            </h1>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-lg">
               <Info size={24} />
            </button>
         </div>

         {hasFamily ? (
            <>
               <div className="px-6 mt-10 flex flex-col items-center text-center">
                  <h2 className="text-5xl font-black text-red-600 tracking-tighter mb-1 uppercase italic leading-none">{profile.name}</h2>
                  <p className="text-sm font-bold text-green-700 opacity-60 italic mb-12">¡Compartir sabe mejor con familia y amigos!</p>

                  <div className="relative w-72 h-72 flex items-center justify-center mb-10">
                     <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-red-50" />
                        <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="20" fill="transparent" strokeDasharray={2 * Math.PI * 130} strokeDashoffset={2 * Math.PI * 130 * (1 - percentage / 100)} className="text-red-600" strokeLinecap="round" />
                     </svg>
                     <div className="text-center">
                        <h3 className="text-6xl font-black text-green-900 leading-none">850</h3>
                        <p className="text-xs font-black text-red-600 uppercase tracking-widest mt-1">Puntos</p>
                     </div>
                  </div>

                  <h4 className="text-2xl font-black text-green-900 italic leading-none">{FAMILY_GOAL.name}</h4>
                  <p className="text-sm font-black text-red-600 mt-2 mb-6">{FAMILY_GOAL.description}</p>

                  <div className="bg-orange-100/50 text-red-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mb-12 shadow-sm border border-orange-200/50">
                     <Zap size={12} fill="currentColor" /> ¡Ya casi llegamos!
                  </div>
               </div>

               <div className="bg-white rounded-t-[3rem] px-6 pt-10 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.03)]">
                  <h5 className="text-xl font-black text-green-900 mb-6 italic">Contribuciones</h5>
                  <div className="space-y-4 mb-10">
                     {members.map(m => (
                        <div key={m.id} className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-[1.5rem] border border-gray-100">
                           <img src={m.avatar} className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
                           <div className="flex-1">
                              <h6 className="font-black text-green-900 leading-none">{m.name}</h6>
                              <p className="text-[10px] font-bold text-red-600 mt-1">{m.points} puntos aportados</p>
                           </div>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.isLead ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-300'}`}>
                              <Trophy size={16} fill={m.isLead ? "currentColor" : "none"} />
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="space-y-4">
                     <button onClick={() => navigate('/familia/goals')} className="w-full bg-red-600 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 text-sm italic uppercase shadow-xl shadow-red-200 active:scale-[0.98] transition-all">
                        <Gift size={24} /> Agrega tu factura y gana
                     </button>
                     <button onClick={() => navigate('/familia/invite')} className="w-full bg-transparent text-red-600 border-2 border-red-600 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 text-sm italic uppercase active:scale-[0.98] transition-all">
                        <PlusCircle size={24} /> Invitar Miembro
                     </button>
                  </div>
               </div>
            </>
         ) : (
            <div className="px-6 flex flex-col items-center justify-center min-h-[70vh]">
               <div className="w-40 h-40 bg-red-50 rounded-full flex items-center justify-center text-red-300 mb-8 animate-pulse">
                  <Users size={80} />
               </div>

               <h2 className="text-3xl font-black text-green-900 italic text-center leading-none mb-4 uppercase">¡Invita a tu Familia!</h2>
               <p className="text-sm font-bold text-gray-400 italic text-center mb-12 max-w-xs">
                  Crea tu círculo de "Cómplices del Antojo", acumulen puntos juntos y desbloqueen premios familiares.
               </p>

               <div className="w-full space-y-4">
                  <button onClick={() => navigate('/familia/invite')} className="w-full bg-white border-2 border-red-600 text-red-600 font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 text-sm italic uppercase active:scale-[0.98] transition-all shadow-xl">
                     <PlusCircle size={24} /> Invitar a tu amigo
                  </button>
                  <button onClick={() => navigate('/familia/goals')} className="w-full bg-red-600 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-3 text-sm italic uppercase active:scale-[0.98] transition-all shadow-xl shadow-red-100">
                     <Gift size={24} /> Registro de factura
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

const InviteMember: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-white min-h-screen p-8 flex flex-col items-center">
         <div className="w-full flex items-center mb-12 mt-4">
            <button onClick={() => navigate(-1)} className="p-3 bg-red-50 text-red-600 rounded-full"><ChevronLeft /></button>
            <h1 className="flex-1 text-center font-black text-gray-900 italic uppercase">Familia Bon</h1>
            <div className="w-12"></div>
         </div>

         <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-10 shadow-inner">
            <Users size={48} />
         </div>

         <h2 className="text-3xl font-black text-gray-900 text-center leading-tight mb-4">Suma a tus seres queridos</h2>
         <p className="text-sm font-medium text-gray-400 text-center mb-12 max-w-[280px] italic">
            Ingresa el correo de tu familiar para compartir premios y retos en el Círculo Familiar.
         </p>

         <div className="w-full mb-10">
            <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 block italic">Correo Electrónico</label>
            <div className="relative">
               <input type="email" placeholder="correo@ejemplo.com" className="w-full bg-gray-50 border-2 border-transparent focus:border-red-600 rounded-[1.5rem] py-5 px-6 font-medium text-gray-900 transition-all outline-none" />
               <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-red-200" size={24} />
            </div>
         </div>

         <div className="w-full bg-red-50/50 rounded-[2rem] p-8 border border-red-100 flex items-start gap-4 mb-auto">
            <Sparkles className="text-red-500 flex-shrink-0" />
            <div>
               <h4 className="font-black text-red-600 italic mb-1">¡Álbum de Sabores!</h4>
               <p className="text-[10px] font-medium text-gray-500 italic leading-relaxed">
                  Al unirse, podrán completar el álbum de sabores juntos y desbloquear helados gratis.
               </p>
            </div>
         </div>

         <button onClick={() => navigate('/familia/invite/success')} className="w-full bg-red-600 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 text-lg italic uppercase shadow-xl shadow-red-200 mt-12">
            Enviar Invitación <ArrowRight size={24} />
         </button>
         <p className="text-[8px] font-medium text-gray-400 mt-4 text-center italic uppercase tracking-widest">
            Al enviar la invitación, aceptas nuestros términos de privacidad para grupos familiares.
         </p>
      </div>
   );
};

const InviteSuccess: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-[#FEFBF2] min-h-screen flex flex-col items-center justify-center p-8 relative">
         <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => <div key={i} className="absolute bg-red-500 rounded-full" style={{ top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', width: Math.random() * 10 + 5, height: Math.random() * 10 + 5 }}></div>)}
         </div>

         <div className="w-full flex items-center mb-auto pt-4">
            <button onClick={() => navigate('/familia')} className="p-3 bg-white text-red-600 rounded-full shadow-lg"><ChevronLeft /></button>
            <h1 className="flex-1 text-center font-black text-gray-900 italic">Familia Bon</h1>
            <div className="w-12"></div>
         </div>

         <div className="bg-white rounded-[4rem] p-16 shadow-2xl relative mb-12 border-4 border-yellow-400">
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-full font-black text-[10px] italic shadow-lg">BON</div>
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl">
               <Mail size={48} />
            </div>
            <div className="flex justify-center gap-2 mt-6">
               <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
               <div className="w-2 h-2 bg-red-600 rounded-full"></div>
               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
         </div>

         <h2 className="text-5xl font-black text-gray-900 text-center tracking-tighter leading-none mb-6">¡Invitación Enviada!</h2>
         <p className="text-sm font-medium text-gray-400 text-center mb-20 max-w-[240px] italic leading-relaxed">
            Hemos enviado una invitación a la familia para que se unan a la diversión.
         </p>

         <div className="w-full space-y-4 mb-10">
            <button className="w-full bg-yellow-400 text-black font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 text-sm italic uppercase shadow-xl active:scale-95 transition-all">
               <MessageCircle size={24} fill="black" /> Compartir por WhatsApp
            </button>
            <button onClick={() => navigate('/familia')} className="w-full bg-transparent text-gray-900 border-2 border-yellow-400 font-black py-6 rounded-[2.5rem] text-sm italic uppercase">
               Volver al Círculo
            </button>
         </div>
      </div>
   );
};

const FamilyGoalDetail: React.FC = () => {
   const navigate = useNavigate();
   const { profile } = useApp();
   const [invoice, setInvoice] = useState('');
   const [branch, setBranch] = useState('');
   const [amount, setAmount] = useState('');
   const [name, setName] = useState(profile.name);
   const [loading, setLoading] = useState(false);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!invoice || !branch || !amount || !name) return;

      setLoading(true);
      setTimeout(() => {
         navigate('/familia/earned');
      }, 1500);
   };

   return (
      <div className="bg-[#FEFBF2] min-h-screen pb-24 overflow-y-auto">
         <div className="px-6 pt-12 pb-6 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-3 bg-white text-red-600 rounded-full shadow-lg"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-black text-gray-900 italic uppercase">Registrar Factura</h1>
            <div className="w-12"></div>
         </div>

         <div className="px-6 mt-4">
            <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-yellow-400 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-bl-[100%]"></div>
               <h2 className="text-3xl font-black text-red-600 italic uppercase leading-none mb-4">¡Suma Puntos!</h2>
               <p className="text-sm font-bold text-gray-400 italic mb-8">Ingresa los datos de tu factura para contribuir a la meta familiar.</p>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block italic">Número de Factura</label>
                     <input
                        type="text"
                        value={invoice}
                        onChange={e => setInvoice(e.target.value)}
                        placeholder="Ej: B010002130"
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-600 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     />
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block italic">Sucursal</label>
                     <input
                        type="text"
                        value={branch}
                        onChange={e => setBranch(e.target.value)}
                        placeholder="Ej: Bon Lincoln"
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-600 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     />
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block italic">Monto Total Consumido</label>
                     <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Ej: 1500.00"
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-600 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     />
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block italic">Nombre Completo</label>
                     <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 focus:border-red-600 rounded-2xl p-4 font-bold text-gray-900 outline-none transition-colors"
                     />
                  </div>

                  <button
                     type="submit"
                     disabled={!invoice || !branch || !amount || !name || loading}
                     className={`w-full py-5 rounded-[2rem] font-black uppercase italic text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${(!invoice || !branch || !amount || !name) ? 'bg-gray-200 text-gray-400' : 'bg-red-600 text-white active:scale-95'}`}
                  >
                     {loading ? 'Verificando...' : <>Registrar y Ganar <Sparkles size={20} /></>}
                  </button>
               </form>
            </div>
         </div>
      </div>
   );
};

const FamilyPointsSuccess: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-yellow-400 min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
         <button onClick={() => navigate('/familia')} className="absolute top-10 left-6 p-4 bg-white/20 rounded-full text-black backdrop-blur-md"><X /></button>
         <h1 className="text-xl font-black italic mb-8 uppercase">Confirmación</h1>

         <div className="bg-white/90 backdrop-blur-md text-gray-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl border-2 border-white mb-6 italic">
            ¡FELICIDADES!
         </div>
         <h2 className="text-5xl font-black text-gray-900 text-center tracking-tighter leading-[0.9] mb-12 uppercase italic">¡Puntos Familiares Ganados!</h2>

         <div className="w-full relative mb-12">
            <img src="https://picsum.photos/seed/coins/600/600" className="w-full rounded-[4rem] shadow-2xl" />
            <div className="absolute -bottom-6 -left-6 bg-red-600 text-white px-8 py-4 rounded-3xl font-serif text-3xl italic shadow-2xl border-4 border-white">
               Chore
            </div>
         </div>

         <div className="bg-white rounded-[3rem] p-10 w-full shadow-2xl border-4 border-white text-center">
            <h3 className="text-6xl font-black text-red-600 tracking-tighter mb-2">+100 Puntos</h3>
            <p className="text-sm font-black text-gray-900 italic mb-12">¡Doble puntuación por ser miércoles!</p>

            <div className="w-full h-px bg-gray-100 mb-10"></div>

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Nuevo Total Familiar</p>
            <div className="flex items-center justify-center gap-3">
               <Users size={28} className="text-yellow-400" />
               <span className="text-4xl font-black text-gray-900 italic">2,450 pts</span>
            </div>
         </div>

         <button onClick={() => navigate('/familia')} className="w-full bg-green-500 text-white font-black py-6 rounded-[2.5rem] mt-12 flex items-center justify-center gap-3 italic uppercase shadow-2xl active:scale-95 transition-all">
            <CheckCircle2 size={24} /> Continuar
         </button>
      </div>
   );
};

// --- SECTION: EXPLORADOR DASHBOARD ---

const ExploradorDashboard: React.FC = () => {
   const navigate = useNavigate();
   const { profile, stamps } = useApp();
   const [menuOpen, setMenuOpen] = useState(false);

   return (
      <div className="bg-red-600 min-h-screen pb-24 text-white overflow-y-auto hide-scrollbar">
         <FeatureSwitcher isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
         <div className="px-6 pt-10 pb-6 flex items-center justify-between">
            <button onClick={() => setMenuOpen(true)} className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
               <Menu size={24} />
            </button>
            <h1 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-2">
               <img src="/helados-bon.jpg" alt="Logo" className="w-32 h-32 object-contain bg-white rounded-full p-2" />
               Explorador Bon
            </h1>
            <button onClick={() => navigate('/album')} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
               <BookOpen size={24} />
            </button>
         </div>

         <div className="px-6 py-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2 italic">Nivel {profile.level}</p>
            <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-6">¡Hola, {profile.name.split(' ')[0]}!</h2>

            <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-6 mb-8 border border-white/10">
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70 italic">Tu Álbum</p>
                     <h3 className="text-3xl font-black italic">{profile.stampsCount} / {profile.totalStampsNeeded} Sabores</h3>
                  </div>
                  <Award className="text-yellow-400" size={40} />
               </div>
               <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400" style={{ width: `${(profile.stampsCount / profile.totalStampsNeeded) * 100}%` }}></div>
               </div>
            </div>

            <h4 className="text-xl font-black italic mb-4 uppercase tracking-tighter">Últimos Sabores</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
               {stamps.filter(s => s.collected).slice(0, 5).map(s => (
                  <div key={s.id} onClick={() => navigate(`/flavor/${s.id}`)} className="flex-shrink-0 w-32 h-44 bg-white rounded-3xl overflow-hidden shadow-xl">
                     <img src={s.image} className="w-full h-24 object-cover" />
                     <div className="p-2 text-center">
                        <p className="text-[10px] font-black text-gray-900 truncate uppercase italic">{s.name}</p>
                        <p className="text-[8px] font-bold text-red-600 italic">CONSEGUIDO</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-t-[3rem] p-8 text-gray-900 min-h-[40vh]">
            <h5 className="text-xl font-black italic mb-6 uppercase">Sabores por Descubrir</h5>
            <div className="grid grid-cols-3 gap-4">
               {stamps.filter(s => !s.collected).map(s => (
                  <div key={s.id} className="aspect-square bg-white rounded-2xl flex items-center justify-center relative overflow-hidden grayscale opacity-60">
                     <img src={s.image} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Lock size={20} className="text-white drop-shadow-md" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

// --- SECTION: EXPLORADOR VIEWS ---

const AlbumView: React.FC = () => {
   const navigate = useNavigate();
   const { stamps } = useApp();
   const [filter, setFilter] = useState<'all' | 'collected' | 'missing'>('all');

   const filteredStamps = stamps.filter(s => {
      if (filter === 'collected') return s.collected;
      if (filter === 'missing') return !s.collected;
      return true;
   });

   return (
      <div className="bg-[#F9F9F9] min-h-screen pb-24 overflow-y-auto">
         <div className="bg-red-600 p-8 pt-12 text-white">
            <div className="flex items-center gap-4 mb-8">
               <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full"><ChevronLeft /></button>
               <h1 className="text-2xl font-black italic uppercase tracking-tighter">Álbum de Sabores</h1>
            </div>
            <div className="flex bg-white/10 p-1 rounded-2xl">
               {(['all', 'collected', 'missing'] as const).map(f => (
                  <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-red-600 shadow-lg' : 'text-white/60'}`}
                  >
                     {f === 'all' ? 'Todos' : f === 'collected' ? 'Míos' : 'Faltan'}
                  </button>
               ))}
            </div>
         </div>

         <div className="p-6 grid grid-cols-2 gap-4">
            {filteredStamps.map(s => (
               <div
                  key={s.id}
                  onClick={() => navigate(`/flavor/${s.id}`)}
                  className={`bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 relative ${!s.collected && 'opacity-60 grayscale'}`}
               >
                  <img src={s.image} className="w-full h-24 object-cover" />
                  <div className="p-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.rarity || 'Común'}</p>
                     <h4 className="font-black italic text-gray-900 leading-none">{s.name}</h4>
                  </div>
                  {!s.collected && <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Lock size={20} className="text-white" /></div>}
               </div>
            ))}
         </div>
      </div>
   );
};

const NeighborhoodRanking: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-white min-h-screen pb-24 overflow-y-auto">
         <div className="p-8 pt-12 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-3 bg-red-50 text-red-600 rounded-full"><ChevronLeft /></button>
            <h1 className="text-xl font-black italic uppercase text-gray-900 tracking-tighter">Ranking de Sectores</h1>
            <div className="w-10"></div>
         </div>

         <div className="px-6 space-y-4">
            {NEIGHBORHOODS.map((n, idx) => (
               <div key={n.id} className={`flex items-center gap-4 p-6 rounded-[2rem] border ${n.isUserSector ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic ${idx < 3 ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-200 text-gray-500'}`}>
                     {idx + 1}
                  </div>
                  <div className="flex-1">
                     <h4 className="font-black italic text-gray-900">{n.name}</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{n.residents} Residentes</p>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black italic text-red-600 leading-none">{n.points.toLocaleString()}</p>
                     <p className="text-[8px] font-black text-gray-300 uppercase">PUNTOS</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

const FlavorDetail: React.FC = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { stamps } = useApp();
   const stamp = stamps.find(s => s.id === id);

   if (!stamp) return null;

   return (
      <div className="bg-white min-h-screen pb-24 overflow-y-auto">
         <div className="relative h-[50vh]">
            <img src={stamp.image} className="w-full h-full object-cover" />
            <button onClick={() => navigate(-1)} className="absolute top-10 left-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-full"><ChevronLeft /></button>
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white to-transparent h-40"></div>
         </div>

         <div className="px-8 -mt-10 relative z-10">
            <div className="bg-yellow-400 inline-block px-4 py-1.5 rounded-full text-black font-black text-[10px] uppercase tracking-widest mb-4 shadow-lg">
               Sabor {stamp.rarity || 'Común'}
            </div>
            <h1 className="text-5xl font-black italic text-gray-900 tracking-tighter uppercase mb-4">{stamp.name}</h1>

            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-100">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Popularidad</p>
                  <p className="font-black italic text-red-600">{stamp.popularity || 'Baja'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Conseguido el</p>
                  <p className="font-black italic text-gray-900">{stamp.date || 'Pendiente'}</p>
               </div>
            </div>

            <p className="text-gray-500 font-medium italic leading-relaxed mb-10">
               {stamp.description || "Este delicioso sabor es una de las joyas más preciadas de nuestra colección. Una experiencia única que solo Helados Bon puede ofrecer."}
            </p>

            <button className="w-full bg-red-600 text-white font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-3 italic uppercase shadow-xl shadow-red-100">
               <Share2 size={24} /> Compartir Sabor
            </button>
         </div>
      </div>
   );
};

// --- SECTION: COMMUNITY CUP VIEWS ---

const BonLab: React.FC = () => {
   const navigate = useNavigate();
   const [base, setBase] = useState('');
   const [fruit, setFruit] = useState('');
   const [topping, setTopping] = useState('');
   const [generatedFlavor, setGeneratedFlavor] = useState<{ name: string, description: string, image?: string } | null>(null);
   const [loading, setLoading] = useState(false);
   const [photo, setPhoto] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setPhoto(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const generateFlavor = async () => {
      if ((!base || !fruit || !topping) && !photo) return; // Allow generation if just photo is there? Or require ingredients? Let's require ingredients for the name generation unless logic changes.

      setLoading(true);

      // Custom Logic for Vainilla Imperial
      if (base === 'Vainilla' && fruit === 'Cereza Roja' && topping === 'Fresa') {
         setTimeout(() => {
            // @ts-ignore
            setGeneratedFlavor({
               name: 'Vainilla Imperial',
               description: 'Una combinación real de vainilla clásica, cerezas rojas intensas y el frescor de la fresa.',
               image: '/vain.jpg'
            });
            setLoading(false);
         }, 1500);
         return;
      }

      // Custom Logic for Chocolate Supreme
      if (base === 'Chocolate' && fruit === 'Cereza Roja' && topping === 'Sirope Caramelo') {
         setTimeout(() => {
            // @ts-ignore
            setGeneratedFlavor({
               name: 'Chocolate Supreme',
               description: 'La máxima expresión del chocolate, realzada con cerezas y un toque dulce de caramelo.',
               image: '/chocolate.png'
            });
            setLoading(false);
         }, 1500);
         return;
      }

      // Custom Logic for Fresa Delight
      if (base === 'Fresa' && fruit === 'Cereza Roja' && topping === 'Chocolate') {
         setTimeout(() => {
            // @ts-ignore
            setGeneratedFlavor({
               name: 'Fresa Delight',
               description: 'La frescura de la fresa elevada con cerezas y el toque decadente del chocolate.',
               image: '/fresa.png'
            });
            setLoading(false);
         }, 1500);
         return;
      }

      // Use uploaded photo if available for generic result
      const resultImage = photo || '/helados-bon.jpg';

      try {
         // @ts-ignore
         const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
         const genAI = new GoogleGenerativeAI(apiKey);
         const model = genAI.getGenerativeModel({ model: "gemini-pro" });

         const prompt = `Crea un nombre creativo y una descripción apetitosa (máximo 40 palabras) para un nuevo sabor de helado Helados Bon que combina: Base de ${base}, Fruta ${fruit} y Topping de ${topping}. La respuesta debe ser un JSON con los campos "name" y "description".`;

         const result = await model.generateContent(prompt);
         const response = await result.response;
         const text = response.text();
         // Simple parsing assuming JSON is returned, might need robust parsing in prod
         const cleanText = text.replace(/```json/g, '').replace(/```/g, '');
         const data = JSON.parse(cleanText);

         setGeneratedFlavor({ ...data, image: resultImage });
      } catch (error) {
         console.error("Error generating flavor:", error);
         setGeneratedFlavor({
            name: "Experimento Fallido",
            description: "Hubo un error en el laboratorio. ¡Inténtalo de nuevo!",
            image: resultImage
         });
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="bg-[#FEFBF2] min-h-screen pb-24 overflow-y-auto">
         <div className="px-6 pt-12 pb-6 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-3 bg-white text-yellow-500 rounded-full shadow-lg"><ChevronLeft size={24} /></button>
            <h1 className="text-xl font-black text-gray-900 italic uppercase">Bon Lab</h1>
            <div className="w-12"></div>
         </div>

         <div className="px-6">
            <div className="bg-yellow-400 rounded-[3rem] p-8 mb-8 text-black shadow-xl relative overflow-hidden">
               <Sparkles className="absolute top-4 right-4 text-white/40" size={60} />
               <h2 className="text-3xl font-black italic uppercase leading-none mb-4">Crea tu Mezcla</h2>
               <p className="text-xs font-bold opacity-70 italic max-w-[200px]">Combina ingredientes o sube tu foto y deja que la IA de Bon diseñe tu obra maestra.</p>
            </div>

            <div className="space-y-6 mb-12">
               {/* Photo Upload Section */}
               <div className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-dashed border-gray-200 text-center">
                  <input
                     type="file"
                     accept="image/*"
                     ref={fileInputRef}
                     onChange={handlePhotoUpload}
                     className="hidden"
                  />

                  {photo ? (
                     <div className="relative">
                        <img src={photo} alt="Preview" className="w-full h-48 object-cover rounded-2xl mb-4" />
                        <button
                           onClick={() => setPhoto(null)}
                           className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                           <X size={16} />
                        </button>
                        <p className="text-xs font-black italic text-green-600 uppercase">¡Foto lista!</p>
                     </div>
                  ) : (
                     <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer py-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                           <CameraIcon size={32} />
                        </div>
                        <h3 className="text-sm font-black italic text-gray-900 uppercase mb-1">Sube una foto</h3>
                        <p className="text-[10px] text-gray-500 font-medium italic mb-2 leading-relaxed max-w-[240px] mx-auto">
                           ¡Tu Creatividad tiene Premio! 🏆 Diseña el mix más original, sube de nivel en el ranking y desbloquea cupones exclusivos cada mes
                        </p>
                     </div>
                  )}
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Base</label>
                  <div className="flex flex-wrap gap-2">
                     {LAB_OPTIONS.bases.map(b => (
                        <button key={b} onClick={() => setBase(b)} className={`px-4 py-2 rounded-xl text-xs font-black italic transition-all ${base === b ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-900 border border-gray-100'}`}>
                           {b}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Fruta</label>
                  <div className="flex flex-wrap gap-2">
                     {LAB_OPTIONS.fruits.map(f => (
                        <button key={f} onClick={() => setFruit(f)} className={`px-4 py-2 rounded-xl text-xs font-black italic transition-all ${fruit === f ? 'bg-orange-400 text-white shadow-lg' : 'bg-white text-gray-900 border border-gray-100'}`}>
                           {f}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block italic">Topping</label>
                  <div className="flex flex-wrap gap-2">
                     {LAB_OPTIONS.toppings.map(t => (
                        <button key={t} onClick={() => setTopping(t)} className={`px-4 py-2 rounded-xl text-xs font-black italic transition-all ${topping === t ? 'bg-purple-500 text-white shadow-lg' : 'bg-white text-gray-900 border border-gray-100'}`}>
                           {t}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <button
               onClick={generateFlavor}
               disabled={!base || !fruit || !topping || loading}
               className={`w-full py-6 rounded-[2.5rem] font-black uppercase italic text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${(!base || !fruit || !topping) ? 'bg-gray-200 text-gray-400' : 'bg-black text-white active:scale-95'}`}
            >
               {loading ? <div className="animate-spin text-white"><RotateCcw size={24} /></div> : <><Sparkles size={24} /> Crear Sabor</>}
            </button>

            {generatedFlavor && (
               <div className="mt-12 bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-yellow-400 animate-in slide-in-from-bottom fade-in duration-500">
                  <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg mb-6 mx-auto overflow-hidden">
                     {(generatedFlavor as any).image ? <img src={(generatedFlavor as any).image} className="w-full h-full object-cover" /> : <Award size={32} />}
                  </div>
                  <h3 className="text-2xl font-black italic text-center uppercase mb-4 leading-tight">{generatedFlavor.name}</h3>
                  <p className="text-sm text-gray-500 font-medium italic text-center mb-8">{generatedFlavor.description}</p>
                  <button onClick={() => navigate('/copa')} className="w-full bg-yellow-400 text-black font-black py-4 rounded-[2rem] uppercase italic shadow-lg">
                     Guardar en Mi Galería
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

const CopaHub: React.FC = () => {
   const navigate = useNavigate();
   const [menuOpen, setMenuOpen] = useState(false);

   return (
      <div className="bg-[#FEFBF2] min-h-screen pb-24 overflow-y-auto hide-scrollbar">
         <FeatureSwitcher isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
         <div className="px-6 pt-10 pb-4 flex items-center justify-between">
            <button onClick={() => setMenuOpen(true)} className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center text-yellow-500">
               <Menu size={24} />
            </button>
            <h1 className="text-xl font-black text-gray-900 italic tracking-tighter uppercase flex items-center gap-2">
               <img src="/helados-bon.jpg" alt="Logo" className="w-32 h-32 object-contain" />
               Community Cup
            </h1>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-yellow-500 shadow-lg">
               <Trophy size={24} />
            </button>
         </div>

         <div className="p-6">
            <div className="bg-yellow-400 rounded-[3rem] p-10 text-black shadow-xl relative overflow-hidden mb-12">
               <h2 className="text-4xl font-black italic leading-[0.9] mb-4 uppercase">¿Cual es tu mezcla ideal?</h2>
               <p className="text-xs font-bold opacity-60 italic mb-8 max-w-[180px]">Vota por tus favoritos o crea tu propia combinación en el Bon Lab.</p>
               <button onClick={() => navigate('/copa/lab')} className="bg-black text-white font-black px-8 py-4 rounded-full text-xs uppercase italic tracking-widest shadow-xl active:scale-95 transition-all">
                  Ir al Laboratorio
               </button>
               <Sparkles className="absolute top-6 right-6 text-black/20" size={80} />
            </div>

            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl mb-12 group">
               <img src="/pistacho-1.png" className="w-full h-96 object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-10">
                  <div className="bg-green-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest self-start mb-4 shadow-lg">
                     Sabor del Mes
                  </div>
                  <h3 className="text-3xl font-black italic text-white leading-none mb-4 uppercase">¡Pistacho Remix!</h3>
                  <p className="text-sm font-medium text-white/90 italic leading-relaxed max-w-lg mb-6">
                     ¿Crees que el Pistacho es un sabor serio? ¡Piénsalo dos veces! Entra al Lab, mézclalo con bizcocho, ahógalo en chocolate y dale tu toque personal. ¡Demuestra que el verde combina con todo y sube tu creación al ranking!
                  </p>
                  <button onClick={() => navigate('/copa/lab')} className="bg-white text-green-700 font-black px-8 py-4 rounded-full text-xs uppercase italic shadow-xl self-start hover:scale-105 transition-transform">
                     Crear mi Remix
                  </button>
               </div>
            </div>

            <h3 className="text-2xl font-black italic text-gray-900 mb-6 uppercase tracking-tighter">Finalistas del Mes</h3>
            <div className="space-y-8">
               {FINALISTS.map(f => (
                  <div key={f.id} className="bg-white rounded-[3.5rem] overflow-hidden shadow-2xl border border-gray-50 flex flex-col">
                     <div className="relative h-64">
                        <img src={f.image} className="w-full h-full object-cover" />
                        <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] italic shadow-lg">
                           {f.rank}
                        </div>
                     </div>
                     <div className="p-8">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-2xl font-black italic text-gray-900 leading-tight uppercase">{f.name}</h4>
                           <div className="flex items-center gap-1 text-red-600">
                              <Heart size={20} fill="currentColor" />
                           </div>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase italic mb-4">Por {f.author}</p>
                        <p className="text-xs text-gray-500 font-medium italic mb-8 leading-relaxed">{f.description}</p>
                        <button onClick={() => navigate('/copa/success')} className="w-full bg-red-600 text-white font-black py-5 rounded-[2rem] text-sm uppercase italic shadow-xl shadow-red-100">
                           Votar por esta mezcla
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

const SuccessVoting: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-red-600 min-h-screen flex flex-col items-center justify-center p-12 text-center">
         <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-red-600 mb-8 shadow-2xl animate-bounce">
            <CheckCircle2 size={64} />
         </div>
         <h2 className="text-5xl font-black italic text-white tracking-tighter leading-none mb-6 uppercase">¡Gracias por Votar!</h2>
         <p className="text-white/80 font-medium italic mb-12">Tu voto ha sido registrado con éxito. ¡Estás más cerca de que tu mezcla se haga realidad!</p>
         <button onClick={() => navigate('/copa')} className="w-full bg-yellow-400 text-black font-black py-6 rounded-[2.5rem] uppercase italic shadow-xl">
            Volver a la Copa
         </button>
      </div>
   );
};

// --- SECTION: TRIVIA VIEWS ---

const TriviaDashboard: React.FC = () => {
   const navigate = useNavigate();
   const [menuOpen, setMenuOpen] = useState(false);

   return (
      <div className="bg-red-600 min-h-screen pb-24 overflow-y-auto hide-scrollbar">
         <FeatureSwitcher isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
         <div className="px-6 pt-10 pb-6 flex items-center justify-between text-white">
            <button onClick={() => setMenuOpen(true)} className="w-12 h-12 rounded-full overflow-hidden bg-white/20 backdrop-blur-md flex items-center justify-center">
               <Menu size={24} />
            </button>
            <h1 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-2">
               <img src="/helados-bon.jpg" alt="Logo" className="w-32 h-32 object-contain bg-white rounded-full p-2" />
               Trivia Bon
            </h1>
            <button onClick={() => navigate('/trivia/history')} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
               <RotateCcw size={24} />
            </button>
         </div>

         <div className="p-6">
            <div className="bg-white rounded-[3rem] p-10 text-gray-900 shadow-2xl mb-12 relative overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Puntos de Trivia</p>
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center"><Zap size={24} fill="currentColor" /></div>
               </div>
               <h3 className="text-5xl font-black italic text-red-600 leading-none mb-2">1,250</h3>
               <p className="text-xs font-bold text-gray-400 uppercase italic">¡Estatus de Maestro!</p>
            </div>

            <h4 className="text-xl font-black italic text-white mb-6 uppercase tracking-tighter text-center">Categorías</h4>
            <div className="flex justify-center">
               {TRIVIA_CATEGORIES.map(cat => (
                  <div
                     key={cat.id}
                     onClick={() => navigate(`/trivia/start/${cat.id}`)}
                     className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl group active:scale-[0.98] transition-all w-full max-w-sm"
                  >
                     <div className="h-48 overflow-hidden">
                        <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     </div>
                     <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-yellow-400 rounded-[2rem] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg -mt-14 relative z-10 border-4 border-white">
                           {cat.icon}
                        </div>
                        <h5 className="text-2xl font-black italic text-gray-900 uppercase leading-none mb-2">{cat.name}</h5>
                        <p className="text-sm text-gray-400 font-bold italic uppercase">{cat.description}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

const TriviaStart: React.FC = () => {
   const navigate = useNavigate();
   const { categoryId } = useParams();
   const category = TRIVIA_CATEGORIES.find(c => c.id === categoryId);

   if (!category) return null;

   return (
      <div className="bg-red-600 min-h-screen flex flex-col text-white">
         <div className="relative h-[40vh]">
            <img src={category.image} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-red-600/40 to-transparent"></div>
            <button onClick={() => navigate(-1)} className="absolute top-10 left-6 p-3 bg-white/20 backdrop-blur-md rounded-full"><ChevronLeft /></button>
         </div>

         <div className="p-10 flex-1 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-yellow-400 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-2xl">
               {category.icon}
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-4 leading-none">{category.name}</h1>
            <p className="text-lg font-medium italic opacity-80 mb-12">{category.description}</p>

            <div className="w-full space-y-4 mt-auto">
               <button onClick={() => navigate(`/trivia/game/${categoryId}`)} className="w-full bg-white text-red-600 font-black py-6 rounded-[2.5rem] text-xl uppercase italic shadow-2xl">
                  ¡Empezar!
               </button>
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Gana hasta 100 puntos por partida</p>
            </div>
         </div>
      </div>
   );
};

const TriviaGame: React.FC = () => {
   const navigate = useNavigate();
   const [currentIdx, setCurrentIdx] = useState(0);
   const [selected, setSelected] = useState<number | null>(null);
   const question = TRIVIA_QUESTIONS[currentIdx];

   const handleNext = () => {
      if (currentIdx < TRIVIA_QUESTIONS.length - 1) {
         setCurrentIdx(currentIdx + 1);
         setSelected(null);
      } else {
         navigate('/trivia/result');
      }
   };

   if (!question) return null;

   return (
      <div className="bg-[#FEFBF2] min-h-screen flex flex-col p-8 overflow-y-auto">
         <div className="flex justify-between items-center mb-10">
            <div className="flex gap-1">
               {TRIVIA_QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all ${i === currentIdx ? 'w-10 bg-red-600' : 'w-4 bg-red-100'}`}></div>
               ))}
            </div>
            <button onClick={() => navigate('/trivia')} className="p-2 bg-gray-100 rounded-full text-gray-400"><X size={20} /></button>
         </div>

         <div className="flex-1">
            {question.image && <img src={question.image} className="w-full h-48 object-cover rounded-[2.5rem] mb-10 shadow-xl" />}
            <h2 className="text-3xl font-black italic text-gray-900 leading-tight mb-12 tracking-tighter uppercase">{question.question}</h2>

            <div className="space-y-4">
               {question.options.map((opt, i) => (
                  <button
                     key={i}
                     onClick={() => setSelected(i)}
                     className={`w-full text-left p-6 rounded-[2rem] font-black italic transition-all ${selected === i ? 'bg-red-600 text-white shadow-xl scale-[1.02]' : 'bg-white text-gray-900 border-2 border-gray-50 shadow-sm'}`}
                  >
                     {opt}
                  </button>
               ))}
            </div>
         </div>

         <button
            disabled={selected === null}
            onClick={handleNext}
            className={`w-full py-6 rounded-[2.5rem] font-black uppercase italic text-xl transition-all mt-10 ${selected !== null ? 'bg-yellow-400 text-black shadow-xl' : 'bg-gray-100 text-gray-300'}`}
         >
            Siguiente
         </button>
      </div>
   );
};

const TriviaResult: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-yellow-400 min-h-screen flex flex-col items-center justify-center p-8 text-center">
         <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-red-600 mb-8 shadow-2xl">
            <Trophy size={64} fill="currentColor" />
         </div>
         <h1 className="text-6xl font-black italic text-gray-900 tracking-tighter uppercase leading-[0.8] mb-4">¡Excelente!</h1>
         <p className="text-gray-900/60 font-black text-xl italic mb-12">Has completado el reto</p>

         <div className="bg-white rounded-[3rem] p-10 w-full shadow-2xl border-4 border-white mb-12">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Puntos Ganados</p>
            <h2 className="text-7xl font-black italic text-red-600 leading-none">+95</h2>
         </div>

         <button onClick={() => navigate('/trivia/complete')} className="w-full bg-red-600 text-white font-black py-6 rounded-[2.5rem] uppercase italic shadow-2xl">
            Ver Recompensas
         </button>
      </div>
   );
};

const TriviaCompletion: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-12 text-center">
         <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-10">
            <Gift size={64} />
         </div>
         <h2 className="text-4xl font-black italic text-gray-900 tracking-tighter uppercase leading-none mb-6">¡Nuevo Cupón!</h2>
         <p className="text-gray-500 font-medium italic mb-12 leading-relaxed">Por tu gran conocimiento, has desbloqueado un 10% de descuento en tu próxima compra.</p>

         <div className="bg-gray-50 border-2 border-dashed border-red-200 rounded-[2rem] p-8 w-full mb-12">
            <p className="text-[10px] font-black text-gray-300 uppercase italic mb-2 tracking-widest">Código Promo</p>
            <h3 className="text-3xl font-black italic text-red-600">BONTRIVIA23</h3>
         </div>

         <button onClick={() => navigate('/trivia')} className="w-full bg-red-600 text-white font-black py-6 rounded-[2.5rem] uppercase italic shadow-xl">
            Volver al Inicio
         </button>
      </div>
   );
};

const TriviaHistory: React.FC = () => {
   const navigate = useNavigate();
   return (
      <div className="bg-[#F9F9F9] min-h-screen pb-24 overflow-y-auto">
         <div className="p-8 pt-12 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-3 bg-white text-red-600 rounded-full shadow-lg"><ChevronLeft /></button>
            <h1 className="text-xl font-black italic uppercase text-gray-900 tracking-tighter">Mi Historial</h1>
            <div className="w-10"></div>
         </div>

         <div className="px-6 space-y-4">
            {TRIVIA_HISTORY.map(item => (
               <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${item.type === 'TBT' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-500'}`}>
                     {item.type === 'TBT' ? <RotateCcw size={24} /> : <Zap size={24} fill="currentColor" />}
                  </div>
                  <div className="flex-1">
                     <h4 className="font-black italic text-gray-900 leading-none mb-1">{item.name}</h4>
                     <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{item.date}</p>
                     {item.reward && <p className="text-[10px] font-black text-green-500 italic mt-2">🎁 {item.reward}</p>}
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-black italic text-red-600 leading-none">{item.points}</p>
                     <p className="text-[8px] font-black text-gray-300 uppercase">PTS</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

// --- App Shell ---

const App: React.FC = () => {
   const [profile, setProfile] = useState<UserProfile>(() => {
      const savedProfile = localStorage.getItem('current_user');
      if (savedProfile) return JSON.parse(savedProfile);

      // Default fallback if no user found (Guest-like or redirect to login)
      return {
         name: 'Invitado',
         email: '',
         phone: '',
         city: '',
         country: 'República Dominicana',
         avatar: 'https://ui-avatars.com/api/?name=Invitado&background=random',
         level: 1,
         points: 0,
         stampsCount: 0,
         totalStampsNeeded: 40,
         persona: UserPersona.TRADITIONAL,
         sector: '',
         triviaPoints: 0,
         password: '',
         familyMembers: [], // Default guest has empty family
         collectedStamps: [], // Guest has no stamps
         coupons: [] // Guest start with no coupons
      };
   });



   const [activeFeature, setActiveFeature] = useState<FeatureSet>(FeatureSet.FAMILIA);
   const [isAuthenticated, setIsAuthenticated] = useState(() => {
      // Check if user was logged in (optional persistence)
      return localStorage.getItem('is_authenticated') === 'true';
   });

   // Initial profile setup - check local storage user
   useEffect(() => {
      const savedProfile = localStorage.getItem('current_user');
      if (savedProfile) {
         setProfile(JSON.parse(savedProfile));
      }
   }, []);

   // MIGRATION: Ensure existing non-admin users get the welcome coupon (for users created before feature was added)
   useEffect(() => {
      // Only for logged in non-admin users who don't have coupons
      if (profile.email && profile.email !== 'josemiguel6@gmail.com' && (!profile.coupons || profile.coupons.length === 0)) {

         const newCoupon = {
            id: 'welcome-coupon',
            title: 'Bienvenido a la Familia',
            description: 'Disfruta de un 5% de descuento en tu primera compra.',
            discount: '5%',
            code: 'HOLA5BON',
            isWelcome: true
         };

         const updatedProfile = {
            ...profile,
            coupons: [newCoupon]
         };

         // Update state and local storage
         setProfile(updatedProfile);
         localStorage.setItem('current_user', JSON.stringify(updatedProfile));

         // Also update in the persisted users list
         const savedUsers = localStorage.getItem('bon_users');
         if (savedUsers) {
            const users: UserProfile[] = JSON.parse(savedUsers);
            const userIndex = users.findIndex(u => u.email === profile.email);
            if (userIndex !== -1) {
               users[userIndex] = updatedProfile;
               localStorage.setItem('bon_users', JSON.stringify(users));
            }
         }
      }
   }, [profile.email, profile.coupons?.length]);

   // DERIVED STATE: Compute stamps based on profile.collectedStamps
   // If profile has collectedStamps, use that.
   // If not (legacy admin/guest), fallback to STAMPS constant for backward compatibility (or empty if preferred).
   // For Admin 'Jose Manuel', we want him to have the default set in STAMPS constant.
   const stamps = useMemo(() => {
      if (profile.email === 'josemiguel6@gmail.com' && !profile.collectedStamps) {
         return STAMPS; // Admin keeps default stamps if not migrated
      }

      const collectedIds = profile.collectedStamps || [];
      return STAMPS.map(s => ({
         ...s,
         collected: collectedIds.includes(s.id)
      }));
   }, [profile]);

   const login = (email?: string, password?: string) => {
      setIsAuthenticated(true);
      localStorage.setItem('is_authenticated', 'true');

      // If logging in via form, find the user and set profile
      if (email && password) {
         if (email === 'josemiguel6@gmail.com') {
            // Keep default profile for admin
            // Ensure admin is saved as current user too
            const adminProfile: UserProfile = {
               name: 'José Manuel',
               email: 'josemiguel6@gmail.com',
               phone: '+1 (809) 555-0123',
               city: 'Santo Domingo',
               country: 'República Dominicana',
               avatar: '/jose manuel.webp',
               level: 12,
               points: 2450,
               stampsCount: 15,
               totalStampsNeeded: 40,
               persona: UserPersona.FAMILY,
               sector: 'Naco',
               triviaPoints: 1250,
               password: '123456',
               familyMembers: FAMILY_MEMBERS, // Admin gets full family data
               collectedStamps: STAMPS.filter(s => s.collected).map(s => s.id), // Admin gets default stamps
               coupons: [
                  {
                     id: 'community-cup-2x1',
                     title: 'Bono 2x1 Community Cup',
                     description: '¡Gracias por participar! Disfruta de un 2x1 en cualquiera de nuestros sabores por tu apoyo en la Community Cup.',
                     discount: '2x1',
                     code: 'COMMUNITY2X1',
                     expiresAt: '2023-12-31'
                  }
               ]
            };
            setProfile(adminProfile);
            localStorage.setItem('current_user', JSON.stringify(adminProfile));
         } else {
            const savedUsers = localStorage.getItem('bon_users');
            const users: UserProfile[] = savedUsers ? JSON.parse(savedUsers) : [];
            const user = users.find(u => u.email === email);
            if (user) {
               setProfile(user);
               localStorage.setItem('current_user', JSON.stringify(user));
            }
         }
      }
   };

   const logout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('is_authenticated');
      localStorage.removeItem('current_user');
   };

   const register = (user: UserProfile) => {
      // Save new user to list
      const savedUsers = localStorage.getItem('bon_users');
      const users: UserProfile[] = savedUsers ? JSON.parse(savedUsers) : [];
      users.push(user);
      localStorage.setItem('bon_users', JSON.stringify(users));

      // Login immediately
      setProfile(user);
      localStorage.setItem('current_user', JSON.stringify(user));
      setIsAuthenticated(true);
      localStorage.setItem('is_authenticated', 'true');

   };

   // --- Cart Logic ---
   const [cart, setCart] = useState<CartItem[]>([]);

   const addToCart = (item: CartItem) => {
      setCart(prev => {
         const existing = prev.find(i => i.id === item.id);
         if (existing) {
            return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
         }
         return [...prev, { ...item, quantity: 1 }];
      });
   };

   const removeFromCart = (itemId: string) => {
      setCart(prev => prev.filter(i => i.id !== itemId));
   };

   const clearCart = () => {
      setCart([]);
   };

   return (
      <AppContext.Provider value={{ profile, setProfile, stamps, currentDay: 4, activeFeature, setActiveFeature, isAuthenticated, login, logout, register, cart, addToCart, removeFromCart, clearCart }}>
         <HashRouter>
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative font-sans">
               <Routes>
                  <Route path="/login" element={<LoginView />} />
                  <Route path="/register" element={<RegisterView />} />
                  <Route path="/cart" element={<RequireAuth><CartView /></RequireAuth>} />

                  {/* Explorador Routes */}
                  <Route path="/" element={<RequireAuth><ExploradorDashboard /></RequireAuth>} />
                  <Route path="/album" element={<RequireAuth><AlbumView /></RequireAuth>} />
                  <Route path="/ranking" element={<RequireAuth><NeighborhoodRanking /></RequireAuth>} />
                  <Route path="/flavor/:id" element={<RequireAuth><FlavorDetail /></RequireAuth>} />
                  <Route path="/scan" element={<RequireAuth><div className="bg-black min-h-screen flex items-center justify-center text-white"><Camera size={100} className="animate-pulse" /></div></RequireAuth>} />
                  <Route path="/menu" element={<RequireAuth><MenuView /></RequireAuth>} />

                  {/* Community Cup Routes */}
                  <Route path="/copa" element={<RequireAuth><CopaHub /></RequireAuth>} />
                  <Route path="/copa/success" element={<RequireAuth><SuccessVoting /></RequireAuth>} />
                  <Route path="/copa/lab" element={<RequireAuth><BonLab /></RequireAuth>} />

                  {/* Trivia Routes */}
                  <Route path="/trivia" element={<RequireAuth><TriviaDashboard /></RequireAuth>} />
                  <Route path="/trivia/start/:categoryId" element={<RequireAuth><TriviaStart /></RequireAuth>} />
                  <Route path="/trivia/game/:mode" element={<RequireAuth><TriviaGame /></RequireAuth>} />
                  <Route path="/trivia/result" element={<RequireAuth><TriviaResult /></RequireAuth>} />
                  <Route path="/trivia/complete" element={<RequireAuth><TriviaCompletion /></RequireAuth>} />
                  <Route path="/trivia/history" element={<RequireAuth><TriviaHistory /></RequireAuth>} />

                  {/* Family Circle Routes */}
                  <Route path="/familia" element={<RequireAuth><FamilyDashboard /></RequireAuth>} />
                  <Route path="/familia/invite" element={<RequireAuth><InviteMember /></RequireAuth>} />
                  <Route path="/familia/invite/success" element={<RequireAuth><InviteSuccess /></RequireAuth>} />
                  <Route path="/familia/goals" element={<RequireAuth><FamilyGoalDetail /></RequireAuth>} />
                  <Route path="/familia/earned" element={<RequireAuth><FamilyPointsSuccess /></RequireAuth>} />

                  {/* Profile Routes */}
                  <Route path="/profile" element={<RequireAuth><ProfileView /></RequireAuth>} />
                  <Route path="/redeem" element={<RequireAuth><RedeemPointsView /></RequireAuth>} />
                  <Route path="/promos" element={<RequireAuth><PromosView coupons={profile.coupons} /></RequireAuth>} />
               </Routes>
               <BottomNav />
            </div>
         </HashRouter>
      </AppContext.Provider>
   );
};

export default App;
