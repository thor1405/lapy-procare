import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import api from '../api/client';
import {
  Wrench,
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Clock,
  Award,
  ArrowRight,
  Laptop,
  Monitor,
  HardDrive,
  Cpu,
  Terminal,
  Wifi,
  Camera,
  Building2,
  CheckCircle2,
  Star,
  MapPin,
  Sparkles,
  ChevronRight,
  Activity,
  Check,
  UserCheck,
} from 'lucide-react';

const iconMap = {
  Laptop: Laptop,
  Monitor: Monitor,
  HardDrive: HardDrive,
  Cpu: Cpu,
  Terminal: Terminal,
  Wifi: Wifi,
  Camera: Camera,
  Building2: Building2,
  Wrench: Wrench,
};

// Subtle icon background tints per service
const iconBgMap = {
  Hardware: 'bg-indigo-50 text-indigo-600',
  Upgrades: 'bg-blue-50 text-blue-600',
  'Custom PC': 'bg-teal-50 text-teal-600',
  Software: 'bg-indigo-50 text-indigo-600',
  Networking: 'bg-sky-50 text-sky-600',
  Security: 'bg-teal-50 text-teal-600',
  Enterprise: 'bg-blue-50 text-blue-600',
};

export const Home = () => {
  const navigate = useNavigate();
  const [trackInput, setTrackInput] = useState('');
  const [services, setServices] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    // Fetch live services from MongoDB
    api
      .get('/services')
      .then((res) => {
        if (res.data?.data?.services) {
          setServices(res.data.data.services);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingServices(false));
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track?ticketId=${encodeURIComponent(trackInput.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* ========================================================
          SECTION 1 — TWO-COLUMN EDITORIAL DESKTOP HERO
         ======================================================== */}
      <section className="relative pt-10 sm:pt-16 lg:pt-20 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* HERO LEFT SIDE */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small premium eyebrow label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>PROFESSIONAL COMPUTER & IT SERVICES</span>
            </div>

            {/* Large heading with selective gradient on "We've Got You Covered." */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.12] font-['Sora']">
              Technology Problems?{' '}
              <span className="text-gradient block mt-1">
                We've Got You Covered.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-[#475569] max-w-xl leading-relaxed">
              Expert laptop repairs, desktop servicing, custom PC builds, networking, and IT solutions — all in one place.
            </p>

            {/* CTA Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link to="/customer/book">
                <Button size="lg" variant="primary" icon={Wrench} className="shadow-md shadow-indigo-500/15">
                  Book a Repair
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="secondary" size="lg">
                  Explore Our Services
                </Button>
              </Link>
            </div>

            {/* Secondary smaller "Track Your Repair" action and direct hotline */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#64748B]">
              <Link
                to="/track"
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Track Your Repair</span>
              </Link>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <a
                href="https://wa.me/917666104889?text=Hi%20Lapy%20Procare%2C%20I%20have%20an%20inquiry%20regarding%20IT%20services"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-teal-600" />
                <span>WhatsApp: +91 7666104889</span>
              </a>
            </div>
          </div>

          {/* HERO RIGHT SIDE: Realistic Laptop & Desktop Repair Workstation Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Workstation Hardware Canvas Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E2E8F0] shadow-premium relative overflow-hidden">
                {/* Background circuit grid accents */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-50/50 rounded-bl-full -z-0 pointer-events-none" />

                {/* Workstation Lab Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                        Vamanjoor Workshop Active
                      </h4>
                      <p className="text-[11px] text-[#64748B]">ESD-Safe Diagnostic Bench</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Express Turnaround
                  </span>
                </div>

                {/* Central Workstation Visual Details */}
                <div className="py-6 space-y-4 relative z-10">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100/60 text-indigo-600 flex items-center justify-center">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">Hardware Benchmark Suite</p>
                        <p className="text-[11px] text-[#64748B]">Thermal & Logic Board Testing</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-600">Passed</span>
                  </div>

                  {/* Quick Ticket Tracker input inside workstation */}
                  <form onSubmit={handleTrackSubmit} className="pt-2 space-y-1.5">
                    <label className="block text-[11px] font-semibold text-[#475569]">
                      Instant Repair Ticket Telemetry:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackInput}
                        onChange={(e) => setTrackInput(e.target.value)}
                        placeholder="e.g. LPC-2026-000001"
                        className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <Button type="submit" size="sm" icon={Search} className="px-3.5 text-xs">
                        Track
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* FLOATING UI ELEMENT 1: Device Diagnosis (Top Left) */}
              <div className="absolute -top-6 -left-6 sm:-left-8 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-float flex items-center gap-3 z-20 animate-float-1 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wide">
                    Stage 01
                  </span>
                  <span className="text-xs font-bold text-[#111827]">Device Diagnosis</span>
                </div>
              </div>

              {/* FLOATING UI ELEMENT 2: Repair in Progress (Top Right) */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-float flex items-center gap-3 z-20 animate-float-2 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wide">
                    Live Status
                  </span>
                  <span className="text-xs font-bold text-[#111827]">Repair in Progress</span>
                </div>
              </div>

              {/* FLOATING UI ELEMENT 3: Service Completed (Bottom Left) */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-float flex items-center gap-3 z-20 animate-float-2 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-600 block tracking-wide">
                    Quality Tested
                  </span>
                  <span className="text-xs font-bold text-[#111827]">Service Completed</span>
                </div>
              </div>

              {/* FLOATING UI ELEMENT 4: Verified Technician (Bottom Right) */}
              <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-float flex items-center gap-3 z-20 animate-float-1 hidden sm:flex">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block tracking-wide">
                    Certified Engineer
                  </span>
                  <span className="text-xs font-bold text-[#111827]">Verified Technician</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 — TRUST HIGHLIGHTS
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Fast Service</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Rapid physical diagnosis and express same-day turnaround on common logic board & screen faults.
            </p>
          </Card>

          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Reliable Support</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Direct WhatsApp engineer consultation and live telemetry status updates on your ticket.
            </p>
          </Card>

          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Transparent Pricing</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No surprise bills. Itemized digital quotations that require your digital sign-off before repairs begin.
            </p>
          </Card>

          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Professional Solutions</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Certified hardware engineers with chip-level micro-soldering and enterprise-grade testing equipment.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — INTERACTIVE SERVICES GRID
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <Badge status="Device Received" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Precision Technology Services
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Engineered For Reliable Performance
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            From chip-level micro-soldering and liquid spill ultrasonic cleaning to custom PC battle stations and enterprise AMC contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = iconMap[service.icon] || Wrench;
            const iconBg = iconBgMap[service.category] || 'bg-indigo-50 text-indigo-600';

            return (
              <Card
                key={service._id || service.slug}
                className="flex flex-col justify-between group border-[#E2E8F0] hover:border-indigo-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#64748B] bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#111827] mb-2 group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-5 leading-relaxed line-clamp-3">
                    {service.shortDescription}
                  </p>

                  <div className="space-y-1.5 mb-6">
                    {service.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>Free Diagnosis</span>
                  </div>
                  <Link to={`/customer/book?service=${encodeURIComponent(service.title)}`}>
                    <Button size="sm" className="text-xs font-semibold" icon={ArrowRight}>
                      Book Service
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — HOW IT WORKS TIMELINE
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <Badge status="Repair Approved" className="bg-teal-50 text-teal-700 border-teal-200">
            Four-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            How Lapy Procare Works
          </h2>
          <p className="text-sm text-[#64748B]">
            Transparent repair pipeline with zero hidden surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Book Your Service',
              desc: 'Select device, symptoms, and reserve an appointment slot online or request doorstep inspection.',
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              step: '02',
              title: 'Device Diagnosis',
              desc: 'Certified technicians run multimeter checks, isolate faulty circuits, and generate an itemized quote.',
              color: 'text-blue-600 bg-blue-50',
            },
            {
              step: '03',
              title: 'Repair & Testing',
              desc: 'Upon your digital approval, repairs proceed with genuine parts followed by a 24-point quality run.',
              color: 'text-teal-600 bg-teal-50',
            },
            {
              step: '04',
              title: 'Collect Your Device',
              desc: 'Pickup at Vamanjoor or enjoy doorstep return with full GST invoice and 30-day service warranty.',
              color: 'text-indigo-600 bg-indigo-50',
            },
          ].map((item, idx) => (
            <Card key={idx} className="p-6 border-[#E2E8F0] text-left">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${item.color} inline-block mb-3`}>
                STEP {item.step}
              </span>
              <h3 className="text-base font-bold text-[#111827] mb-2">{item.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — CUSTOM PC CONFIGURATOR BANNER
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-50 via-white to-teal-50 border border-indigo-100 overflow-hidden shadow-card">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-700 text-xs font-bold border border-indigo-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Interactive Custom PC Builder</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
              Configure Your Dream Gaming Rig or Workstation
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Build high-performance gaming rigs, 3D architectural rendering workstations, and coding battle stations. Our configurator checks socket, DDR standard, and PSU load automatically.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/pc-builder">
                <Button size="lg" icon={Cpu}>
                  Launch Custom PC Builder
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Consult Rig Specialist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 6 — VERIFIED TESTIMONIALS
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left max-w-2xl mb-10 space-y-3">
          <Badge status="Ready for Collection" className="bg-teal-50 text-teal-700 border-teal-200">
            Verified Customer Reviews
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Trusted Across Mangaluru
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Prashanth Kamath',
              service: 'Laptop Motherboard Repair',
              text: 'My Dell Inspiron had severe liquid damage. Other shops told me to throw it away, but Lapy Procare replaced shorted capacitors within 24 hours. Saved me over ₹40,000!',
              rating: 5,
            },
            {
              name: 'Sneha Mendonca',
              service: 'Custom 4K Workstation Build',
              text: 'Got my video editing workstation assembled here. Cable management is surgical quality, thermals stay under 70°C, and they gave genuine GST invoices for every single part.',
              rating: 5,
            },
            {
              name: 'Vinay Hegde',
              service: 'RAM & NVMe SSD Upgrade',
              text: 'Upgraded my ThinkPad with a Gen4 NVMe SSD and 16GB RAM. Boots Windows in 7 seconds. Super transparent pricing right near SJEC Vamanjoor.',
              rating: 5,
            },
          ].map((rev, i) => (
            <Card key={i} className="flex flex-col justify-between p-6 border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#475569] italic mb-6 leading-relaxed">
                  "{rev.text}"
                </p>
              </div>
              <div className="pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-sm font-bold text-[#111827]">{rev.name}</h4>
                <p className="text-[11px] text-indigo-600 font-medium">{rev.service}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — CONTACT & WORKSHOP LOCATION
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge status="Completed" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                Service Workshop
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
                Convenient Location in Vamanjoor
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Located near St. Joseph Engineering College on the Vamanjoor main road with free parking available for easy drop-off and collection.
              </p>

              <div className="space-y-3 text-xs text-[#475569]">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Near St. Joseph Engineering College, Vamanjoor, Mangaluru – 575028</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Direct WhatsApp Line: +91 7666104889</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href="https://maps.google.com/?q=St+Joseph+Engineering+College+Vamanjoor+Mangaluru"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" size="md">
                    Open in Google Maps
                  </Button>
                </a>
                <Link to="/contact">
                  <Button size="md">Send an Inquiry</Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-slate-100 flex items-center justify-center relative">
              <iframe
                title="Lapy Procare Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0418659556834!2d74.8988775!3d12.9050085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba359c1c4f553f1%3A0xea8b98e82ef5798!2sSt%20Joseph%20Engineering%20College!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
