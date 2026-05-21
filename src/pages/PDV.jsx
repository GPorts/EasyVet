import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X,
  CreditCard, Banknote, QrCode, Receipt,
  CheckCircle2, Package, AlertTriangle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useInventory } from '../hooks/useInventory';
import { useSales } from '../hooks/useSales';
import { formatCurrency } from '../utils/formatters';

const paymentMethods = [
  { value: 'cash', label: 'Dinheiro', icon: Banknote },
  { value: 'credit', label: 'Crédito', icon: CreditCard },
  { value: 'debit', label: 'Débito', icon: CreditCard },
  { value: 'pix', label: 'PIX', icon: QrCode },
];

export default function PDV() {
  const { products, searchProducts } = useInventory();
  const { finalizeSale, loading: saleLoading } = useSales();

  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [cashReceived, setCashReceived] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const searchRef = useRef(null);
  const isProcessing = useRef(false);

  // Auto focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Filter available products (only those with stock)
  const availableProducts = searchProducts(search).filter(p => (p.currentQty || 0) > 0);

  // Cart computed values
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const change = cashReceived ? Math.max(0, Number(cashReceived) - cartTotal) : 0;

  // Add product to cart
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Don't exceed stock
        if (existing.qty >= (product.currentQty || 0)) return prev;
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price || 0,
        currentQty: product.currentQty || 0,
        qty: 1,
      }];
    });
    setSearch('');
    searchRef.current?.focus();
  }, []);

  // Update quantity
  const updateQty = useCallback((productId, newQty) => {
    setCart(prev => {
      if (newQty <= 0) return prev.filter(item => item.id !== productId);
      return prev.map(item => {
        if (item.id !== productId) return item;
        const maxQty = item.currentQty;
        return { ...item, qty: Math.min(newQty, maxQty) };
      });
    });
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setCart([]);
    setCashReceived('');
  }, []);

  // Finalize sale
  const handleFinalize = async () => {
    if (cart.length === 0) return;
    // Guard against double-click / race condition
    if (isProcessing.current) return;
    isProcessing.current = true;
    setIsFinalizing(true);
    try {
      const result = await finalizeSale(cart, paymentMethod);
      setLastSale({ total: result.total, items: cart.length, method: paymentMethod });
      setShowSuccessModal(true);
      clearCart();
    } catch (err) {
      alert('Erro ao finalizar venda: ' + (err.message || 'Tente novamente'));
    } finally {
      isProcessing.current = false;
      setIsFinalizing(false);
    }
  };

  // Handle barcode/search input - auto-add exact match on Enter
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      const exactMatch = products.find(p =>
        p.name?.toLowerCase() === search.toLowerCase() ||
        p.barcode === search.trim()
      );
      if (exactMatch && (exactMatch.currentQty || 0) > 0) {
        addToCart(exactMatch);
      } else if (availableProducts.length === 1) {
        addToCart(availableProducts[0]);
      }
    }
  };

  return (
    <div className="animate-fade-in h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      {/* Left: Product Search & List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar */}
        <div className="relative mb-5">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar produto ou bipar código de barras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-surface-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm"
            autoComplete="off"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-surface-100 text-surface-400"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Package size={48} className="text-surface-300 mb-3" />
              <p className="text-surface-500 font-medium">
                {search ? 'Nenhum produto encontrado' : 'Nenhum produto com estoque disponível'}
              </p>
              {search && (
                <p className="text-surface-400 text-sm mt-1">Tente buscar por outro nome</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {availableProducts.map(product => {
                const inCart = cart.find(c => c.id === product.id);
                const isLowStock = (product.currentQty || 0) <= (product.minStock || 0);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`
                      text-left p-4 rounded-xl border-2 transition-all duration-200
                      hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]
                      ${inCart
                        ? 'border-primary-400 bg-primary-50/50 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-surface-900 truncate">{product.name}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{product.category || 'Produto'}</p>
                      </div>
                      {inCart && (
                        <Badge variant="primary" size="xs">{inCart.qty}x</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary-600">{formatCurrency(product.price)}</span>
                      <div className="flex items-center gap-1.5">
                        {isLowStock && <AlertTriangle size={12} className="text-warning-500" />}
                        <span className={`text-xs font-medium ${isLowStock ? 'text-warning-600' : 'text-surface-400'}`}>
                          {product.currentQty} un.
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart & Payment */}
      <div className="w-full lg:w-[400px] xl:w-[440px] flex flex-col">
        <Card padding={false} className="flex flex-col h-full overflow-hidden">
          {/* Cart Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <ShoppingCart size={20} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-surface-900">Carrinho</h3>
                <p className="text-xs text-surface-400">{cartItemCount} item(ns)</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-medium text-danger-500 hover:text-danger-600 px-3 py-1.5 rounded-lg hover:bg-danger-50 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart size={40} className="text-surface-300 mb-3" />
                <p className="text-surface-500 font-medium text-sm">Carrinho vazio</p>
                <p className="text-surface-400 text-xs mt-1">Clique em um produto para adicionar</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-900 truncate">{item.name}</p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {formatCurrency(item.price)} × {item.qty} = <span className="font-semibold text-surface-700">{formatCurrency(item.price * item.qty)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 rounded-lg bg-surface-200 hover:bg-surface-300 flex items-center justify-center transition-colors"
                    >
                      <Minus size={14} className="text-surface-600" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-surface-900">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      disabled={item.qty >= item.currentQty}
                      className="w-7 h-7 rounded-lg bg-surface-200 hover:bg-surface-300 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} className="text-surface-600" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-7 h-7 rounded-lg hover:bg-danger-50 flex items-center justify-center transition-colors ml-1"
                    >
                      <Trash2 size={14} className="text-danger-400 hover:text-danger-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Section */}
          {cart.length > 0 && (
            <div className="border-t border-surface-200 p-5 space-y-4 bg-surface-50/50">
              {/* Payment Methods */}
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Forma de Pagamento</p>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map(method => {
                    const isActive = paymentMethod === method.value;
                    return (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`
                          flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-medium
                          transition-all duration-200
                          ${isActive
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-400 shadow-sm'
                            : 'bg-white text-surface-500 border-2 border-surface-200 hover:border-surface-300'
                          }
                        `}
                      >
                        <method.icon size={18} strokeWidth={1.5} />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Change Calculator */}
              {paymentMethod === 'cash' && (
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-surface-500 block mb-1">Valor Recebido</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={cashReceived}
                      onChange={e => setCashReceived(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-surface-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                    />
                  </div>
                  {cashReceived && Number(cashReceived) >= cartTotal && (
                    <div className="text-right pt-4">
                      <p className="text-xs text-surface-400">Troco</p>
                      <p className="text-lg font-bold text-success-600">{formatCurrency(change)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-primary-50 border border-primary-200">
                <span className="text-sm font-semibold text-primary-700">TOTAL</span>
                <span className="text-2xl font-bold text-primary-700">{formatCurrency(cartTotal)}</span>
              </div>

              {/* Finalize Button */}
              <Button
                onClick={handleFinalize}
                loading={isFinalizing}
                disabled={cart.length === 0 || isFinalizing}
                className="w-full py-3.5 text-base"
                icon={Receipt}
              >
                Finalizar Venda
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Venda Finalizada!"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} className="text-success-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-surface-900">{formatCurrency(lastSale?.total || 0)}</p>
            <p className="text-sm text-surface-500 mt-1">
              {lastSale?.items} produto(s) • {paymentMethods.find(m => m.value === lastSale?.method)?.label || 'Dinheiro'}
            </p>
          </div>
          <p className="text-sm text-surface-500">O estoque foi atualizado automaticamente.</p>
          <Button onClick={() => { setShowSuccessModal(false); searchRef.current?.focus(); }} className="w-full">
            Nova Venda
          </Button>
        </div>
      </Modal>
    </div>
  );
}
