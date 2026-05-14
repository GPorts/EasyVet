import { useState } from 'react';
import { Plus, Search, Package, AlertTriangle, ShoppingCart, Edit2, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { useInventory } from '../hooks/useInventory';
import { formatCurrency, isExpiringSoon, isExpired } from '../utils/formatters';

const categoryOptions = [
  { value: 'medication', label: 'Medicamento' },
  { value: 'vaccine', label: 'Vacina' },
  { value: 'food', label: 'Ração/Alimento' },
  { value: 'hygiene', label: 'Higiene' },
  { value: 'accessory', label: 'Acessório' },
  { value: 'other', label: 'Outro' },
];

export default function Inventory() {
  const { loadProducts, createProduct, updateProduct, deleteProduct, quickSale, searchProducts, getLowStockProducts, getExpiringProducts, loading } = useInventory();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saleProduct, setSaleProduct] = useState(null);
  const [saleQty, setSaleQty] = useState(1);
  const [form, setForm] = useState({ name: '', category: 'medication', currentQty: '', minStock: '', price: '', expirationDate: '' });



  const filteredProducts = searchProducts(search);
  const lowStock = getLowStockProducts();
  const expiring = getExpiringProducts(30);

  const resetForm = () => {
    setForm({ name: '', category: 'medication', currentQty: '', minStock: '', price: '', expirationDate: '' });
    setEditing(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, currentQty: Number(form.currentQty), minStock: Number(form.minStock), price: Number(form.price) };
    try {
      if (editing) await updateProduct(editing.id, data);
      else await createProduct(data);
      setShowModal(false); resetForm();
    } catch (err) { 
      console.error(err);
      alert('Erro ao salvar produto: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name||'', category: p.category||'medication', currentQty: String(p.currentQty||''), minStock: String(p.minStock||''), price: String(p.price||''), expirationDate: p.expirationDate||'' });
    setShowModal(true);
  };

  const handleQuickSale = async () => {
    if (!saleProduct) return;
    await quickSale(saleProduct.id, saleQty);
    setShowSaleModal(false); setSaleProduct(null); setSaleQty(1);
  };

  const getStockStatus = (p) => {
    if ((p.currentQty||0) <= 0) return { label: 'Esgotado', variant: 'danger' };
    if ((p.currentQty||0) <= (p.minStock||0)) return { label: 'Baixo', variant: 'warning' };
    return { label: 'OK', variant: 'success' };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {(lowStock.length > 0 || expiring.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-sm font-medium">
              <AlertTriangle size={16} /> {lowStock.length} produto(s) com estoque baixo
            </div>
          )}
          {expiring.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-50 border border-warning-200 text-warning-700 text-sm font-medium">
              <AlertTriangle size={16} /> {expiring.length} próximo(s) do vencimento
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-surface-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
        </div>
        <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Novo Produto</Button>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="text-center py-12">
          <Package size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700 mb-2">Nenhum produto</h3>
          <Button icon={Plus} onClick={() => { resetForm(); setShowModal(true); }}>Cadastrar</Button>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-surface-200 shadow-sm">
          <table className="w-full">
            <thead><tr className="border-b border-surface-200">
              <th className="text-left py-4 px-5 text-xs font-semibold text-surface-500 uppercase">Produto</th>
              <th className="text-center py-4 px-5 text-xs font-semibold text-surface-500 uppercase">Qtd</th>
              <th className="text-center py-4 px-5 text-xs font-semibold text-surface-500 uppercase hidden sm:table-cell">Mín</th>
              <th className="text-right py-4 px-5 text-xs font-semibold text-surface-500 uppercase hidden md:table-cell">Preço</th>
              <th className="text-center py-4 px-5 text-xs font-semibold text-surface-500 uppercase">Status</th>
              <th className="text-right py-4 px-5 text-xs font-semibold text-surface-500 uppercase">Ações</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100">
              {filteredProducts.map(p => {
                const s = getStockStatus(p);
                return (
                  <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                    <td className="py-4 px-5"><p className="font-semibold text-sm text-surface-900">{p.name}</p><p className="text-xs text-surface-400 mt-0.5">{categoryOptions.find(c=>c.value===p.category)?.label||p.category}</p></td>
                    <td className="py-4 px-5 text-center font-bold text-sm">{p.currentQty||0}</td>
                    <td className="py-4 px-5 text-center text-sm text-surface-500 hidden sm:table-cell">{p.minStock||0}</td>
                    <td className="py-4 px-5 text-right text-sm font-medium hidden md:table-cell">{formatCurrency(p.price)}</td>
                    <td className="py-4 px-5 text-center">
                      <Badge variant={s.variant} size="xs" dot>{s.label}</Badge>
                      {isExpired(p.expirationDate) && <Badge variant="danger" size="xs" className="ml-1">Vencido</Badge>}
                      {isExpiringSoon(p.expirationDate) && !isExpired(p.expirationDate) && <Badge variant="warning" size="xs" className="ml-1">Vence breve</Badge>}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSaleProduct(p); setSaleQty(1); setShowSaleModal(true); }} className="p-2 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600" title="Venda Rápida"><ShoppingCart size={16}/></button>
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-accent-600"><Edit2 size={16}/></button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 rounded-lg hover:bg-danger-50 text-surface-400 hover:text-danger-600"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editing ? 'Editar Produto' : 'Novo Produto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required />
          <Select label="Categoria" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))} options={categoryOptions} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="Qtd" type="number" value={form.currentQty} onChange={e => setForm(f=>({...f,currentQty:e.target.value}))} required />
            <Input label="Mín." type="number" value={form.minStock} onChange={e => setForm(f=>({...f,minStock:e.target.value}))} required />
            <Input label="Preço" type="number" step="0.01" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} required />
          </div>
          <Input label="Validade" type="date" value={form.expirationDate} onChange={e => setForm(f=>({...f,expirationDate:e.target.value}))} />
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button variant="ghost" type="button" onClick={() => { setShowModal(false); resetForm(); }}>Cancelar</Button>
            <Button type="submit" loading={loading}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} title="Venda Rápida" size="sm">
        {saleProduct && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-50">
              <p className="font-bold">{saleProduct.name}</p>
              <p className="text-sm text-surface-500">Estoque: <strong>{saleProduct.currentQty}</strong> | Preço: <strong>{formatCurrency(saleProduct.price)}</strong></p>
            </div>
            <Input label="Quantidade" type="number" min="1" max={saleProduct.currentQty} value={saleQty} onChange={e => setSaleQty(Number(e.target.value))} />
            <div className="p-3 rounded-xl bg-primary-50 border border-primary-200">
              <p className="text-sm font-semibold text-primary-800">Total: {formatCurrency((saleProduct.price||0)*saleQty)}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSaleModal(false)}>Cancelar</Button>
              <Button icon={ShoppingCart} onClick={handleQuickSale} loading={loading}>Confirmar</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Excluir Produto" size="sm">
        <p className="text-surface-600 text-sm mb-6">Confirma exclusão?</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button variant="danger" onClick={async () => { await deleteProduct(deleteConfirm); setDeleteConfirm(null); }}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
