'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../cart-context';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-4">
          <Link href="/shop" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <ShoppingCart className="h-12 w-12 text-slate-900 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-600 mb-8">Add some products to get started!</p>
              <Link href="/shop/catalog">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 h-auto rounded-xl font-medium">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Items */}
              <div className="space-y-4">
                {cart.map((item) => (
                   <div key={`${item.id}-${item.variantId}`} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                       <div className="flex-1">
                         <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                         <p className="text-slate-600">${(item.price / 100).toFixed(2)} each</p>
                       </div>

                       <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => updateQuantity(item.id, item.variantId, Math.max(1, item.quantity - 1))}
                             className="hover:bg-slate-200 rounded-lg"
                           >
                             <Minus className="h-4 w-4 text-slate-600" />
                           </Button>
                           <Input
                             type="number"
                             value={item.quantity}
                             onChange={(e) => updateQuantity(item.id, item.variantId, parseInt(e.target.value) || 1)}
                             className="w-12 text-center border-0 bg-transparent font-medium"
                             min="1"
                           />
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                             className="hover:bg-slate-200 rounded-lg"
                           >
                             <Plus className="h-4 w-4 text-slate-600" />
                           </Button>
                         </div>

                         <div className="w-24 text-right">
                           <p className="text-sm text-slate-600 mb-1">Subtotal</p>
                           <p className="text-lg font-bold text-slate-900">${(item.price * item.quantity / 100).toFixed(2)}</p>
                         </div>

                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => removeFromCart(item.id, item.variantId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals & Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="max-w-sm ml-auto mb-8 pb-8 border-b border-slate-200">
                  <div className="flex justify-between mb-4 text-slate-600">
                    <span>Subtotal</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4 text-slate-600">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total</span>
                    <span>${(total / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <Button
                    onClick={clearCart}
                    className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 px-8 py-3 h-auto rounded-xl font-medium"
                  >
                    Clear Cart
                  </Button>
                  <Link href="/shop/order" className="flex-1 sm:flex-none">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white w-full px-8 py-3 h-auto rounded-xl font-medium">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="text-center pt-4">
                <Link href="/shop/catalog">
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl">
                    ← Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
