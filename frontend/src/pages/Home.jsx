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
  Smartphone,
  Gamepad2,
  Home as HomeIcon,
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
  PhoneCall,
  CheckCheck,
} from 'lucide-react';

const iconMap = {
  Laptop,
  Monitor,
  Smartphone,
  Gamepad2,
  Home: HomeIcon,
  HardDrive,
  Cpu,
  Terminal,
  Wifi,
  Camera,
  Building2,
  Wrench,
};

const iconBgMap = {
  'Computers & Laptops': 'bg-indigo-50 text-indigo-600',
  'Mobile & Smartphones': 'bg-blue-50 text-blue-600',
  'Gaming Consoles': 'bg-purple-50 text-purple-600',
  'Home & Doorstep': 'bg-teal-50 text-teal-600',
  'Custom PC Builds': 'bg-amber-50 text-amber-600',
  'Networking & Security': 'bg-sky-50 text-sky-600',
  'Enterprise & Business': 'bg-slate-100 text-slate-700',
  Hardware: 'bg-indigo-50 text-indigo-600',
  Upgrades: 'bg-blue-50 text-blue-600',
  'Custom PC': 'bg-teal-50 text-teal-600',
  Software: 'bg-indigo-50 text-indigo-600',
  Networking: 'bg-sky-50 text-sky-600',
  Security: 'bg-teal-50 text-teal-600',
  Enterprise: 'bg-blue-50 text-blue-600',
};

const DEFAULT_HOME_SERVICES = [
  {
    _id: 'hs-1',
    title: 'Laptop & MacBook Repair',
    slug: 'laptop-repair',
    icon: 'Laptop',
    category: 'Computers & Laptops',
    shortDescription: 'Certified chip-level motherboard diagnostics, hinge rebuilds, liquid spill ultrasonic recovery, and display screen replacement.',
    features: ['Chip-level logic board diagnostics', 'Original cracked screen replacement', 'Hinge & body fabrication', 'MacBook & Ultrabook repair'],
  },
  {
    _id: 'hs-2',
    title: 'Mobile & Smartphone Service',
    slug: 'mobile-smartphone-repair',
    icon: 'Smartphone',
    category: 'Mobile & Smartphones',
    shortDescription: 'Original OLED/AMOLED display replacement, high-capacity battery health renewal, charging ports, and micro-soldering.',
    features: ['iPhone & Android OLED screen renewal', 'High-capacity battery replacement', 'Type-C / Lightning port & mic fix', 'Water & liquid splash recovery'],
  },
  {
    _id: 'hs-3',
    title: 'Gaming Console Repair (PS5 / Xbox / Switch)',
    slug: 'gaming-console-repair',
    icon: 'Gamepad2',
    category: 'Gaming Consoles',
    shortDescription: 'PlayStation 5 liquid metal thermal refresh, HDMI 2.1 port micro-soldering, Xbox power supply repairs, and controller drift fix.',
    features: ['PS5 liquid metal & overheating service', 'HDMI 2.1 micro-soldered port replacement', 'Xbox Series X/S internal PSU repair', 'DualSense & Xbox stick drift fix'],
  },
  {
    _id: 'hs-4',
    title: 'Home & Doorstep Tech Service',
    slug: 'doorstep-home-service',
    icon: 'Home',
    category: 'Home & Doorstep',
    shortDescription: 'Certified technician arrives at your home or office in Mangaluru for on-site diagnostic check, minor repairs, or safe lab intake.',
    features: ['On-site visit across Mangaluru', 'Immediate diagnosis right in front of you', 'Minor component & software resolution', 'Complimentary safe lab transit if needed'],
  },
  {
    _id: 'hs-5',
    title: 'RAM & PCIe Gen4 SSD Upgrades',
    slug: 'ram-ssd-upgrades',
    icon: 'HardDrive',
    category: 'Computers & Laptops',
    shortDescription: 'Supercharge system speed up to 10x with high-speed PCIe Gen4 NVMe SSDs and dual-channel DDR4/DDR5 expansions with 100% data preservation.',
    features: ['100% seamless OS & data clone', 'PCIe Gen4 NVMe ultra-fast SSDs', 'DDR4 & DDR5 Dual-Channel upgrades', 'Drive health telemetry check'],
  },
  {
    _id: 'hs-6',
    title: 'Bespoke Custom PC Architecture',
    slug: 'custom-pc-builds',
    icon: 'Cpu',
    category: 'Custom PC Builds',
    shortDescription: 'Architected battle stations, AI deep learning nodes, and 3D rendering workstations built with 48-hour burn-in stress testing.',
    features: ['Positive pressure acoustic tuning', 'Surgical aesthetic cable management', 'ATX 3.0 Tier-A clean power delivery', 'Zero-bloatware low latency OS setup'],
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const [trackInput, setTrackInput] = useState('');
  const [services, setServices] = useState(DEFAULT_HOME_SERVICES);

  useEffect(() => {
    api
      .get('/services')
      .then((res) => {
        if (res.data?.data?.services && res.data.data.services.length > 0) {
          const live = res.data.data.services;
          const existingTitles = new Set(live.map((s) => s.title.toLowerCase()));
          const extra = DEFAULT_HOME_SERVICES.filter((d) => !existingTitles.has(d.title.toLowerCase()));
          setServices([...live, ...extra]);
        }
      })
      .catch(() => {});
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
          SECTION 1 — TWO-COLUMN HERO WITH 3 PILLARS & HOME SERVICE
         ======================================================== */}
      <section className="relative pt-10 sm:pt-16 lg:pt-20 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* HERO LEFT SIDE */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Small premium eyebrow label matching the poster */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>FAST • RELIABLE • PROFESSIONAL TECH REPAIR</span>
            </div>

            {/* Headline matching poster */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.12] font-['Sora']">
              Tech Problems?{' '}
              <span className="text-gradient block mt-1">
                We've Got You Covered.
              </span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-[#475569] max-w-xl leading-relaxed">
              Precision repair, upgrades, and diagnostic care for <strong>Computers</strong>, <strong>Mobiles</strong>, and <strong>Gaming Consoles</strong> — at our Vamanjoor workshop or right at your doorstep across Mangaluru.
            </p>

            {/* 3 Core Pillars Showcase Cards (Computer, Mobile, Console) */}
            <div className="grid grid-cols-3 gap-2.5 max-w-lg pt-1">
              <Link
                to="/services?category=Computers+%26+Laptops"
                className="p-3 rounded-2xl bg-white hover:bg-indigo-50/70 border border-[#E2E8F0] hover:border-indigo-300 transition-all text-center group shadow-xs hover:shadow-sm"
              >
                <div className="w-9 h-9 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Laptop className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#111827] block">Computer</span>
                <span className="text-[10px] text-[#64748B] block font-medium">Services</span>
              </Link>

              <Link
                to="/services?category=Mobile+%26+Smartphones"
                className="p-3 rounded-2xl bg-white hover:bg-blue-50/70 border border-[#E2E8F0] hover:border-blue-300 transition-all text-center group shadow-xs hover:shadow-sm"
              >
                <div className="w-9 h-9 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#111827] block">Mobile</span>
                <span className="text-[10px] text-[#64748B] block font-medium">Services</span>
              </Link>

              <Link
                to="/services?category=Gaming+Consoles"
                className="p-3 rounded-2xl bg-white hover:bg-purple-50/70 border border-[#E2E8F0] hover:border-purple-300 transition-all text-center group shadow-xs hover:shadow-sm"
              >
                <div className="w-9 h-9 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#111827] block">Console</span>
                <span className="text-[10px] text-[#64748B] block font-medium">Services</span>
              </Link>
            </div>

            {/* 4 Action Badges: Repair | Upgrade | Service | Troubleshoot */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#475569]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" /> Repair
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200">
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" /> Upgrade
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Service
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-slate-200">
                <Activity className="w-3.5 h-3.5 text-purple-600" /> Troubleshoot
              </span>
            </div>

            {/* Home Service Available Callout Pill */}
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3 text-xs max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <HomeIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#111827]">Home Service Available</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-teal-200 text-teal-800">Mangaluru</span>
                  </div>
                  <span className="text-teal-700 text-[11px] block">Repair at your doorstep — on-site or safe workshop transit.</span>
                </div>
              </div>
              <Link to="/customer/book">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 font-semibold shrink-0">
                  Book Visit
                </Button>
              </Link>
            </div>

            {/* CTA Group */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link to="/customer/book">
                <Button size="lg" variant="primary" icon={Wrench} className="shadow-md shadow-indigo-500/15">
                  Book a Repair
                </Button>
              </Link>
              <Link to="/services">
                <Button variant="secondary" size="lg">
                  Explore Services
                </Button>
              </Link>
            </div>

            {/* Secondary direct hotline links */}
            <div className="pt-1 flex flex-wrap items-center gap-5 text-xs sm:text-sm text-[#64748B]">
              <Link
                to="/track"
                className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Track Live Ticket</span>
              </Link>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <a
                href="https://wa.me/919606668315?text=Hi%20Lapy%20Procare%2C%20I%20need%20repair%20services."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-teal-600" />
                <span>WhatsApp: +91 9606668315</span>
              </a>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <a
                href="tel:+917666104889"
                className="flex items-center gap-1.5 text-[#111827] hover:text-indigo-600 font-semibold transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-indigo-600" />
                <span>+91 7666104889</span>
              </a>
            </div>
          </div>

          {/* HERO RIGHT SIDE: Realistic Multi-Device Workstation Canvas */}
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
                      <p className="text-[11px] text-[#64748B]">ESD Diagnostic Bench & On-Site Fleet</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Home Service Active
                  </span>
                </div>

                {/* 3 Real-time Device Checks in Workstation */}
                <div className="py-5 space-y-3 relative z-10">
                  {/* Item 1: Computer / Laptop */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">Computers & Laptops</p>
                        <p className="text-[10px] text-[#64748B]">Chip-Level Motherboards & Displays</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Active</span>
                  </div>

                  {/* Item 2: Mobile / Smartphone */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">Mobile Services</p>
                        <p className="text-[10px] text-[#64748B]">OLED Displays, Batteries & Ports</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Active</span>
                  </div>

                  {/* Item 3: Gaming Console */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#111827]">Console Services</p>
                        <p className="text-[10px] text-[#64748B]">PS5 Liquid Metal, HDMI & Stick Drift</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">Active</span>
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

              {/* Mobile Status Pills Grid (<640px) */}
              <div className="grid grid-cols-2 gap-2 pt-3.5 sm:hidden">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#64748B] block">Stage 01</span>
                    <span className="text-[11px] font-bold text-[#111827]">Diagnosis</span>
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#64748B] block">Status</span>
                    <span className="text-[11px] font-bold text-[#111827]">In Progress</span>
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-teal-600 block">Tested</span>
                    <span className="text-[11px] font-bold text-[#111827]">Completed</span>
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-indigo-600 block">Certified</span>
                    <span className="text-[11px] font-bold text-[#111827]">Lead Tech</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 — TRUST HIGHLIGHTS (FAST • RELIABLE • PROFESSIONAL)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Fast Turnaround</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Rapid physical diagnosis and express same-day turnaround on screens, batteries, and thermal servicing.
            </p>
          </Card>

          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Reliable Support</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Direct WhatsApp engineer consultation and live telemetry ticket status updates across Mangaluru.
            </p>
          </Card>

          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <HomeIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Home Service Option</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              No need to commute. Certified technician visits your home/office or provides safe lab pickup & return.
            </p>
          </Card>

          <Card className="text-left p-6 border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#111827] mb-1">Professional Solutions</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Chip-level micro-soldering, authentic spare components, transparent estimates, and 30-day warranty.
            </p>
          </Card>
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — THE 3 CORE PILLARS SHOWCASE (COMPUTERS, MOBILES, CONSOLES)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-left max-w-3xl space-y-3">
          <Badge status="Ready for Collection" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Core Service Specializations
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Three Dedicated Repair Labs Under One Roof
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            Equipped with stereoscopic digital microscopes, hot-air rework stations, and proprietary diagnostic rigs tailored for modern electronics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Computer & Laptop Services */}
          <Card className="p-7 border-[#E2E8F0] bg-white flex flex-col justify-between space-y-6 hover:shadow-card transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827] font-['Sora']">Computer Services</h3>
                <p className="text-xs text-[#64748B] mt-1">Laptops, MacBooks, Workstations & Desktops</p>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Chip-level logic board repairs, shorted capacitor replacement, display screen renewals, hinge rebuilds, and liquid damage ultrasonic wash.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Dell, HP, Lenovo, ASUS, Acer & Apple MacBook</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Ultra-fast PCIe Gen4 NVMe SSD & RAM expansions</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Heatsink fan deep dust & thermal paste renewal</span>
                </div>
              </div>
            </div>
            <Link to="/customer/book">
              <Button size="sm" className="w-full text-xs font-semibold" icon={ArrowRight}>
                Book Computer Service
              </Button>
            </Link>
          </Card>

          {/* Card 2: Mobile & Smartphone Services */}
          <Card className="p-7 border-[#E2E8F0] bg-white flex flex-col justify-between space-y-6 hover:shadow-card transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827] font-['Sora']">Mobile Services</h3>
                <p className="text-xs text-[#64748B] mt-1">iPhones, Samsung Galaxy, OnePlus & Android</p>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Original OLED display replacements with TrueTone preservation, certified high-capacity battery renewal, Type-C ports, and logic board micro-soldering.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Apple iPhone, Samsung, OnePlus, Pixel, Xiaomi</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Cracked OLED screen & touch digitizer repair</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Charging port, speaker, mic & water recovery</span>
                </div>
              </div>
            </div>
            <Link to="/customer/book">
              <Button size="sm" className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white" icon={ArrowRight}>
                Book Mobile Service
              </Button>
            </Link>
          </Card>

          {/* Card 3: Gaming Console Services */}
          <Card className="p-7 border-[#E2E8F0] bg-white flex flex-col justify-between space-y-6 hover:shadow-card transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#111827] font-['Sora']">Console Services</h3>
                <p className="text-xs text-[#64748B] mt-1">PlayStation 5 / PS4, Xbox Series X/S, Switch</p>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Micro-soldering damaged HDMI 2.1 ports, liquid metal thermal oxidation service, power supply (PSU) circuit fixes, and controller joystick drift repair.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>PS5 & Xbox Series X HDMI 2.1 micro-soldering</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Liquid metal refresh & overheating shutdown fix</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#334155]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>DualSense & Xbox controller stick drift overhaul</span>
                </div>
              </div>
            </div>
            <Link to="/customer/book">
              <Button size="sm" className="w-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white" icon={ArrowRight}>
                Book Console Service
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — HOME SERVICE AVAILABLE (REPAIR AT YOUR DOORSTEP)
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-teal-500/10 via-white to-indigo-500/10 border-2 border-teal-200 shadow-card relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <HomeIcon className="w-3.5 h-3.5" />
                <span>Home Service Available • Repair at Your Doorstep</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
                We Bring Professional Tech Repair Right to Your Door.
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Save the hassle of travelling through traffic. Whether you are in Vamanjoor, Kadri, Bejai, Hampankatta, Surathkal, or anywhere across Mangaluru, our certified technician comes directly to your residence or workplace.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>On-Site Diagnostics:</strong> Multimeter testing and quick fault isolation in front of you.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Minor Repairs On-Site:</strong> Software tuning, SSD upgrades, battery replacements, and Wi-Fi mesh.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Safe Lab Transit:</strong> Complex chip-level micro-soldering transported with live ticket tracking.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#334155]">
                  <CheckCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Doorstep Return:</strong> Clean handover, thorough quality testing, and digital invoice.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link to="/customer/book">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md shadow-teal-500/20">
                    Schedule Doorstep Service
                  </Button>
                </Link>
                <a
                  href="https://wa.me/919606668315?text=Hi%20Lapy%20Procare%2C%20I%20would%20like%20to%20request%20Home%20Service%20at%20my%20address%20in%20Mangaluru."
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="secondary" size="lg" icon={MessageCircle}>
                    WhatsApp: 9606668315
                  </Button>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>Doorstep Coverage Areas in Mangaluru</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                Technicians dispatched daily across:
              </p>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['Vamanjoor', 'Kulshekar', 'Kadri', 'Bejai', 'Mallikatte', 'Hampankatta', 'Lalbagh', 'Surathkal', 'Kavoor', 'Bondel', 'Derebail', 'Kottara'].map((area) => (
                  <span key={area} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-medium text-[11px]">
                    ✓ {area}
                  </span>
                ))}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-[#475569] leading-relaxed">
                💡 <em>Have multiple devices or a small office setup? We provide free diagnostics on all devices during a single home visit.</em>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — INTERACTIVE SERVICES GRID
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left max-w-3xl mb-12 space-y-3">
          <Badge status="Device Received" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Full Service Catalog
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Engineered For Reliable Performance
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            From chip-level micro-soldering and liquid spill ultrasonic cleaning to custom PC battle stations, console liquid metal, and home visits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.slice(0, 6).map((service) => {
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
          SECTION 6 — HOW IT WORKS TIMELINE
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
              title: 'Book Online or WhatsApp',
              desc: 'Select your device (Computer, Mobile, or Console) and choose Lab drop-off or Home Service.',
              color: 'text-indigo-600 bg-indigo-50',
            },
            {
              step: '02',
              title: 'Free Diagnostic Check',
              desc: 'Certified technicians run multimeter checks, isolate faulty circuits, and generate a transparent estimate.',
              color: 'text-blue-600 bg-blue-50',
            },
            {
              step: '03',
              title: 'Repair & Quality Testing',
              desc: 'Upon your digital approval, repairs proceed with genuine parts followed by a thorough 24-point bench run.',
              color: 'text-teal-600 bg-teal-50',
            },
            {
              step: '04',
              title: 'Handover & Warranty',
              desc: 'Pickup at Vamanjoor or enjoy doorstep return with full itemized bill and 30-day service warranty.',
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
          SECTION 7 — CUSTOM WORKSTATION ENGINEERING BANNER
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-indigo-50 via-white to-teal-50 border border-indigo-100 overflow-hidden shadow-card">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-700 text-xs font-bold border border-indigo-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bespoke Hardware Engineering</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
              High-Performance Custom Workstations & Precision Rigs
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed">
              Engineered for AI deep compute, 3D architectural rendering, 8K cinema color grading, and competitive esports. Every build undergoes surgical clean-bench assembly, 48-hour continuous burn-in stress testing, and zero-bloatware OS tuning in Mangaluru.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/pc-builder">
                <Button size="lg" icon={Cpu}>
                  Explore Custom Workstations
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Consult Hardware Engineer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 8 — VERIFIED TESTIMONIALS
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
              name: 'Dr. Rohan Alva',
              service: 'Doorstep Home Service • iPhone & MacBook',
              text: 'Used their Home Service option in Kadri. The engineer tested my MacBook and replaced my iPhone battery right at my residence. Phenomenal convenience without needing to step out!',
              rating: 5,
            },
            {
              name: 'Nikhil D’Souza',
              service: 'PS5 HDMI 2.1 Port & Liquid Metal Overhaul',
              text: 'My PS5 was overheating during games and the HDMI port got bent. They micro-soldered a brand new port and renewed the liquid metal. Runs whisper quiet now. 10/10!',
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
          SECTION 9 — CONTACT & WORKSHOP LOCATION
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge status="Completed" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                Service Workshop & Fleet
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
                Convenient Location in Vamanjoor & Doorstep Visits
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed">
                Visit our physical workshop near St. Joseph Engineering College on the Vamanjoor main road with free parking, or request our technician to visit your home or office.
              </p>

              <div className="space-y-3 text-xs text-[#475569]">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Near St. Joseph Engineering College, Vamanjoor, Mangaluru – 575028</span>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Call Hotline: +91 7666104889</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>WhatsApp Support: +91 9606668315 / +91 7666104889</span>
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
