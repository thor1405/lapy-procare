import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { PrintableBillModal } from '../../components/PrintableBillModal';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Laptop,
  Wrench,
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  Printer,
  Sparkles,
} from 'lucide-react';

const DEVICE_TYPES = [
  'Laptop',
  'Desktop',
  'Gaming PC',
  'Mobile / Smartphone',
  'Gaming Console',
  'Other',
];

const PROBLEM_CATEGORIES = [
  'Display & Screen Replacement',
  'Motherboard & Chip-Level Repair',
  'Battery & Power Delivery',
  'Storage / SSD & RAM Upgrade',
  'Overheating & Thermal Servicing',
  'Operating System & Software',
  'Liquid / Water Damage Restoration',
  'Charging Port & DC Jack Repair',
  'Hinge & Body Panel Repair',
  'Console HDMI / Power / Controller',
  'General Diagnosis & Troubleshooting',
];

const ACCESSORY_OPTIONS = [
  'Charger / Power Adapter',
  'Power Cord',
  'Laptop Bag / Sleeve',
  'Wireless Mouse / Dongle',
  'Original Box',
];

export const AdminNewTicket = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success / Bill Modal State
  const [createdResult, setCreatedResult] = useState(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [showOptionalContact, setShowOptionalContact] = useState(false);

  // Form State
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: { street: '', city: '', postalCode: '' },
  });

  const [device, setDevice] = useState({
    deviceType: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    deviceAge: '',
    passcode: '',
    accessories: [],
  });

  const [problem, setProblem] = useState({
    category: 'Display & Screen Replacement',
    description: '',
  });

  const [priority, setPriority] = useState('Normal');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [diagnosticFindings, setDiagnosticFindings] = useState('');

  // Billing Toggle & Fields
  const [prepareBillNow, setPrepareBillNow] = useState(true);
  const [items, setItems] = useState([
    {
      description: 'Diagnosis & Hardware Repair Service',
      itemType: 'Service',
      quantity: 1,
      unitPrice: 499,
      amount: 499,
    },
  ]);
  const [labourCharges, setLabourCharges] = useState(499);
  const [sparePartCharges, setSparePartCharges] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0); // 0% or 18%
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(499);
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    api
      .get('/admin/technicians')
      .then((res) => {
        setTechnicians(res.data?.data?.technicians || []);
      })
      .catch(() => {});
  }, []);

  // Compute subtotal, tax, and total
  const subtotal = Math.max(
    0,
    Number(labourCharges || 0) +
      Number(sparePartCharges || 0) +
      Number(additionalCharges || 0) -
      Number(discount || 0)
  );
  const taxAmount = Math.round((subtotal * Number(taxRate || 0)) / 100);
  const grandTotal = Math.max(0, subtotal + taxAmount);
  const balanceDue = Math.max(0, grandTotal - Number(amountPaid || 0));

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        itemType: 'Spare Part',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity || 1);
      const p = Number(updated[index].unitPrice || 0);
      updated[index].amount = q * p;
    }

    setItems(updated);

    // Auto-compute spare part charges from items marked as 'Spare Part'
    const spareTotal = updated
      .filter((it) => it.itemType === 'Spare Part')
      .reduce((sum, it) => sum + Number(it.amount || 0), 0);
    setSparePartCharges(spareTotal);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    const spareTotal = updated
      .filter((it) => it.itemType === 'Spare Part')
      .reduce((sum, it) => sum + Number(it.amount || 0), 0);
    setSparePartCharges(spareTotal);
  };

  const toggleAccessory = (acc) => {
    if (device.accessories.includes(acc)) {
      setDevice({
        ...device,
        accessories: device.accessories.filter((a) => a !== acc),
      });
    } else {
      setDevice({
        ...device,
        accessories: [...device.accessories, acc],
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      toast.error('Please enter customer full name');
      return;
    }
    if (!customer.phone.trim()) {
      toast.error('Please enter customer phone number');
      return;
    }
    if (!device.brand.trim() || !device.model.trim()) {
      toast.error('Please specify device brand and model');
      return;
    }
    if (!problem.description.trim()) {
      toast.error('Please enter problem description');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      customer,
      device,
      problem,
      priority,
      status: 'Device Received',
      assignedTechnician: assignedTechnician || undefined,
      diagnosticFindings,
      billing: prepareBillNow
        ? {
            prepareBillNow: true,
            items,
            labourCharges: Number(labourCharges || 0),
            sparePartCharges: Number(sparePartCharges || 0),
            additionalCharges: Number(additionalCharges || 0),
            discount: Number(discount || 0),
            taxRate: Number(taxRate || 0),
            paymentMethod,
            amountPaid: Number(amountPaid || 0),
            paymentReference,
            paymentStatus: balanceDue <= 0 && grandTotal > 0 ? 'Paid' : amountPaid > 0 ? 'Partially Paid' : 'Unpaid',
          }
        : { prepareBillNow: false },
    };

    try {
      const res = await api.post('/admin/bookings/offline', payload);
      const data = res.data?.data;
      setCreatedResult(data);
      toast.success(`Walk-in Ticket ${data.booking.ticketId} Created!`);
      if (data.invoice) {
        setIsBillModalOpen(true);
      } else {
        navigate('/admin/bookings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create offline ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/bookings"
              className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
              Walk-in Intake & Billing
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Intake offline customer devices at counter, add repair costs & prepare instant job bill.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/bookings">
            <Button variant="outline" size="sm">
              View All Bookings
            </Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Customer Details */}
        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-[#111827]">
            <User className="w-4 h-4 text-[#4F46E5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              1. Customer Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Customer Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Ramesh Shenoy"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="e.g. 9845012345"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {showOptionalContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="customer@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Address / Locality <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customer.address.street}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        address: { ...customer.address, street: e.target.value },
                      })
                    }
                    placeholder="e.g. Vamanjoor, Mangaluru"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOptionalContact(true)}
                className="text-xs text-[#4F46E5] font-semibold hover:underline inline-flex items-center gap-1"
              >
                + Add Email or Address (Optional)
              </button>
            </div>
          )}
        </Card>

        {/* Section 2: Device Specs & Accessories */}
        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-[#111827]">
            <Laptop className="w-4 h-4 text-[#4F46E5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              2. Device Intake & Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Device Category *
              </label>
              <select
                value={device.deviceType}
                onChange={(e) => setDevice({ ...device, deviceType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                required
                value={device.brand}
                onChange={(e) => setDevice({ ...device, brand: e.target.value })}
                placeholder="e.g. Dell, HP, Lenovo, ASUS, Apple, Sony"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Model Name / Number *
              </label>
              <input
                type="text"
                required
                value={device.model}
                onChange={(e) => setDevice({ ...device, model: e.target.value })}
                placeholder="e.g. Inspiron 15 3520 / ThinkPad E14 / PS5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Serial Number / Service Tag <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={device.serialNumber}
                onChange={(e) => setDevice({ ...device, serialNumber: e.target.value })}
                placeholder="e.g. 7XYZ123"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Device PIN / Passcode <span className="text-slate-400 font-normal">(For testing)</span>
              </label>
              <input
                type="text"
                value={device.passcode}
                onChange={(e) => setDevice({ ...device, passcode: e.target.value })}
                placeholder="e.g. 1234 or Pattern L-shape"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Device Age / Condition
              </label>
              <input
                type="text"
                value={device.deviceAge}
                onChange={(e) => setDevice({ ...device, deviceAge: e.target.value })}
                placeholder="e.g. 2 Years Old / Scratched lid"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Accessories Checkboxes */}
          <div>
            <label className="block font-semibold text-slate-700 text-xs mb-2">
              Physical Accessories Handed Over by Customer:
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCESSORY_OPTIONS.map((acc) => {
                const isSelected = device.accessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {acc}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Section 3: Problem & Diagnostics */}
        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-[#111827]">
            <Wrench className="w-4 h-4 text-[#4F46E5]" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              3. Issue Reported & Diagnostics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Problem Category *
              </label>
              <select
                value={problem.category}
                onChange={(e) => setProblem({ ...problem, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                {PROBLEM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="Normal">Normal</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent / Express Repair</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Problem Symptoms / Customer Description *
              </label>
              <textarea
                required
                rows={2}
                value={problem.description}
                onChange={(e) => setProblem({ ...problem, description: e.target.value })}
                placeholder="e.g. Display backlight not turning on, fan spins at full speed, charges fine."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Counter Diagnostic Findings <span className="text-slate-400 font-normal">(Internal note)</span>
              </label>
              <input
                type="text"
                value={diagnosticFindings}
                onChange={(e) => setDiagnosticFindings(e.target.value)}
                placeholder="e.g. Motherboard power rail 3.3V missing; potential IC short"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Lead Tech
              </label>
              <select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Admin (You - Lead Tech)</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t.user?._id || t._id}>
                    {t.user?.name || t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Section 4: Cost Breakdown & Prepare Bill */}
        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-[#111827]">
              <Receipt className="w-4 h-4 text-[#4F46E5]" />
              <h2 className="text-sm font-bold uppercase tracking-wider">
                4. Cost Breakdown & Bill Preparation
              </h2>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none">
              <input
                type="checkbox"
                checked={prepareBillNow}
                onChange={(e) => setPrepareBillNow(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-indigo-700">Prepare Bill Now for Customer</span>
            </label>
          </div>

          {prepareBillNow ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Bill Line Items (Services & Spare Parts):
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddItem}
                  className="text-xs py-1"
                >
                  Add Line Item
                </Button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Description / Part
                      </label>
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="e.g. 15.6 FHD IPS Screen / Chip-level Soldering"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Item Type
                      </label>
                      <select
                        value={item.itemType}
                        onChange={(e) => handleItemChange(idx, 'itemType', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Service">Service</option>
                        <option value="Spare Part">Spare Part</option>
                        <option value="Labour">Labour</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-center"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Unit Rate (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-right"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between gap-1">
                      <div className="text-right flex-1 pr-2">
                        <span className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                          Amount
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Inputs & Calculations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Left: Charges and Tax */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Labour / Service (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={labourCharges}
                      onChange={(e) => setLabourCharges(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Spare Parts Total (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sparePartCharges}
                      onChange={(e) => setSparePartCharges(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      GST Tax
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTaxRate(0)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold ${
                          taxRate === 0
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        0% (No GST)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaxRate(18)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold ${
                          taxRate === 18
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        18% GST
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Payment collection & Totals */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-mono text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span>GST ({taxRate}%):</span>
                        <span className="font-mono text-slate-900">₹{taxAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                      <span>Grand Total:</span>
                      <span className="font-mono text-indigo-700 text-base">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Payment Inputs */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Payment Mode
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                        >
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI (GPay / PhonePe)</option>
                          <option value="Card">Card</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Amount Received (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={grandTotal}
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setAmountPaid(grandTotal)}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        Full Paid (₹{grandTotal})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountPaid(500)}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        ₹500 Adv
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountPaid(0)}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Unpaid (₹0)
                      </button>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-[11px]">
                      <span className="text-slate-600">Balance Due:</span>
                      <span
                        className={`font-mono font-bold ${
                          balanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {balanceDue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : 'Settled in Full'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <span className="text-indigo-600 font-semibold">ℹ️ Intake Only Mode:</span>
              <span>
                Ticket will be created without an immediate bill. You can add items & bill the
                customer anytime later from the bookings list.
              </span>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <Link to="/admin/bookings">
            <Button type="button" variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={Printer}
          >
            {prepareBillNow ? 'Create Ticket & Generate Bill' : 'Create Walk-in Ticket'}
          </Button>
        </div>
      </form>

      {/* Bill & Receipt Modal */}
      {createdResult?.invoice && (
        <PrintableBillModal
          isOpen={isBillModalOpen}
          onClose={() => {
            setIsBillModalOpen(false);
            navigate('/admin/bookings');
          }}
          invoice={createdResult.invoice}
          booking={createdResult.booking}
        />
      )}
    </div>
  );
};
