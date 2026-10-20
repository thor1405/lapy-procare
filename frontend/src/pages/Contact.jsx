import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import api from '../api/client';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  ChevronDown,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How long does a typical laptop diagnosis take?',
    a: 'Preliminary diagnostic inspection is usually concluded within 2 to 4 hours. You will receive an itemized quotation outlining fault analysis, replacement parts, and labour charges before any physical work starts.',
  },
  {
    q: 'Do you charge a diagnostic fee if I decide not to proceed with the repair?',
    a: 'General initial checkups and evaluations are completely complimentary. You will receive an itemized diagnostic report and quotation prior to any repair commencement.',
  },
  {
    q: 'Are replacement screens, batteries, and keyboards original OEM?',
    a: 'Yes, we source 100% genuine OEM replacement panels, batteries, hinges, and cooling fans with up to 6 to 12 months manufacturer warranty.',
  },
  {
    q: 'Can you build a high-end PC for architectural rendering and 3D modeling?',
    a: 'Absolutely. We specialize in high-end multicore Intel/AMD workstations paired with RTX 40-series GPUs, ECC/high-frequency RAM, and liquid cooling with certified stress testing.',
  },
];

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/contact', formData);
      toast.success('Your message has been sent to Lapy Procare engineers!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge status="Device Received" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Direct Assistance
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] font-['Sora']">
          Contact Our Service Center
        </h1>
        <p className="text-[#64748B] text-sm sm:text-base">
          Have questions about hardware troubleshooting, custom PC configurations, or CCTV installations? Our technical team is ready to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#111827] border-b border-[#E2E8F0] pb-3">
              Lapy Procare Head Office
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] font-semibold block mb-0.5">Physical Workshop:</span>
                  <span className="text-[#64748B]">
                    Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028, India
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] font-semibold block mb-0.5">Telephone & WhatsApp:</span>
                  <a href="tel:+917666104889" className="text-indigo-600 font-mono font-medium hover:underline">
                    +91 7666104889
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] font-semibold block mb-0.5">Official Inquiries:</span>
                  <a href="mailto:lapyprocare@gmail.com" className="text-indigo-600 hover:underline">
                    lapyprocare@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] font-semibold block mb-0.5">Service Hours:</span>
                  <p className="text-[#64748B]">Mon - Fri: 09:00 AM - 08:00 PM</p>
                  <p className="text-[#64748B]">Saturday: 09:30 AM - 07:00 PM</p>
                  <p className="text-[#64748B]">Sunday: 10:00 AM - 02:00 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/917666104889?text=Hello%20Lapy%20Procare%2C%20I%20have%20a%20query%20regarding%20computer%20service"
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="secondary" size="md" className="w-full" icon={MessageCircle}>
                  Chat Directly on WhatsApp
                </Button>
              </a>
            </div>
          </Card>

          {/* Map Preview */}
          <div className="h-64 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-100 shadow-sm">
            <iframe
              title="Lapy Procare Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0418659556834!2d74.8988775!3d12.9050085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba359c1c4f553f1%3A0xea8b98e82ef5798!2sSt%20Joseph%20Engineering%20College!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              className="w-full h-full border-0"
              allowFullScreen=""
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Form: Inquiries into MongoDB */}
        <div className="lg:col-span-7">
          <Card className="p-6 sm:p-8 border-[#E2E8F0]">
            <h3 className="text-xl font-bold text-[#111827] mb-1">Send an Inquiry</h3>
            <p className="text-xs text-[#64748B] mb-6">
              Fill out the form below. Our service manager will get back to you within 2 business hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Shenoy"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98450 XXXXX"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Subject / Service Needed *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Laptop Hinge Repair"
                    className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Describe the Issue or Inquiry *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Provide brand, model, and symptoms of the fault..."
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl p-3.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                  required
                />
              </div>

              <Button type="submit" size="md" isLoading={isSubmitting} icon={Send} className="w-full sm:w-auto">
                Submit Message
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="max-w-3xl mx-auto space-y-6 pt-12 border-t border-[#E2E8F0]">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#111827]">Frequently Asked Questions</h2>
          <p className="text-xs text-[#64748B]">Common questions about computer repairs in Mangaluru</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#E2E8F0] rounded-2xl bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-[#111827] hover:text-indigo-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-[#475569] leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
