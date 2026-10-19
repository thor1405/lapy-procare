import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  Boxes,
  Plus,
  Search,
  ArrowUpDown,
} from 'lucide-react';

export const AdminInventory = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: 'Storage',
    supplier: 'Authorized IT Supplier',
    purchasePrice: 1000,
    sellingPrice: 1500,
    quantity: 5,
    reorderThreshold: 2,
    location: 'Shelf A-1, Vamanjoor',
  });

  const [movementData, setMovementData] = useState({
    movementType: 'PURCHASE_IN',
    quantity: 1,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = () => {
    setIsLoading(true);
    let url = `/admin/inventory?`;
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (lowStockFilter) url += `lowStockOnly=true&`;

    api
      .get(url)
      .then((res) => {
        setItems(res.data?.data?.items || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [lowStockFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventory();
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.sku) {
      toast.error('Part name and SKU are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/inventory', newItem);
      toast.success('Inventory part added successfully!');
      setAddModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add inventory part');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    if (!movementData.quantity || movementData.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/admin/inventory/${selectedItem._id}/movement`, movementData);
      toast.success('Stock adjustment logged successfully!');
      setMovementModalOpen(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record movement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Spare Parts & Inventory Control
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Monitor real-time component stock, reorder thresholds, and repair allocations.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} icon={Plus} size="sm">
          Add New Spare Part
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-[#E2E8F0] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part name or SKU..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                lowStockFilter
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-slate-50 border-slate-200 text-[#475569] hover:text-[#111827]'
              }`}
            >
              ⚠️ Low Stock Only
            </button>
            <Button type="submit" size="sm">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Inventory Items Table */}
      <Card className="p-0 bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-[#111827]">No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="py-3 px-4 font-semibold">SKU</th>
                  <th className="py-3 px-4 font-semibold">Part Description</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">In Stock</th>
                  <th className="py-3 px-4 font-semibold">Buy / Sell (₹)</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {items.map((item) => {
                  const isLow = item.quantity <= item.reorderThreshold;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#4F46E5]">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4 text-[#111827] font-semibold">
                        {item.name}
                        {isLow && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-semibold">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">{item.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={isLow ? 'text-rose-600' : 'text-teal-700'}>
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#475569]">
                        ₹{item.purchasePrice} / <strong className="text-[#111827]">₹{item.sellingPrice}</strong>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.location}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setMovementData({ movementType: 'PURCHASE_IN', quantity: 1, notes: '' });
                            setMovementModalOpen(true);
                          }}
                          className="text-xs text-[#4F46E5] hover:bg-indigo-50 font-semibold"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Adjust Stock
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add New Part Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Spare Part to Inventory">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Part Name *</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g. Kingston 16GB DDR4 3200MHz RAM"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">SKU *</label>
              <input
                type="text"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. RAM-KNG-16G-D4"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Category *</label>
              <input
                type="text"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Purchase Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={newItem.purchasePrice}
                onChange={(e) => setNewItem({ ...newItem, purchasePrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Selling Price (₹)</label>
              <input
                type="number"
                min="0"
                value={newItem.sellingPrice}
                onChange={(e) => setNewItem({ ...newItem, sellingPrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Reorder Threshold</label>
              <input
                type="number"
                min="1"
                value={newItem.reorderThreshold}
                onChange={(e) => setNewItem({ ...newItem, reorderThreshold: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Add to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Movement Modal */}
      <Modal
        isOpen={movementModalOpen}
        onClose={() => setMovementModalOpen(false)}
        title={`Adjust Stock: ${selectedItem?.name}`}
      >
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between">
            <span className="text-[#64748B]">Current In-Stock Quantity:</span>
            <span className="text-[#111827] font-bold font-mono">{selectedItem?.quantity} units</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Adjustment Type *</label>
            <select
              value={movementData.movementType}
              onChange={(e) => setMovementData({ ...movementData, movementType: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              <option value="PURCHASE_IN">+ New Stock Intake (Purchase)</option>
              <option value="REPAIR_CONSUMED">- Deduct Stock (Repair Consumed)</option>
              <option value="REPAIR_RETURNED">+ Return Unused Part to Stock</option>
              <option value="DAMAGED">- Mark Damaged / Write-off</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Quantity *</label>
            <input
              type="number"
              min="1"
              value={movementData.quantity}
              onChange={(e) => setMovementData({ ...movementData, quantity: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Notes / Repair Ticket Reference</label>
            <input
              type="text"
              value={movementData.notes}
              onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
              placeholder="e.g. Consumed for LPC-2026-000001"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setMovementModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Apply Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
