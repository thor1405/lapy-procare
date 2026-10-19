import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import api from '../../api/client';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import {
  Laptop,
  Monitor,
  Gamepad2,
  Wrench,
  CheckCircle2,
  Clock,
  Upload,
  ArrowRight,
  ArrowLeft,
  MapPin,
} from 'lucide-react';

const DEVICE_OPTIONS = [
  { id: 'Laptop', label: 'Laptop', icon: Laptop, desc: 'Notebooks, MacBooks, Ultrabooks' },
  { id: 'Desktop', label: 'Desktop Tower', icon: Monitor, desc: 'Custom PCs, All-in-Ones, Towers' },
  { id: 'Gaming PC', label: 'Gaming Rig', icon: Gamepad2, desc: 'High-end gaming battle stations' },
  { id: 'Other', label: 'Other IT Equipment', icon: Wrench, desc: 'Servers, CCTV NVRs, Network gear' },
];

const PROBLEM_CATEGORIES = [
  'Device not turning on',
  'Slow performance & freezing',
  'Display or screen problems',
  'Keyboard or trackpad issues',
  'Battery & charging problems',
  'Overheating & fan noise',
  'Operating system & boot crashes',
  'Virus or malware concerns',
  'Storage & SSD upgrade request',
  'Network & Wi-Fi problems',
  'Other hardware/software fault',
];

export const BookRepair = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillService = searchParams.get('service') || '';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);

  // Form State
  const [device, setDevice] = useState({
    deviceType: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    deviceAge: '',
  });

  const [problem, setProblem] = useState({
    category: prefillService ? 'Storage & SSD upgrade request' : 'Device not turning on',
    description: prefillService ? `Inquiring for ${prefillService}` : '',
  });

  const [photos, setPhotos] = useState([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [servicePreference, setServicePreference] = useState('Drop off at service center');
  const [doorstepAddress, setDoorstepAddress] = useState({
    street: '',
    city: 'Mangaluru',
    postalCode: '575028',
  });

  const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [appointment, setAppointment] = useState({
    date: tomorrowStr(),
    timeSlot: '',
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch slot availability from backend whenever appointment date changes
  useEffect(() => {
    if (!appointment.date) return;
    setIsLoadingSlots(true);

    api
      .get(`/bookings/slots?date=${appointment.date}`)
      .then((res) => {
        if (res.data?.data?.slots) {
          setAvailableSlots(res.data.data.slots);
          const firstAvail = res.data.data.slots.find((s) => s.available);
          if (firstAvail) {
            setAppointment((prev) => ({ ...prev, timeSlot: firstAvail.timeSlot }));
          } else {
            setAppointment((prev) => ({ ...prev, timeSlot: '' }));
          }
        }
      })
      .catch(() => {
        toast.error('Unable to fetch available time slots for this date');
      })
      .finally(() => setIsLoadingSlots(false));
  }, [appointment.date]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      formData.append('photos', files[i]);
    }

    setIsUploadingPhoto(true);
    try {
      const res = await api.post('/upload/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const urls = res.data?.data?.urls || [];
      setPhotos((prev) => [...prev, ...urls]);
      toast.success('Photos uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleNext = () => {
    if (step === 2 && (!device.brand || !device.model)) {
      toast.error('Please enter the device brand and model');
      return;
    }
    if (step === 3 && !problem.description.trim()) {
      toast.error('Please briefly describe the problem symptoms');
      return;
    }
    if (step === 6 && !appointment.timeSlot) {
      toast.error('Please select an available appointment time slot');
      return;
    }
    setStep((s) => Math.min(s + 1, 7));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        device,
        problem,
        photos,
        servicePreference,
        doorstepAddress: servicePreference === 'Request doorstep service' ? doorstepAddress : undefined,
        appointment,
      };

      const res = await api.post('/bookings', payload);
      const ticketId = res.data?.data?.ticketId;

      setTicketCreated(ticketId);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success(`Booking confirmed! Ticket ID: ${ticketId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit repair booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticketCreated) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-teal-50 text-[#14B8A6] mx-auto flex items-center justify-center border border-teal-200 shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <Badge status="Ready for Collection">Confirmed & Logged in MongoDB</Badge>
          <h2 className="text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Appointment Scheduled!
          </h2>
          <p className="text-sm text-[#475569]">
            Your repair booking has been saved. Our engineers at Vamanjoor have been alerted.
          </p>
        </div>

        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-md space-y-3">
          <span className="text-xs text-[#64748B] uppercase tracking-wider block font-semibold">
            Your Tracking Ticket ID
          </span>
          <span className="text-3xl font-extrabold text-[#4F46E5] font-mono tracking-widest block">
            {ticketCreated}
          </span>
          <p className="text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
            {device.brand} {device.model} • {appointment.date} at {appointment.timeSlot}
          </p>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button onClick={() => navigate(`/track?ticketId=${ticketCreated}`)}>
            Track Live Status Now
          </Button>
          <Button variant="secondary" onClick={() => navigate('/customer/repairs')}>
            View My Repairs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Stepper Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span className="font-semibold text-[#111827]">Step {step} of 7</span>
          <span className="text-[#4F46E5] font-medium">
            {step === 1 && 'Select Device Category'}
            {step === 2 && 'Device Brand & Model'}
            {step === 3 && 'Report Issue & Symptoms'}
            {step === 4 && 'Device Condition Photos'}
            {step === 5 && 'Service Preference'}
            {step === 6 && 'Date & Slot Capacity'}
            {step === 7 && 'Review & Schedule'}
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] h-full transition-all duration-300"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Card */}
      <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-sm">
        {/* Step 1: Device Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">What kind of device needs care?</h2>
              <p className="text-xs text-[#64748B]">Select the hardware platform for our engineers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEVICE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = device.deviceType === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setDevice({ ...device, deviceType: opt.id })}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-[#4F46E5] ring-2 ring-indigo-200 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-[#4F46E5]' : 'text-slate-500'}`} />
                    <h3 className="text-sm font-bold text-[#111827] mb-1">{opt.label}</h3>
                    <p className="text-xs text-[#64748B]">{opt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Device Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">Tell us about your {device.deviceType}</h2>
              <p className="text-xs text-[#64748B]">This helps us check spare parts availability before your visit.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    value={device.brand}
                    onChange={(e) => setDevice({ ...device, brand: e.target.value })}
                    placeholder="e.g. Dell, Lenovo, HP, Apple"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Model Name / Number *
                  </label>
                  <input
                    type="text"
                    value={device.model}
                    onChange={(e) => setDevice({ ...device, model: e.target.value })}
                    placeholder="e.g. Inspiron 15 3511 or Legion 5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Serial Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={device.serialNumber}
                    onChange={(e) => setDevice({ ...device, serialNumber: e.target.value })}
                    placeholder="Found on underside sticker"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Approximate Device Age
                  </label>
                  <select
                    value={device.deviceAge}
                    onChange={(e) => setDevice({ ...device, deviceAge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">Select age range</option>
                    <option value="Under 1 year">Under 1 year (In OEM Warranty)</option>
                    <option value="1 - 3 years">1 - 3 years old</option>
                    <option value="3 - 5 years">3 - 5 years old</option>
                    <option value="Over 5 years">Over 5 years old</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Problem Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">What seems to be the problem?</h2>
              <p className="text-xs text-[#64748B]">Select the primary symptom category.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {PROBLEM_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProblem({ ...problem, category: cat })}
                      className={`text-left p-3 rounded-xl border text-xs transition-all ${
                        problem.category === cat
                          ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5] font-bold ring-1 ring-indigo-200'
                          : 'bg-slate-50/70 border-slate-200 text-[#475569] hover:bg-slate-100 hover:text-[#111827]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Detailed Issue Description *
                </label>
                <textarea
                  value={problem.description}
                  onChange={(e) => setProblem({ ...problem, description: e.target.value })}
                  rows={4}
                  placeholder="Describe when the issue started, whether there was physical or liquid contact, strange beep codes or error messages..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Upload Photos */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">Upload Device Photos (Optional)</h2>
              <p className="text-xs text-[#64748B]">
                Images of cracked screens, liquid stains, or error screen codes assist in faster parts procurement.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-[#4F46E5] rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoUpload}
                id="photo-upload"
                className="hidden"
                disabled={isUploadingPhoto}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-[#111827]">
                  {isUploadingPhoto ? 'Uploading images...' : 'Click to upload photos'}
                </span>
                <span className="text-xs text-[#64748B]">
                  PNG, JPG, or WEBP up to 5MB each (Max 5 photos)
                </span>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-100 shadow-sm"
                  >
                    <img src={url} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Service Preference */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">Service Preference</h2>
              <p className="text-xs text-[#64748B]">
                Choose whether you will drop off the computer or request doorstep service.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setServicePreference('Drop off at service center')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  servicePreference === 'Drop off at service center'
                    ? 'bg-indigo-50/70 border-[#4F46E5] ring-2 ring-indigo-200 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <MapPin className="w-6 h-6 text-[#4F46E5] mb-2" />
                <h3 className="text-sm font-bold text-[#111827]">Drop off at Service Center</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Near St. Joseph Engineering College, Vamanjoor, Mangaluru. Free parking available.
                </p>
              </div>

              <div
                onClick={() => setServicePreference('Request doorstep service')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  servicePreference === 'Request doorstep service'
                    ? 'bg-indigo-50/70 border-[#4F46E5] ring-2 ring-indigo-200 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200 hover:border-indigo-300'
                }`}
              >
                <Wrench className="w-6 h-6 text-[#4F46E5] mb-2" />
                <h3 className="text-sm font-bold text-[#111827]">Request Doorstep Service</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Technician visits your home/office in Mangaluru (subject to availability).
                </p>
              </div>
            </div>

            {servicePreference === 'Request doorstep service' && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-[#111827]">Doorstep Address in Mangaluru</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={doorstepAddress.street}
                    onChange={(e) => setDoorstepAddress({ ...doorstepAddress, street: e.target.value })}
                    placeholder="Street / Apartment / Locality"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <input
                    type="text"
                    value={doorstepAddress.postalCode}
                    onChange={(e) => setDoorstepAddress({ ...doorstepAddress, postalCode: e.target.value })}
                    placeholder="PIN Code (e.g. 575028)"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Preferred Appointment (Slot Capacity Controlled) */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">Pick an Appointment Slot</h2>
              <p className="text-xs text-[#64748B]">
                Slot availability is dynamically managed by our workshop capacity to prevent wait times.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Select Appointment Date *
                </label>
                <input
                  type="date"
                  min={tomorrowStr()}
                  value={appointment.date}
                  onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-2">
                  Available Time Slots for {appointment.date} *
                </label>

                {isLoadingSlots ? (
                  <p className="text-xs text-[#64748B] italic">Checking slot capacities...</p>
                ) : availableSlots.length === 0 ? (
                  <p className="text-xs text-rose-600">No slots available on this date. Please pick another date.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSlots.map((slot) => {
                      const isSelected = appointment.timeSlot === slot.timeSlot;
                      return (
                        <button
                          key={slot.timeSlot}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setAppointment({ ...appointment, timeSlot: slot.timeSlot })}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            !slot.available
                              ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                              : isSelected
                              ? 'bg-indigo-50 border-[#4F46E5] text-[#4F46E5] font-bold ring-2 ring-indigo-200'
                              : 'bg-white border-slate-200 text-[#111827] hover:border-indigo-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot.timeSlot}</span>
                          </div>
                          <span className={`text-[10px] ${slot.available ? 'text-teal-600 font-semibold' : 'text-slate-400'}`}>
                            {slot.available ? `${slot.remainingCapacity} slots left` : 'Fully Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review & Confirm */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#111827] mb-1">Review Booking Details</h2>
              <p className="text-xs text-[#64748B]">
                Please double-check your information before scheduling.
              </p>
            </div>

            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-[#64748B]">Device</span>
                <span className="text-[#111827] font-semibold">
                  {device.brand} {device.model} ({device.deviceType})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-[#64748B]">Problem Category</span>
                <span className="text-[#111827] font-semibold">{problem.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-[#64748B]">Symptoms</span>
                <span className="text-[#111827] max-w-xs text-right truncate font-medium">{problem.description}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-[#64748B]">Service Type</span>
                <span className="text-[#4F46E5] font-semibold">{servicePreference}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Appointment Slot</span>
                <span className="text-teal-700 font-semibold">
                  {appointment.date} at {appointment.timeSlot}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 mt-6 border-t border-[#E2E8F0] flex items-center justify-between">
          {step > 1 ? (
            <Button variant="secondary" size="sm" onClick={handleBack} icon={ArrowLeft}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <Button size="sm" onClick={handleNext} icon={ArrowRight}>
              Continue
            </Button>
          ) : (
            <Button
              size="md"
              isLoading={isSubmitting}
              onClick={handleSubmitBooking}
              icon={CheckCircle2}
            >
              Confirm & Book Repair
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
