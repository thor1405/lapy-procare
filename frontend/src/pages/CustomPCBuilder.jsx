import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import api from '../api/client';
import { toast } from 'sonner';
import {
  Cpu,
  Layers,
  Server,
  Zap,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Gauge,
  Flame,
  HardDrive,
  Fan,
  Sliders,
  Send,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  Terminal,
  Activity,
  FileText,
  Clock,
  PhoneCall,
  ArrowUpRight,
  Check,
  Wrench,
  HelpCircle,
  Award,
} from 'lucide-react';

const WORKLOAD_TIERS = [
  {
    id: 'ai-compute',
    title: 'Deep Learning, AI Research & Neural Compute Nodes',
    badge: 'Enterprise Compute',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Terminal,
    headline: 'Massive Parallelism, Dedicated VRAM & High PCIe Lane Topologies',
    summary:
      'Engineered specifically for machine learning engineers, AI researchers, and data scientists requiring continuous local model training, fine-tuning, and low-latency inference pipelines without cloud subscription lock-in or network latency.',
    architecturePoints: [
      'Multi-GPU PCIe 5.0 topology with dedicated high-lane motherboard architectures supporting dual or quad high-bandwidth accelerator configurations.',
      'High-density DDR5 memory channels with validated sub-timing stability and ECC options supporting up to 512GB system memory.',
      'Dedicated PCIe Gen 5 NVMe direct storage arrays delivering up to 14,000 MB/s sequential reads for immediate tensor and dataset streaming.',
      'Platinum and Titanium certified ATX 3.0 power infrastructure with native dedicated 12VHPWR high-current cabling for zero thermal runaway.',
      'Pre-configured Linux LTS (Ubuntu / Debian) kernels with native CUDA, cuDNN, ROCm, Docker containerization, and Ollama optimizations.',
    ],
    software: ['PyTorch', 'TensorFlow', 'Ollama', 'Stable Diffusion', 'vLLM', 'Docker CUDA', 'JupyterLab', 'Hugging Face'],
    specsRecommendation: 'Dual / Quad NVIDIA RTX ADA & 40-Series • AMD Ryzen Threadripper / Intel Xeon • 128GB–512GB DDR5 • PCIe 5.0 NVMe RAID',
  },
  {
    id: '3d-cad',
    title: '3D Animation, Architectural Visualization & CAD Workstations',
    badge: 'Design & Engineering',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Layers,
    headline: 'High Single-Core IPC Paired with Heavy Real-Time Raytracing Engines',
    summary:
      'Purpose-built for architects, BIM modelers, VFX animators, and real-time visualization creators requiring silky-smooth viewport interactivity inside dense polygon scenes combined with fast background rendering cycles.',
    architecturePoints: [
      'Top-bin multi-core processors delivering sustained 5.7GHz+ boost frequencies for responsive viewport manipulation and single-threaded CAD geometry engines.',
      'High-VRAM NVIDIA RTX Studio GPUs equipped with dedicated hardware RT cores and Tensor cores for real-time raytracing.',
      'Certified NVIDIA Studio driver pipeline eliminating viewport crashes during complex multi-layer architectural walk-throughs.',
      'High-speed low-latency DDR5 memory tuned specifically for dense BIM models, scene hierarchies, and high-resolution texture caches.',
      'Positive-pressure dual-chamber chassis with precision micro-mesh intake filters, preventing dust buildup during overnight render passes.',
    ],
    software: ['AutoCAD', 'Revit', 'Blender', 'Autodesk Maya', 'Unreal Engine 5', '3ds Max', 'V-Ray', 'Lumion', 'SolidWorks'],
    specsRecommendation: 'High-frequency Intel Core i9 / AMD Ryzen 9 • RTX 4080 / 4090 / RTX 5000 Ada • 64GB–128GB 6000MHz DDR5 • 4TB Gen4 Scratch Arrays',
  },
  {
    id: 'cinema-broadcast',
    title: 'Cinema Color Grading, 8K Broadcast & Audio Production Studios',
    badge: 'Media & Post-Production',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: Activity,
    headline: 'Uncompressed Ingest, Multi-Stream Scrubbing & Silent Acoustic Isolation',
    summary:
      'Engineered for post-production facilities, documentary film colorists, and broadcast suites handling uncompressed ProRes RAW, REDCODE, and multi-track spatial audio mixes without dropped frames or fan noise bleeding into microphones.',
    architecturePoints: [
      'Hardware-accelerated 10-bit 4:2:2 video decoding with dual hardware media encoders for near-instant rendering and seamless multi-cam scrubbing.',
      'Multi-tiered PCIe Gen 4/5 NVMe scratch drives configured for sustained random read/write throughput during multi-stream 8K timelines.',
      'High-speed studio connectivity: native dual Thunderbolt 4 (40 Gbps) ports, 10-Gigabit Ethernet SFP+ networking, and front USB-C 20Gbps interfaces.',
      'Acoustically dampened studio chassis, custom zero-RPM PWM fan curves, and vibration-isolated mounting dampeners ensuring whisper-quiet operation.',
      'Dual-display 10-bit color workflow readiness with factory hardware calibration profiles for reference grade mastering monitors.',
    ],
    software: ['DaVinci Resolve Studio', 'Adobe Premiere Pro', 'After Effects', 'Pro Tools', 'Ableton Live', 'Steinberg Nuendo', 'Logic Pro Virtualized'],
    specsRecommendation: 'Intel Core Ultra / AMD Ryzen 9 • Dedicated Studio GPU • 64GB–128GB High-Bandwidth RAM • Dual Thunderbolt 4 • 10GbE Network Ingest',
  },
  {
    id: 'esports-sim',
    title: 'Elite Competitive Esports & Simulation Battle Stations',
    badge: 'Enthusiast & Simulators',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Flame,
    headline: 'Sub-Millisecond Frametimes, 4K High-Refresh & 1% Low Consistency',
    summary:
      'Hand-crafted for competitive esports athletes, sim-racers, and VR flight simulation pilots demanding unflinching framerate stability, zero micro-stutters, and sub-millisecond input responsiveness under sustained competitive loads.',
    architecturePoints: [
      'AMD 3D V-Cache processors (Ryzen 7 7800X3D / 9800X3D) and unlocked high-frequency Intel K-series for unmatched gaming IPC and frametime smoothness.',
      'Ultra-low-latency CL30 high-frequency DDR5 memory with sub-timings hand-verified and stress-tested in BIOS for tight memory latency.',
      'Maximum GPU airflow clearance with triple-slot graphics backplates and custom anti-sag CNC aluminum brackets.',
      'High-surface-area 360mm or 420mm liquid cooling loops and premium dual-tower air sinks for sustained low temperatures under extreme loads.',
      'Pure gaming OS configuration: complete background telemetry stripping, DPC latency tuning, and zero manufacturer bloatware.',
    ],
    software: ['Microsoft Flight Simulator 2024', 'iRacing', 'Assetto Corsa Competizione', 'Counter-Strike 2', 'Cyberpunk 2077', 'Valorant', 'Apex Legends'],
    specsRecommendation: 'AMD Ryzen 7 7800X3D / 9800X3D • NVIDIA GeForce RTX 4080 Super / 4090 • 32GB–64GB Low-Latency DDR5 • 360mm AIO Liquid Cooling',
  },
  {
    id: 'enterprise-server',
    title: 'Enterprise Edge, Virtualization & High-Availability Servers',
    badge: 'Enterprise Infrastructure',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Server,
    headline: '24/7/365 Uptime, ECC Memory Redundancy & Redundant Storage Arrays',
    summary:
      'Built for regional businesses, architectural practices, engineering studios, and branch offices requiring reliable on-premises virtualization, private cloud storage, automated snapshots, and high-throughput network attached arrays.',
    architecturePoints: [
      'Server-grade motherboards with dedicated out-of-band IPMI / BMC management chips for remote hardware monitoring and virtual KVM console control.',
      'True ECC (Error-Correcting Code) memory modules guarding against memory bit flips and silent data corruption across months of continuous uptime.',
      'Hot-swappable enterprise SAS/SATA drive arrays configured for ZFS RAID-Z2 or hardware RAID with automatic scrubbing and snapshot replication.',
      'Redundant dual Platinum-certified power supplies with seamless automatic failover in the event of primary power interruption.',
      'Dual 10GbE SFP+ or copper networking for instant multi-client gigabyte file transfers and isolated VLAN virtualization fabrics.',
    ],
    software: ['Proxmox VE', 'TrueNAS Core / SCALE', 'VMware ESXi', 'Ubuntu Server LTS', 'Windows Server', 'Docker Engine', 'Nextcloud Enterprise'],
    specsRecommendation: 'Intel Xeon / AMD EPYC / Ryzen PRO • True ECC Server Memory • Redundant Platinum PSUs • Hot-Swap Enterprise SAS/NVMe ZFS Pools',
  },
];

const LIFECYCLE_STAGES = [
  {
    number: '01',
    title: 'Workload Profiling & Architecture Blueprinting',
    desc: 'We begin every build by analyzing your specific daily software pipeline, project file scales, viewport complexity, and thermal operating environment. Rather than picking parts at random, we calculate exact memory bandwidth, PCIe lane distribution, and power phase requirements.',
    detail: 'Complete compatibility cross-check of silicon architectures, motherboard VRM heat sinks, RAM height clearances, and GPU chassis dimensions.',
  },
  {
    number: '02',
    title: 'Direct Tier-1 Silicon Sourcing',
    desc: 'Every component is sourced exclusively through verified Tier-1 authorized Indian distribution channels (Intel, AMD, ASUS ROG, MSI, Gigabyte, Corsair, Seasonic, Noctua, Lian Li, Crucial, Kingston). We reject grey-market or refurbished stock.',
    detail: 'Full manufacturer warranty cards, factory tamper seals, and individual component serial numbers are cataloged and handed over to you.',
  },
  {
    number: '03',
    title: 'ESD-Safe Clean Bench Assembly',
    desc: 'Your machine is hand-assembled inside our Vamanjoor hardware lab on grounded anti-static mats with calibrated torque tools. We apply high-grade micro-spread non-conductive thermal paste, install custom anti-sag graphics brackets, and hand-comb all cabling.',
    detail: 'Surgical rear-spine cable routing ensures unobstructed laminar airflow across VRM heatsinks and M.2 SSD thermal spreaders.',
  },
  {
    number: '04',
    title: '48-Hour Continuous Stress Soak & Silicon Burn-In',
    desc: 'No machine leaves our lab until it survives a grueling 48-hour hardware validation gauntlet. We run MemTest86 for bit-level memory stability, Prime95 small-FFT for sustained CPU VRM power delivery, and FurMark for GPU thermal equilibrium.',
    detail: 'Multi-hour Cinebench R23 rendering loops verify zero thermal throttling in ambient Mangaluru coastal operating temperatures.',
  },
  {
    number: '05',
    title: 'Zero-Bloatware Clean OS Tuning & White-Glove Handover',
    desc: 'We flash the motherboard to the latest stable microcode BIOS release, enable and verify XMP/EXPO memory profiles, tune quiet PWM acoustic fan curves, and install a virgin copy of Windows 11 Pro or Linux LTS.',
    detail: 'Zero trialware, zero adware, and zero useless background utilities. Your machine arrives completely clean, configured, and ready to work.',
  },
];

const ENGINEERING_STANDARDS = [
  {
    icon: Fan,
    title: 'Positive-Pressure Airflow & Coastal Dust Defense',
    desc: 'Mangaluru’s coastal humidity and fine particulate require calculated positive internal chassis pressure. We calibrate intake CFM above exhaust CFM through fine mesh filters, keeping dust outside your chassis seams.',
  },
  {
    icon: Gauge,
    title: 'Acoustic Decibel Engineering',
    desc: 'Silent computing is standard. We calibrate BIOS PWM fan curves with smooth hysteretic step-ups, ensuring your fans remain at 0 RPM during desktop productivity and ramp up smoothly without jarring auditory spikes.',
  },
  {
    icon: Zap,
    title: 'Zero Daisy-Chaining Standard',
    desc: 'We strictly enforce dedicated 8-pin and native ATX 3.0 12VHPWR high-current cabling directly from the power supply to high-wattage GPUs, completely eliminating melting hazards and transient voltage drops.',
  },
  {
    icon: Award,
    title: '100% Component Box & Serial Handover',
    desc: 'Every customer receives every individual retail box, spare modular cables, motherboard brackets, screws, warranty slips, and registered serial numbers cataloged for future reference.',
  },
  {
    icon: Flame,
    title: 'Bespoke Thermal Interface Management',
    desc: 'We use premium thermal compounds with thermal conductivities exceeding 12.5 W/mK, applied via multi-point micro-dispersion to guarantee edge-to-edge silicon contact without dry spots or thermal voids.',
  },
  {
    icon: ShieldCheck,
    title: 'Mangaluru Local Support & Lifetime Diagnostics',
    desc: 'When you build with Lapy Procare, you have a direct line to the exact engineer who assembled your rig. Enjoy complimentary annual thermal repasting and lifetime hardware diagnostic checkups at our Vamanjoor center.',
  },
];

const FAQS = [
  {
    q: 'Do you provide original manufacturer warranty cards and retail boxes?',
    a: 'Yes, 100%. Every single component we use is sourced directly from authorized Tier-1 Indian distribution channels with genuine manufacturer warranties (ranging from 3 to 10 years depending on the component). When you pick up your build, you receive all original retail packaging, unused modular cables, mounting brackets, and documentation.',
  },
  {
    q: 'Can I bring some of my own components for you to assemble and stress test?',
    a: 'Absolutely. Many of our clients already own a graphics card, high-end storage, or chassis from a previous system. We will happily inspect and benchmark your existing components, integrate them into your new build, and perform our full 48-hour stress testing suite on the combined system.',
  },
  {
    q: 'What operating systems can you configure on my custom workstation?',
    a: 'We can configure clean installations of Windows 11 Pro, Windows 10 Enterprise LTSC, Ubuntu Desktop/Server LTS, Debian, Fedora, Arch Linux, or dual-boot configurations. All installations are virgin setups without OEM bloatware, pre-loaded with official silicon chipset drivers and hardware utilities.',
  },
  {
    q: 'How do you handle shipping or pickup across Mangaluru and coastal Karnataka?',
    a: 'We offer white-glove personal delivery and on-site desk setup across Mangaluru, Surathkal, Udupi, Bantwal, and Puttur. We also welcome clients to visit our lab near St. Joseph Engineering College in Vamanjoor to test and inspect their machine prior to handover.',
  },
  {
    q: 'Can my build be upgraded in the future as my computational needs grow?',
    a: 'Every custom system we design prioritizes future expandability. We ensure motherboards have adequate VRM power phase headroom, additional M.2 NVMe slots, extra RAM DIMM channels, and power supplies with sufficient wattage overhead for future CPU and GPU generations.',
  },
  {
    q: 'What is the turnaround time for a custom workstation build?',
    a: 'Standard custom workstation orders are typically completed, stress-tested, and ready for handover within 3 to 5 business days from component arrival. The build process includes careful clean-bench assembly, BIOS microcode updates, cable routing, and our mandatory 48-hour continuous burn-in gauntlet.',
  },
];

export const CustomPCBuilder = () => {
  const [activeTier, setActiveTier] = useState('ai-compute');
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    workload: 'Deep Learning & AI Compute',
    software: '',
    chassisStyle: 'Minimalist Acoustic Stealth Black',
    requirements: '',
    timeline: 'Within 2 Weeks',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTierData = WORKLOAD_TIERS.find((t) => t.id === activeTier) || WORKLOAD_TIERS[0];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please provide your name, email, and phone number so our engineers can contact you.');
      return;
    }

    setIsSubmitting(true);
    try {
      const subject = `Bespoke PC Engineering Request: ${formData.workload} [${formData.name}]`;
      const message = `
Client Workstation Consultation Request:
----------------------------------------
Client Name: ${formData.name}
Phone / WhatsApp: ${formData.phone}
Email: ${formData.email}
Target Workload: ${formData.workload}
Primary Software / Pipeline: ${formData.software || 'Not specified'}
Preferred Aesthetic / Chassis: ${formData.chassisStyle}
Project Timeline: ${formData.timeline}

Custom Hardware Requirements & Notes:
${formData.requirements || 'No additional hardware notes provided.'}
      `.trim();

      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject,
        message,
      });

      toast.success('Your workstation blueprint request has been received! A Lapy Procare hardware engineer will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        workload: 'Deep Learning & AI Compute',
        software: '',
        chassisStyle: 'Minimalist Acoustic Stealth Black',
        requirements: '',
        timeline: 'Within 2 Weeks',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit consultation request. Please reach us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28 py-8 sm:py-16">
      {/* ========================================================
          HERO SECTION — HIGH-END EDITORIAL HARDWARE SHOWCASE
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase shadow-sm">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Bespoke Hardware Engineering & Workstations</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111827] font-['Sora'] tracking-tight leading-[1.12]">
            High-Performance Systems.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
              Built Without Compromise.
            </span>
          </h1>

          <p className="text-[#475569] text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
            Mass-market prebuilts cut corners on motherboard power delivery, cooling headroom, memory sub-timings, and silicon binning. At Lapy Procare, we design, assemble, and stress-validate bespoke computing instruments tailored specifically to your computational software, rendering pipelines, and thermal environments.
          </p>

          {/* Value Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#475569]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> 48-Hour Continuous Stress Soak
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> 0% OEM Bloatware Guarantee
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> 100% Component Box & Serial Handover
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" /> Tier-1 Authorized Brand Distribution
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a href="#consultation-form">
              <Button size="lg" icon={FileText}>
                Request Custom System Blueprint
              </Button>
            </a>
            <a
              href="https://wa.me/917666104889?text=Hello%20Lapy%20Procare,%20I%20would%20like%20to%20consult%20with%20a%20hardware%20engineer%20regarding%20a%20custom%20PC%20workstation%20build."
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="secondary" size="lg" icon={MessageCircle}>
                Chat with Rig Specialist
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 — THE PREBUILT VS BESPOKE COMPARISON
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-teal-50/40 border border-[#E2E8F0] rounded-3xl p-8 sm:p-12 shadow-card">
          <div className="max-w-3xl mb-10 space-y-3">
            <Badge status="Ready for Collection" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              The Engineering Difference
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
              Why Off-The-Shelf Desktops Fail Professional Workloads
            </h2>
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed">
              Standard commercial desktop towers are designed for high retail margins rather than continuous computational endurance. Here is how our boutique laboratory engineering protects your productivity and hardware longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-[#E2E8F0] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Clean Power Delivery</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                We reject low-tier OEM power supplies. Every Lapy Procare system utilizes Tier-A Japanese capacitors, ATX 3.0 transient spike defense, and dedicated non-split PCIe power lines.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-[#E2E8F0] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Fan className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Positive Pressure Airflow</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Coastal Mangaluru humidity and fine airborne dust destroy unsealed rigs. We calibrate intake airflow CFM strictly above exhaust, sealing dust outside through filtered chassis channels.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-[#E2E8F0] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Acoustic Decibel Tuning</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                No jet-engine fan spikes while working. Custom PWM curves keep your system virtually silent under nominal coding and office tasks, ramping smoothly under heavy compute workloads.
              </p>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 border border-[#E2E8F0] space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#111827]">Zero Bloatware Kernel</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Zero trialware, OEM background bloat, or intrusive vendor utilities stealing CPU interrupts. You receive an ultra-clean, stripped operating system tuned for minimum DPC latency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — WORKLOAD-SPECIFIC ARCHITECTURE TIERS
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge status="Ready for Collection" className="bg-teal-50 text-teal-700 border-teal-200">
            Workload Architecture Tiers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Engineered Specifically For Your Stack
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            Select your discipline below to explore our verified hardware blueprints, silicon specifications, and thermal engineering parameters.
          </p>
        </div>

        {/* Tier Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {WORKLOAD_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isActive = activeTier === tier.id;
            return (
              <button
                key={tier.id}
                onClick={() => setActiveTier(tier.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-100'
                    : 'bg-white text-[#475569] hover:text-[#111827] border border-[#E2E8F0] hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                <span>{tier.title.split(',')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tier Detailed Display */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-10 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Architectural Description & Highlights */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${selectedTierData.badgeColor}`}>
                  {selectedTierData.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora']">
                  {selectedTierData.title}
                </h3>
                <p className="text-sm font-semibold text-indigo-600">
                  {selectedTierData.headline}
                </p>
              </div>

              <p className="text-sm text-[#475569] leading-relaxed">
                {selectedTierData.summary}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Architectural & Silicon Standards
                </h4>
                <ul className="space-y-2.5">
                  {selectedTierData.architecturePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#475569] leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right 5 Columns: Software Pipeline & Silicon Specification */}
            <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl p-6 border border-[#E2E8F0] space-y-6">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Target Software Compatibility</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTierData.software.map((sw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#E2E8F0] text-xs font-medium text-[#111827] shadow-2xs"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#E2E8F0]">
                <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span>Recommended Silicon Blueprint</span>
                </h4>
                <p className="text-xs font-mono text-[#475569] bg-white p-3.5 rounded-xl border border-[#E2E8F0] leading-relaxed">
                  {selectedTierData.specsRecommendation}
                </p>
              </div>

              <div className="pt-2">
                <a href="#consultation-form">
                  <Button size="md" className="w-full" icon={Sliders}>
                    Request Blueprint for This Workload
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — 5-STAGE ENGINEERING LIFECYCLE
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge status="Ready for Collection" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Precision Craftsmanship Protocol
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            The Lapy Procare Engineering Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-[#64748B]">
            From initial computational workflow profiling to a mandatory 48-hour continuous thermal soak, every build follows an uncompromising 5-stage laboratory discipline.
          </p>
        </div>

        <div className="space-y-6">
          {LIFECYCLE_STAGES.map((stage, idx) => (
            <Card key={idx} className="p-6 sm:p-8 border-[#E2E8F0] hover:border-indigo-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-2 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black font-['Sora'] text-indigo-600/40">
                    {stage.number}
                  </span>
                  <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
                </div>

                <div className="md:col-span-10 space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-[#111827]">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {stage.desc}
                  </p>
                  <p className="text-xs text-indigo-600 font-medium pt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{stage.detail}</span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — HARDWARE STANDARDS & CRAFTSMANSHIP DETAILS
         ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-left max-w-2xl space-y-3">
          <Badge status="Ready for Collection" className="bg-teal-50 text-teal-700 border-teal-200">
            Hardware Standards
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Zero Shortcuts. Extreme Reliability.
          </h2>
          <p className="text-sm text-[#64748B]">
            Every system built in our Mangaluru laboratory adheres to stringent electrical, thermal, and mechanical assembly standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ENGINEERING_STANDARDS.map((std, idx) => {
            const Icon = std.icon;
            return (
              <Card key={idx} className="p-6 border-[#E2E8F0] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#111827]">{std.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed">{std.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 6 — INTERACTIVE WORKSTATION CONSULTATION REQUEST
         ======================================================== */}
      <section id="consultation-form" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-12 shadow-card">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 5 Columns: Consultation Overview & Direct Contacts */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <Badge status="Ready for Collection" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                  Direct Engineering Consultation
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
                  Request a Custom System Blueprint
                </h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Tell our senior hardware architects about your computational workload, software stack, and form-factor preferences. We will review your requirements, design an optimal silicon blueprint, verify stock availability with tier-1 distributors, and provide a comprehensive specification breakdown.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-2">
                  <span className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-indigo-600" />
                    <span>Direct WhatsApp & Call Hotline</span>
                  </span>
                  <p className="text-xs text-[#64748B]">
                    Need immediate technical advice or component compatibility verification?
                  </p>
                  <a
                    href="https://wa.me/917666104889?text=Hello%20Lapy%20Procare,%20I%20would%20like%20to%20consult%20with%20a%20hardware%20engineer%20regarding%20a%20custom%20PC%20workstation%20build."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-800 pt-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>+91 7666104889 (WhatsApp Online)</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-[#E2E8F0] space-y-1 text-xs text-[#64748B]">
                  <span className="font-bold text-[#111827] block">Laboratory Location</span>
                  <p>Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028</p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    On-site physical lab visits welcome Monday through Saturday (9:00 AM – 8:00 PM).
                  </p>
                </div>
              </div>
            </div>

            {/* Right 7 Columns: Blueprint Specification Form */}
            <div className="lg:col-span-7 bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-[#E2E8F0]">
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111827]">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Dr. Rohan Shetty"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111827]">
                      Phone / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111827]">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="name@organization.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111827]">
                      Target Workload Discipline
                    </label>
                    <select
                      name="workload"
                      value={formData.workload}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Deep Learning & AI Compute</option>
                      <option>3D Architectural Modeling & CAD</option>
                      <option>Cinema 8K Grading & Audio Studio</option>
                      <option>Competitive Esports & Sim Racing</option>
                      <option>Enterprise Edge Virtualization Server</option>
                      <option>General Enthusiast & Custom Rig</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111827]">
                      Primary Software & Tools
                    </label>
                    <input
                      type="text"
                      name="software"
                      value={formData.software}
                      onChange={handleInputChange}
                      placeholder="e.g. AutoCAD, Blender, PyTorch, Resolve"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#111827]">
                      Aesthetic & Chassis Style
                    </label>
                    <select
                      name="chassisStyle"
                      value={formData.chassisStyle}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option>Minimalist Acoustic Stealth Black</option>
                      <option>Modern Dual-Chamber Tempered Glass</option>
                      <option>Compact Small Form Factor (SFF / Mini-ITX)</option>
                      <option>Clean Studio White Edition</option>
                      <option>Industrial Rackmount Chassis</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111827]">
                    Specific Hardware Preferences or Storage Requirements
                  </label>
                  <textarea
                    name="requirements"
                    rows="3"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Specify any preferred processor architectures (AMD Ryzen / Intel Core / Threadripper), GPU VRAM targets, memory density (e.g. 64GB vs 128GB), storage capacity, or liquid vs air cooling preferences..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#111827]">
                    Project Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option>Immediate / Within 1 Week</option>
                    <option>Within 2 Weeks</option>
                    <option>Within This Month</option>
                    <option>Planning / Long-Term Consultation</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    icon={Send}
                    isLoading={isSubmitting}
                  >
                    Submit Workstation Blueprint Request
                  </Button>
                  <p className="text-[11px] text-[#64748B] text-center mt-2.5">
                    Your request is securely transmitted to our senior hardware engineering team. No spam, ever.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — HARDWARE ENGINEERING FAQ
         ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <Badge status="Ready for Collection" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Hardware FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] font-['Sora']">
            Frequently Asked Engineering Questions
          </h2>
          <p className="text-sm text-[#64748B]">
            Details on our component sourcing standards, operating system deployment, and lifetime local support.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className="p-5 border-[#E2E8F0] cursor-pointer hover:border-slate-300 transition-all"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm sm:text-base font-bold text-[#111827]">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-[#475569] leading-relaxed pt-3 border-t border-slate-100 mt-3">
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
