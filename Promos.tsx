import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Tag } from 'lucide-react';

import { Coupon } from './types';

export const PromosView: React.FC<{ coupons?: Coupon[] }> = ({ coupons = [] }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-[#F9F9F9] min-h-screen pb-24 font-sans">
            {/* Header */}
            <div className="bg-red-600 p-6 pt-12 sticky top-0 z-20 shadow-xl rounded-b-[2rem]">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black italic uppercase text-white tracking-widest">Ofertas</h1>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* User Coupons */}
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-red-600 relative overflow-hidden group">
                        {coupon.isWelcome && (
                            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-black px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                                Bienvenida
                            </div>
                        )}
                        <div className="flex items-start gap-4">
                            <div className="bg-yellow-400 p-3 rounded-2xl text-black">
                                <Tag size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black italic text-gray-900 leading-tight mb-2">
                                    {coupon.title}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-3">
                                    {coupon.description}
                                </p>
                                <div className="bg-gray-100 p-3 rounded-xl flex items-center justify-between border-2 border-dashed border-gray-300">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Código:</span>
                                    <span className="text-lg font-black italic text-red-600 tracking-wider">{coupon.code}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}


            </div>
        </div>
    );
};
