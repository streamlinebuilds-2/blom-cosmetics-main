import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cartStore, CartState, formatPrice } from '../../lib/cart';

export const CartWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartState, setCartState] = useState<CartState>(cartStore.getState());
  const [showCart, setShowCart] = useState(false);
  const scrollYRef = React.useRef<number>(0);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(setCartState);
    return unsubscribe;
  }, []);

  // Handle cart visibility animation
  useEffect(() => {
    if (cartState.items.length > 0) {
      setShowCart(true);
    } else {
      // Delay hiding to allow for smooth animation
      const timer = setTimeout(() => {
        setShowCart(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [cartState.items.length]);

  // Lock page scroll when cart is open
  useEffect(() => {
    const html = document.documentElement;
    // compute scrollbar compensation to avoid layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (isOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset;
      html.classList.add('no-scroll');
      document.body.classList.add('no-scroll');
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      html.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      document.body.style.paddingRight = '';
      // Ensure we remain at the same position
      window.scrollTo(0, scrollYRef.current);
    }
    return () => {
      html.classList.remove('no-scroll');
      document.body.classList.remove('no-scroll');
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    cartStore.updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    cartStore.removeItem(itemId);
  };

  const recommendedProducts = [
    {
      id: 'rec1',
      name: 'Nail File Set',
      price: 89,
      image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: 'rec2',
      name: 'Cuticle Oil',
      price: 129,
      image: 'https://images.pexels.com/photos/3997992/pexels-photo-3997992.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  const addRecommendedToCart = (product: any) => {
    cartStore.addItem({
      id: `item_${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  return (
    <>
      {/* Cart FAB - Only show when cart has items */}
      {showCart && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-pink-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 ${
            cartState.items.length > 0 ? 'animate-bounce-in' : 'animate-fade-out'
          }`}
        >
          <ShoppingCart className="h-6 w-6 text-white" />
        </button>
      )}
      {/* Triggerable from header cart button */}
      <div id="cart-drawer-trigger" hidden onClick={() => setIsOpen(true)} />

      {/* Cart Drawer with smooth open/close */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            isOpen ? 'bg-black/40' : 'bg-black/0'
          } backdrop-blur-[2px]`}
          onClick={() => setIsOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 overscroll-contain">
              {cartState.items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some products to get started</p>
                  <Button onClick={() => { setIsOpen(false); window.location.href = '/shop'; }}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-8">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.variant && (
                            <p className="text-sm text-gray-500">{item.variant.title}</p>
                          )}
                          <p className="text-pink-400 font-bold">{formatPrice(item.price)}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 hover:bg-red-100 rounded text-red-500 ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Products */}
                  <div className="mb-8">
                    <h3 className="font-medium mb-4">Recommended for you</h3>
                    <div className="space-y-3">
                      {recommendedProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-pink-400 font-bold text-sm">{formatPrice(product.price)}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addRecommendedToCart(product)}
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {cartState.items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cartState.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{cartState.shipping === 0 ? 'Free' : formatPrice(cartState.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(cartState.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(cartState.total)}</span>
                  </div>
                </div>
                
                {cartState.subtotal < 500 && (
                  <p className="text-sm text-gray-600 text-center">
                    Add {formatPrice(1500 - cartState.subtotal)} more for free shipping!
                  </p>
                )}

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/checkout';
                    }}
                  >
                    Checkout
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => { setIsOpen(false); window.location.href = '/shop'; }}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
};
