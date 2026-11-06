import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import api from '../api/client';
import {
  Laptop,
  Monitor,
  Smartphone,
  Gamepad2,
  Home,
  HardDrive,
  Cpu,
  Terminal,
  Wifi,
  Camera,
  Building2,
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  MapPin,
  MessageCircle,
} from 'lucide-react';

const iconMap = {
  Laptop,
  Monitor,
  Smartphone,
  Gamepad2,
  Home,
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
};

const DEFAULT_SERVICES = [
  {
    _id: 'srv-comp-1',
    title: 'Laptop & MacBook Repair',
    slug: 'laptop-repair',
    icon: 'Laptop',
    category: 'Computers & Laptops',
    shortDescription: 'Certified chip-level motherboard diagnostics, hinge rebuilds, liquid spill ultrasonic recovery, and original display replacements.',
    estimatedTime: '2 - 4 Hours',
    features: ['Chip-level logic board diagnostics', 'Original cracked screen replacement', 'Hinge & body fabrication', 'MacBook & Ultrabook repair', 'Liquid spill ultrasonic wash'],
  },
  {
    _id: 'srv-comp-2',
    title: 'Desktop & Workstation Troubleshooting',
    slug: 'desktop-repair',
    icon: 'Monitor',
    category: 'Computers & Laptops',
    shortDescription: 'Reliable troubleshooting for custom towers, power supply failures, thermal overhauls, and intermittent boot loops.',
    estimatedTime: '2 - 4 Hours',
    features: ['Power supply (SMPS) testing & replacement', 'CMOS & dual-BIOS recovery', 'Deep dust extraction & thermal renewal', 'Motherboard capacitor overhaul'],
  },
  {
    _id: 'srv-comp-3',
    title: 'RAM & PCIe Gen4 SSD Upgrades',
    slug: 'ram-ssd-upgrades',
    icon: 'HardDrive',
    category: 'Computers & Laptops',
    shortDescription: 'Supercharge system response up to 10x with high-speed PCIe Gen4 NVMe solid-state drives and dual-channel DDR4/DDR5 expansions.',
    estimatedTime: '1 - 2 Hours',
    features: ['100% data clone with zero software loss', 'PCIe Gen4 NVMe ultra-fast SSDs', 'DDR4 & DDR5 Dual-Channel upgrades', 'Drive health & SMART telemetry check'],
  },
  {
    _id: 'srv-mob-1',
    title: 'Mobile & Smartphone Screen Replacement',
    slug: 'mobile-screen-replacement',
    icon: 'Smartphone',
    category: 'Mobile & Smartphones',
    shortDescription: 'Precision replacement of cracked OLED and AMOLED displays with vivid color calibration and TrueTone preservation for iPhone and Android.',
    estimatedTime: '1 - 2 Hours',
    features: ['Original OLED & high-grade AMOLED panels', 'Apple TrueTone & biometric retention', 'Zero dead-pixel testing guarantee', 'Scratch-resistant tempered protection'],
  },
  {
    _id: 'srv-mob-2',
    title: 'Smartphone Battery & Port Repair',
    slug: 'smartphone-battery-port',
    icon: 'Smartphone',
    category: 'Mobile & Smartphones',
    shortDescription: 'Battery health replacement with original capacity cells, Type-C / Lightning port cleaning, mic & speaker voice restoration.',
    estimatedTime: '45 - 90 Minutes',
    features: ['High-capacity certified battery cells', 'Type-C & Lightning charging port fix', 'Earpiece, loud speaker & mic replacement', 'Water & splash damage recovery'],
  },
  {
    _id: 'srv-mob-3',
    title: 'Mobile Motherboard Logic Board Repair',
    slug: 'mobile-logic-board',
    icon: 'Smartphone',
    category: 'Mobile & Smartphones',
    shortDescription: 'Advanced micro-soldering under digital stereoscopic microscopes for dead phones, power management IC faults, and boot loops.',
    estimatedTime: 'Same Day - 24 Hours',
    features: ['PMIC power IC & charging IC micro-soldering', 'Dead phone recovery & boot loop fix', 'Short circuit trace repair', 'Emergency customer data preservation'],
  },
  {
    _id: 'srv-con-1',
    title: 'PlayStation 5 & PS4 Console Overhaul',
    slug: 'playstation-console-repair',
    icon: 'Gamepad2',
    category: 'Gaming Consoles',
    shortDescription: 'PS5 liquid metal thermal oxidation service, fan noise fix, optical disc drive laser alignment, and HDMI 2.1 port micro-soldering.',
    estimatedTime: '2 - 4 Hours',
    features: ['PS5 liquid metal thermal barrier refresh', 'HDMI 2.1 micro-soldered port replacement', 'Overheating & emergency shutdown fix', 'Disc drive laser lens alignment & cleaning'],
  },
  {
    _id: 'srv-con-2',
    title: 'Xbox Series X/S & Nintendo Switch Service',
    slug: 'xbox-nintendo-repair',
    icon: 'Gamepad2',
    category: 'Gaming Consoles',
    shortDescription: 'Comprehensive repair for Xbox Series X/S internal power supplies, Nintendo Switch USB-C charging ports, LCD/OLED screens, and battery swaps.',
    estimatedTime: '2 - 4 Hours',
    features: ['Xbox Series X/S power supply diagnosis', 'Nintendo Switch Type-C charging port overhaul', 'Switch battery & tactile button replacement', 'Fan & thermal heatsink deep cleaning'],
  },
  {
    _id: 'srv-con-3',
    title: 'Controller Stick Drift & Button Repair',
    slug: 'controller-stick-drift',
    icon: 'Gamepad2',
    category: 'Gaming Consoles',
    shortDescription: 'DualSense PS5, Xbox Wireless, and Joy-Con joystick drift repair using precision potentiometers and Hall-effect magnetic sensors.',
    estimatedTime: '1 - 2 Hours',
    features: ['Hall-Effect magnetic sensor upgrades', 'DualSense & Xbox thumbstick calibration', 'Bumper (L1/R1, L2/R2) micro-switch fix', 'Haptic feedback motor troubleshooting'],
  },
  {
    _id: 'srv-home-1',
    title: 'Home Tech Diagnostic & On-Site Repair',
    slug: 'home-tech-visit',
    icon: 'Home',
    category: 'Home & Doorstep',
    shortDescription: 'Certified technician visits your home or office in Mangaluru for immediate hardware testing, troubleshooting, or safe lab intake.',
    estimatedTime: 'Scheduled On-Site',
    features: ['On-site technician visit across Mangaluru', 'Immediate diagnosis right in front of you', 'Minor component & software resolution on-site', 'Safe transit to Vamanjoor lab if required'],
  },
  {
    _id: 'srv-home-2',
    title: 'Home Wi-Fi Mesh & Network Optimization',
    slug: 'home-wifi-setup',
    icon: 'Wifi',
    category: 'Home & Doorstep',
    shortDescription: 'Eliminate dead zones with high-speed Wi-Fi 6 mesh setup, router security configuration, and structured Cat6 ethernet drops.',
    estimatedTime: '2 - 4 Hours',
    features: ['Zero dead-zone whole-home coverage', 'Wi-Fi 6 mesh router configuration', 'Cat6 gigabit structured wiring', 'Smart TV, console & PC low-latency tuning'],
  },
  {
    _id: 'srv-pc-1',
    title: 'Bespoke Custom PC Architecture',
    slug: 'custom-pc-architecture',
    icon: 'Cpu',
    category: 'Custom PC Builds',
    shortDescription: 'High-end battle stations, deep learning AI compute nodes, and 3D rendering workstations built with 48-hour burn-in stress testing.',
    estimatedTime: '24 - 48 Hours',
    features: ['Positive pressure acoustic tuning', 'Surgical aesthetic cable management', 'ATX 3.0 Tier-A clean power delivery', 'Zero-bloatware low DPC latency OS setup'],
  },
  {
    _id: 'srv-sec-1',
    title: 'CCTV Security & Surveillance Setup',
    slug: 'cctv-surveillance',
    icon: 'Camera',
    category: 'Networking & Security',
    shortDescription: 'High-definition IP & HD CCTV surveillance systems with smartphone remote view for homes and commercial establishments in Mangaluru.',
    estimatedTime: '4 - 8 Hours',
    features: ['Night vision & motion detection cameras', 'NVR/DVR recording configuration', 'Live mobile stream on your phone', 'Concealed clean conduit installation'],
  },
  {
    _id: 'srv-ent-1',
    title: 'Business IT Maintenance (AMC)',
    slug: 'business-it-maintenance',
    icon: 'Building2',
    category: 'Enterprise & Business',
    shortDescription: 'Annual Maintenance Contracts (AMC) with priority SLA emergency response for schools, colleges, clinics, and offices in Mangaluru.',
    estimatedTime: 'Scheduled Monthly',
    features: ['Priority on-site technician response', 'Preventative quarterly hardware servicing', 'Asset maintenance log & audit reports', 'Periodic automated data backup verify'],
  },
];

export const Services = () => {
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [filteredServices, setFilteredServices] = useState(DEFAULT_SERVICES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'All',
    'Computers & Laptops',
    'Mobile & Smartphones',
    'Gaming Consoles',
    'Home & Doorstep',
    'Custom PC Builds',
    'Networking & Security',
    'Enterprise & Business',
  ];

  useEffect(() => {
    // Attempt fetching live dynamic services from backend
    api
      .get('/services')
      .then((res) => {
        if (res.data?.data?.services && res.data.data.services.length > 0) {
          // Normalize and combine with default high-detail entries
          const live = res.data.data.services;
          const mapLiveCategory = (cat) => {
            if (cat === 'Mobile') return 'Mobile & Smartphones';
            if (cat === 'Console') return 'Gaming Consoles';
            if (cat === 'Home Service') return 'Home & Doorstep';
            if (cat === 'Custom PC') return 'Custom PC Builds';
            if (cat === 'Hardware' || cat === 'Upgrades' || cat === 'Software') return 'Computers & Laptops';
            if (cat === 'Networking' || cat === 'Security') return 'Networking & Security';
            if (cat === 'Enterprise') return 'Enterprise & Business';
            return cat;
          };
          const mappedLive = live.map((s) => ({
            ...s,
            category: mapLiveCategory(s.category),
          }));
          // Merge avoiding duplicate titles
          const existingTitles = new Set(mappedLive.map((s) => s.title.toLowerCase()));
          const extraDefaults = DEFAULT_SERVICES.filter((d) => !existingTitles.has(d.title.toLowerCase()));
          setServices([...mappedLive, ...extraDefaults]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    let result = services;

    if (activeCategory !== 'All') {
      result = result.filter(
        (s) => s.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q)
      );
    }

    setFilteredServices(result);
  }, [activeCategory, searchQuery, services]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
          <Zap className="w-4 h-4 text-indigo-600" />
          <span>Fast • Reliable • Professional Tech Services</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] font-['Sora']">
          Tech Problems? <span className="text-gradient">We've Got You Covered.</span>
        </h1>
        <p className="text-[#64748B] text-sm sm:text-base leading-relaxed">
          Comprehensive repair, upgrades, and precision diagnostics for Computers, Mobile Phones, and Gaming Consoles — at our Vamanjoor laboratory or right at your doorstep.
        </p>
      </div>

      {/* ========================================================
          HOME SERVICE PROMINENT SHOWCASE BANNER
         ======================================================== */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-teal-500/10 via-white to-indigo-500/10 border-2 border-teal-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
              <Home className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-teal-600 text-white uppercase tracking-wider">
                  Home Service Available
                </span>
                <span className="text-xs font-semibold text-teal-800">● Repair at Your Doorstep</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#111827] font-['Sora']">
                Don't Want to Step Out? We Come to You Across Mangaluru.
              </h3>
              <p className="text-xs sm:text-sm text-[#475569] max-w-2xl leading-relaxed">
                Our certified technician visits your home or office with professional testing equipment. Minor software, display, and component fixes resolved on-site; complex micro-soldering handled with complimentary secure lab transit.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <Link to="/customer/book" className="flex-1 lg:flex-initial">
              <Button size="md" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold">
                Book Home Service
              </Button>
            </Link>
            <a
              href="https://wa.me/919606668315?text=Hi%20Lapy%20Procare%2C%20I%20would%20like%20to%20book%20Home%20Service%20at%20my%20address%20in%20Mangaluru."
              target="_blank"
              rel="noreferrer"
              className="flex-1 lg:flex-initial"
            >
              <Button variant="outline" size="md" icon={MessageCircle} className="w-full border-teal-300 text-teal-800 hover:bg-teal-50">
                WhatsApp: 9606668315
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-card">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#4F46E5] text-white shadow-sm'
                  : 'bg-slate-100 text-[#475569] hover:text-[#111827] hover:bg-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service by name or device..."
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 text-[#64748B]">
          <p className="text-base font-semibold text-[#111827] mb-1">No matching services found</p>
          <p className="text-xs">Try selecting a different category or clearing the search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const Icon = iconMap[service.icon] || Wrench;
            const iconBg = iconBgMap[service.category] || 'bg-indigo-50 text-indigo-600';

            return (
              <Card
                key={service._id || service.slug}
                className="flex flex-col justify-between group border-[#E2E8F0] hover:border-indigo-300 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#111827] mb-2 group-hover:text-indigo-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-4 leading-relaxed line-clamp-3">
                    {service.shortDescription}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Est. Turnaround: {service.estimatedTime}</span>
                  </div>

                  <div className="space-y-1.5 mb-6">
                    {service.features?.slice(0, 4).map((f, i) => (
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
                    <Button size="sm" className="font-semibold text-xs" icon={ArrowRight}>
                      Book Service
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
