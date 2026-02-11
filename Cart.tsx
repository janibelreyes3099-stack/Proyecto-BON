
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useApp } from './App';

export const CartView: React.FC = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, clearCart, profile } = useApp();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = total * 0.18; // ITBIS 18%
    const grandTotal = total + tax;

    // Apply Coupon discount if applicable
    // For simplicity, let's say "Bono 2x1" is handled manually or just a visual cue for now
    // Or if we implemented coupon logic, we'd calculate it here.
    // Given the prompt "enable cart", basic functionality is key.

    const handleCheckout = () => {
        if (cart.length === 0) return;

        // Mock checkout process
        const confirm = window.confirm(`¿Confirmar pago de RD$${grandTotal.toFixed(2)}?`);
        if (confirm) {
            alert('¡Pedido realizado con éxito! Tus puntos han sido añadidos.');
            // Here we could add logic to add points to user profile
            clearCart();
            navigate('/');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="bg-[#F9F9F9] min-h-screen flex flex-col items-center justify-center p-8 text-center font-sans">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6">
                    <ShoppingBag size={64} />
                </div>
                <h2 className="text-2xl font-black italic text-gray-900 uppercase mb-2">Tu carrito está vacío</h2>
                <p className="text-gray-500 mb-8 font-medium">¡Explora nuestro menú y date un gusto!</p>
                <button
                    onClick={() => navigate('/menu')}
                    className="bg-red-600 text-white px-8 py-4 rounded-full font-black uppercase italic shadow-lg active:scale-95 transition-all"
                >
                    Ir al Menú
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#F9F9F9] min-h-screen pb-32 font-sans">
            {/* Header */}
            <div className="bg-white p-6 pt-12 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black italic uppercase text-gray-900 tracking-widest">Mi Pedido</h1>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex gap-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">🍦</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-gray-900 italic leading-tight mb-1">{item.name}</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{item.category}</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-red-600 font-black italic">RD${item.price * item.quantity}</p>
                                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                        <span className="text-xs font-black text-gray-900">Cant: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="h-full px-2 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50 space-y-3">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                        <span>Subtotal</span>
                        <span>RD${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                        <span>ITBIS (18%)</span>
                        <span>RD${tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between text-xl font-black italic text-gray-900">
                        <span>Total</span>
                        <span className="text-red-600">RD${grandTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase italic shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-4"
                    >
                        Proceder con el pago
                    </button>
                </div>
            </div>

            {/* Checkout Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 z-30 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                    onClick={handleCheckout}
                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase italic shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                    <CreditCard size={20} />
                    Proceder con el pago
                </button>
            </div>
        </div>
    );
};
