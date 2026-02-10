import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Plus, Minus, Search, Filter } from 'lucide-react'; // Assuming lucide-react is used based on App.tsx
import { MENU_CATEGORIES, MENU_ITEMS } from './constants';

export const MenuView: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0].id);
    const [cartCount, setCartCount] = useState(0); // Simple local state for demo

    const filteredItems = MENU_ITEMS.filter(item => item.category === activeCategory);

    const addToCart = () => {
        setCartCount(prev => prev + 1);
    };

    return (
        <div className="bg-[#F9F9F9] min-h-screen pb-24 overflow-y-auto font-sans">
            {/* Header */}
            <div className="bg-red-600 p-6 pt-12 sticky top-0 z-20 shadow-xl rounded-b-[2rem]">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black italic uppercase text-white tracking-widest">Menú Bon</h1>
                    <div className="relative">
                        <button className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                            <ShoppingCart size={24} />
                        </button>
                        {cartCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-bounce">
                                {cartCount}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2">
                    <input
                        type="text"
                        placeholder="Buscar tu antojo..."
                        className="w-full bg-white/10 text-white placeholder:text-white/60 border border-white/20 rounded-xl py-3 pl-12 pr-4 outline-none focus:bg-white/20 transition-all backdrop-blur-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                </div>
            </div>

            {/* Categories - Horizontal Scroll */}
            <div className="sticky top-[140px] z-10 bg-[#F9F9F9]/90 backdrop-blur-md py-4 pl-6 overflow-x-auto hide-scrollbar flex gap-4 border-b border-gray-200/50">
                {MENU_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-sm transition-all whitespace-nowrap ${activeCategory === cat.id
                            ? 'bg-red-600 text-white font-black scale-105 shadow-red-200'
                            : 'bg-white text-gray-500 font-bold border border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs uppercase tracking-wider">{cat.name}</span>
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            <div className="p-6 grid gap-6">
                <h2 className="text-lg font-black italic text-gray-900 uppercase opacity-90">
                    {MENU_CATEGORIES.find(c => c.id === activeCategory)?.name}
                </h2>

                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-[2rem] shadow-lg border border-gray-50 flex gap-4 group active:scale-[0.99] transition-transform">
                        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden relative">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">🍦</span>
                            )}
                            <div className="absolute top-2 right-2 bg-white/80 px-2 py-0.5 rounded-full text-[8px] font-black text-gray-500 backdrop-blur-sm border border-white">
                                {item.calories} cal
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="font-black text-gray-900 italic leading-tight mb-1">{item.name}</h3>
                                <p className="text-[10px] text-gray-400 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <p className="text-lg font-black text-red-600 italic">RD${item.price}</p>
                                <button
                                    onClick={addToCart}
                                    className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all font-bold"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Action (Checkout Teaser) */}
            {cartCount > 0 && (
                <div className="fixed bottom-24 left-6 right-6 z-30 animate-in slide-in-from-bottom duration-300">
                    <button className="w-full bg-gray-900 text-white py-4 rounded-3xl font-black uppercase italic shadow-2xl flex items-center justify-between px-8">
                        <span className="flex items-center gap-2">
                            <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">{cartCount}</span>
                            Ver Carrito
                        </span>
                        <span>RD${cartCount * 150} approx</span> {/* Mock total */}
                    </button>
                </div>
            )}
        </div>
    );
};
