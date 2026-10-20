import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { PCComponent } from '../models/PCComponent.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { TechnicianProfile } from '../models/TechnicianProfile.js';
import { Review } from '../models/Review.js';
import { ROLES } from '../config/constants.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lapy_procare';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for database seeding...');

    // 1. Seed Business Settings
    await BusinessSettings.deleteMany({});
    await BusinessSettings.create({
      businessName: 'Lapy Procare',
      email: 'lapyprocare@gmail.com',
      phone: '+91 7666104889',
      whatsapp: '+91 7666104889',
      address: 'Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028, India',
      workingHours: {
        weekday: '09:00 AM - 08:00 PM',
        saturday: '09:30 AM - 07:00 PM',
        sunday: '10:00 AM - 02:00 PM',
      },
      isDoorstepServiceEnabled: true,
      isAIAssistantEnabled: true,
      standardGSTPercentage: 18,
    });
    console.log('✔ Business settings seeded.');

    // 2. Seed Users
    await User.deleteMany({ email: { $in: ['admin@lapyprocare.com', 'technician@lapyprocare.com', 'customer@gmail.com'] } });

    // Administrator & Lead Technician (Single unified superuser)
    const adminUser = await User.create({
      name: 'Lapy Procare Admin & Lead Tech',
      email: 'admin@lapyprocare.com',
      phone: '+91 7666104889',
      password: 'Admin@Lapy2026!',
      role: ROLES.ADMIN,
      isVerified: true,
      address: {
        street: 'Near St. Joseph Engineering College',
        city: 'Mangaluru',
        postalCode: '575028',
      },
    });

    await TechnicianProfile.deleteMany({});
    await TechnicianProfile.create({
      user: adminUser._id,
      specialization: ['Chip-Level Motherboard Repair', 'Display & Hinge Overhaul', 'Thermal Diagnostics', 'Custom PC Architecture'],
      experienceYears: 8,
      bio: 'Owner, Lead Engineer & Master Hardware Technician at Lapy Procare Vamanjoor.',
    });

    // Customer
    const customerUser = await User.create({
      name: 'Karthik Rao',
      email: 'customer@gmail.com',
      phone: '+91 9845012345',
      password: 'Customer@123',
      role: ROLES.CUSTOMER,
      isVerified: true,
      address: {
        street: 'Kodialbail',
        city: 'Mangaluru',
        postalCode: '575003',
      },
    });
    console.log('✔ Users seeded (Admin & Lead Tech, Customer).');

    // 3. Seed Services
    await Service.deleteMany({});
    const services = [
      {
        title: 'Laptop Repair',
        slug: 'laptop-repair',
        icon: 'Laptop',
        category: 'Hardware',
        shortDescription: 'Comprehensive chip-level motherboards, hinge rebuilds, liquid damage restoration, and display screen replacement.',
        fullDescription: 'Our certified engineers handle hardware failures on all major brands including Dell, HP, Lenovo, ASUS, Acer, and Apple MacBook. We utilize specialized hot-air stations and digital microscopes for chip-level diagnostics.',
        startingPrice: 399,
        estimatedTime: '2 - 4 Hours',
        features: ['Chip-level logic board diagnostics', 'Cracked screen replacement', 'Hinge & body fabrication', 'Original keyboard & trackpad replacement', 'Liquid spill ultrasonic wash'],
        order: 1,
      },
      {
        title: 'Desktop Repair',
        slug: 'desktop-repair',
        icon: 'Monitor',
        category: 'Hardware',
        shortDescription: 'Reliable troubleshooting for towers, workstations, power supplies, motherboard replacements, and intermittent reboot bugs.',
        fullDescription: 'Complete diagnostic and repair solutions for custom and OEM desktop towers. We verify power rails, capacitor degradation, and thermal dissipation under sustained load.',
        startingPrice: 349,
        estimatedTime: '2 - 4 Hours',
        features: ['Power supply (SMPS) testing & replacement', 'CMOS & BIOS recovery', 'Deep dust extraction & thermal renewal', 'Motherboard capacitor overhaul'],
        order: 2,
      },
      {
        title: 'RAM & SSD Upgrades',
        slug: 'ram-ssd-upgrades',
        icon: 'HardDrive',
        category: 'Upgrades',
        shortDescription: 'Supercharge system speed up to 10x with high-speed PCIe Gen4 NVMe SSDs and dual-channel high-frequency RAM.',
        fullDescription: 'Breathe new life into sluggish computers. We clone your existing operating system, programs, and files seamlessly to ultra-fast solid state storage with zero data loss.',
        startingPrice: 499,
        estimatedTime: '1 - 2 Hours',
        features: ['100% data clone without OS reinstallation', 'High-speed PCIe Gen 4 NVMe SSDs', 'DDR4 & DDR5 Dual-Channel RAM expansions', 'SMART drive health testing'],
        order: 3,
      },
      {
        title: 'Custom PC Builds',
        slug: 'custom-pc-builds',
        icon: 'Cpu',
        category: 'Custom PC',
        shortDescription: 'Tailor-made gaming battle stations, 3D rendering rigs, and high-frequency trading workstations.',
        fullDescription: 'Meticulously crafted desktop builds tailored to your budget and workload. We test thermal thresholds, optimize fan curves, perform pristine cable management, and stress-test every component for 24 hours before handover.',
        startingPrice: 1499,
        estimatedTime: '24 - 48 Hours',
        features: ['Architected component matching', 'Surgical aesthetic cable management', 'AIO & custom loop liquid cooling', 'Stress test & thermal benchmarks'],
        order: 4,
      },
      {
        title: 'Operating System Installation',
        slug: 'operating-system-installation',
        icon: 'Terminal',
        category: 'Software',
        shortDescription: 'Clean installation of genuine Windows 11/10 and Linux distributions with optimal driver tuning.',
        fullDescription: 'Complete operating system setup with manufacturer-certified chipset drivers, security patches, essential runtime runtimes, and user data migration.',
        startingPrice: 499,
        estimatedTime: '1 - 2 Hours',
        features: ['Clean genuine Windows 11 / Linux installation', 'Full chipset & GPU driver configuration', 'Bloatware-free optimization', 'Data backup & restoration'],
        order: 5,
      },
      {
        title: 'Network Setup & Support',
        slug: 'network-setup-support',
        icon: 'Wifi',
        category: 'Networking',
        shortDescription: 'Enterprise and home office Wi-Fi mesh networking, gigabit structured cabling, and router configuration.',
        fullDescription: 'Eliminate dead zones with high-performance mesh Wi-Fi 6 networks, managed switches, firewall security rules, and patch-panel termination across Vamanjoor and Mangaluru.',
        startingPrice: 799,
        estimatedTime: '3 - 6 Hours',
        features: ['Mesh Wi-Fi 6 architecture', 'Cat6 structured cabling', 'Router & VPN configuration', 'Network security audit'],
        order: 6,
      },
      {
        title: 'CCTV Installation',
        slug: 'cctv-installation',
        icon: 'Camera',
        category: 'Security',
        shortDescription: 'High-definition IP & HD CCTV surveillance systems with smartphone remote view for homes and commercial setups.',
        fullDescription: 'Professional security surveillance installation using industry-leading cameras from Hikvision and CP Plus with night vision, motion detection, and mobile viewing setup.',
        startingPrice: 999,
        estimatedTime: '4 - 8 Hours',
        features: ['Night vision & motion detection cameras', 'NVR/DVR setup with hard drive recording', 'Remote smartphone live streaming', 'Neat concealed conduit wiring'],
        order: 7,
      },
      {
        title: 'Software & Virus Removal',
        slug: 'software-virus-removal',
        icon: 'ShieldAlert',
        category: 'Software',
        shortDescription: 'Deep eradication of rootkits, adware, trojans, ransomware mitigation, and licensed software installation.',
        fullDescription: 'Comprehensive software maintenance, registry repair, malware removal, and licensed productivity suite installations.',
        startingPrice: 349,
        estimatedTime: '1 - 3 Hours',
        features: ['Deep rootkit & spyware removal', 'System registry optimization', 'Licensed antivirus setup', 'Data security safeguard'],
        order: 8,
      },
      {
        title: 'Hardware Troubleshooting',
        slug: 'hardware-troubleshooting',
        icon: 'Wrench',
        category: 'Hardware',
        shortDescription: 'Expert diagnosis of obscure boot loops, blue screens (BSOD), no-display faults, and intermittent shutdowns.',
        fullDescription: 'Rigorous diagnostic testing using hardware multimeters, oscilloscope signal tracking, and power rail isolation to pinpoint failing components.',
        startingPrice: 299,
        estimatedTime: '1 - 2 Hours',
        features: ['Detailed diagnostic report', 'Oscilloscope & multimeter testing', 'Transparent repair options', 'Diagnostic fee waived upon repair approval'],
        order: 9,
      },
      {
        title: 'Business IT Maintenance (AMC)',
        slug: 'business-it-maintenance',
        icon: 'Building2',
        category: 'Enterprise',
        shortDescription: 'Annual Maintenance Contracts (AMC) for schools, colleges, offices, and clinics across Mangaluru.',
        fullDescription: 'Preventative IT maintenance, emergency on-site breakdown response, routine health checks, and scheduled asset servicing designed to keep business infrastructure operational.',
        startingPrice: 1999,
        estimatedTime: 'Scheduled Monthly',
        features: ['Priority on-site technician response', 'Preventative quarterly servicing', 'Dedicated account manager', 'Periodic cloud backup verification'],
        order: 10,
      },
    ];

    await Service.insertMany(services);
    console.log(`✔ ${services.length} services seeded.`);

    // 4. Seed Inventory Items
    await InventoryItem.deleteMany({});
    const inventory = [
      {
        name: 'Crucial P3 Plus 500GB NVMe PCIe 4.0 SSD',
        sku: 'SSD-CRU-500G-P3P',
        category: 'Storage',
        supplier: 'Crucial India Authorized Distributor',
        purchasePrice: 2900,
        sellingPrice: 3800,
        quantity: 14,
        reorderThreshold: 4,
        location: 'Bin S-01, Storage Shelf',
      },
      {
        name: 'Kingston Fury Beast 16GB DDR4 3200MHz RAM',
        sku: 'RAM-KNG-16G-D4',
        category: 'Memory',
        supplier: 'Kingston Distribution Hub',
        purchasePrice: 2400,
        sellingPrice: 3200,
        quantity: 12,
        reorderThreshold: 3,
        location: 'Bin M-02, Memory Rack',
      },
      {
        name: 'Corsair Vengeance 16GB DDR5 5600MHz RAM',
        sku: 'RAM-COR-16G-D5',
        category: 'Memory',
        supplier: 'Corsair India',
        purchasePrice: 3800,
        sellingPrice: 4900,
        quantity: 8,
        reorderThreshold: 2,
        location: 'Bin M-04, Memory Rack',
      },
      {
        name: 'Thermal Grizzly Kryonaut High Performance Thermal Paste (1g)',
        sku: 'THM-TG-KRYO-1G',
        category: 'Thermal & Consumables',
        supplier: 'Enthusiast PC Supplies',
        purchasePrice: 450,
        sellingPrice: 750,
        quantity: 25,
        reorderThreshold: 5,
        location: 'Drawer T-01',
      },
      {
        name: 'Generic 15.6" Full HD 1080p 30-Pin EDP IPS Laptop Screen',
        sku: 'DSP-156-FHD-30P',
        category: 'Displays',
        supplier: 'OEM Panel Importers',
        purchasePrice: 3200,
        sellingPrice: 4500,
        quantity: 6,
        reorderThreshold: 2,
        location: 'Padded Screen Rack A',
      },
      {
        name: 'Dell 65W Original Round-Pin Laptop Adapter',
        sku: 'PWR-DEL-65W-RND',
        category: 'Adapters',
        supplier: 'Dell Authorized Spares',
        purchasePrice: 900,
        sellingPrice: 1400,
        quantity: 9,
        reorderThreshold: 3,
        location: 'Bin P-03',
      },
    ];
    await InventoryItem.insertMany(inventory);
    console.log(`✔ ${inventory.length} inventory items seeded.`);

    // 5. Seed PC Components for Custom PC Builder
    await PCComponent.deleteMany({});
    const pcComponents = [
      // Processors
      {
        name: 'Intel Core i5-13400F (10 Cores, up to 4.6GHz)',
        category: 'Processor',
        brand: 'Intel',
        price: 17500,
        specifications: { socket: 'LGA1700', wattage: 65, memoryType: 'DDR4/DDR5' },
        recommendedUseCases: ['Gaming', 'Office', 'Programming'],
        inStock: true,
      },
      {
        name: 'AMD Ryzen 5 7600X (6 Cores, 12 Threads, 5.3GHz)',
        category: 'Processor',
        brand: 'AMD',
        price: 19800,
        specifications: { socket: 'AM5', wattage: 105, memoryType: 'DDR5' },
        recommendedUseCases: ['Gaming', 'Programming', 'Graphic Design'],
        inStock: true,
      },
      {
        name: 'Intel Core i7-14700K (20 Cores, up to 5.6GHz)',
        category: 'Processor',
        brand: 'Intel',
        price: 36500,
        specifications: { socket: 'LGA1700', wattage: 125, memoryType: 'DDR5' },
        recommendedUseCases: ['Video Editing', 'Workstation', 'Gaming'],
        inStock: true,
      },

      // Motherboards
      {
        name: 'MSI PRO B760M-A WIFI (LGA1700, DDR5, mATX)',
        category: 'Motherboard',
        brand: 'MSI',
        price: 14500,
        specifications: { socket: 'LGA1700', memoryType: 'DDR5', formFactor: 'mATX' },
        recommendedUseCases: ['Gaming', 'Programming', 'Office'],
        inStock: true,
      },
      {
        name: 'Gigabyte B650M Gaming WiFi (AM5, DDR5, mATX)',
        category: 'Motherboard',
        brand: 'Gigabyte',
        price: 12500,
        specifications: { socket: 'AM5', memoryType: 'DDR5', formFactor: 'mATX' },
        recommendedUseCases: ['Gaming', 'Programming'],
        inStock: true,
      },
      {
        name: 'ASUS TUF Gaming Z790-PLUS WIFI (LGA1700, DDR5, ATX)',
        category: 'Motherboard',
        brand: 'ASUS',
        price: 24500,
        specifications: { socket: 'LGA1700', memoryType: 'DDR5', formFactor: 'ATX' },
        recommendedUseCases: ['Workstation', 'Video Editing'],
        inStock: true,
      },

      // RAM
      {
        name: 'Corsair Vengeance 16GB (1x16GB) DDR5 5600MHz',
        category: 'RAM',
        brand: 'Corsair',
        price: 4900,
        specifications: { memoryType: 'DDR5', capacity: '16GB' },
        recommendedUseCases: ['Gaming', 'Office', 'Programming'],
        inStock: true,
      },
      {
        name: 'G.Skill Ripjaws S5 32GB (2x16GB) DDR5 6000MHz CL30',
        category: 'RAM',
        brand: 'G.Skill',
        price: 9800,
        specifications: { memoryType: 'DDR5', capacity: '32GB' },
        recommendedUseCases: ['Gaming', 'Video Editing', 'Workstation'],
        inStock: true,
      },

      // Graphics Cards
      {
        name: 'Zotac Gaming GeForce RTX 4060 Twin Edge 8GB',
        category: 'Graphics Card',
        brand: 'NVIDIA / Zotac',
        price: 28900,
        specifications: { wattage: 115, capacity: '8GB GDDR6' },
        recommendedUseCases: ['Gaming', 'Graphic Design', 'Video Editing'],
        inStock: true,
      },
      {
        name: 'ASUS Dual GeForce RTX 4070 Super 12GB',
        category: 'Graphics Card',
        brand: 'NVIDIA / ASUS',
        price: 58500,
        specifications: { wattage: 220, capacity: '12GB GDDR6X' },
        recommendedUseCases: ['Gaming', 'Video Editing', 'Workstation'],
        inStock: true,
      },

      // Storage
      {
        name: 'Samsung 980 PRO 1TB PCIe 4.0 NVMe M.2 SSD',
        category: 'Storage',
        brand: 'Samsung',
        price: 8400,
        specifications: { capacity: '1TB', formFactor: 'M.2 NVMe' },
        recommendedUseCases: ['Gaming', 'Video Editing', 'Workstation', 'Programming'],
        inStock: true,
      },
      {
        name: 'Crucial P3 Plus 500GB PCIe 4.0 NVMe SSD',
        category: 'Storage',
        brand: 'Crucial',
        price: 3800,
        specifications: { capacity: '500GB', formFactor: 'M.2 NVMe' },
        recommendedUseCases: ['Office', 'Gaming'],
        inStock: true,
      },

      // Power Supplies
      {
        name: 'Deepcool PK650D 650W 80 Plus Bronze',
        category: 'Power Supply',
        brand: 'Deepcool',
        price: 4400,
        specifications: { wattage: 650 },
        recommendedUseCases: ['Gaming', 'Office'],
        inStock: true,
      },
      {
        name: 'Corsair RM750e 750W 80 Plus Gold Fully Modular',
        category: 'Power Supply',
        brand: 'Corsair',
        price: 9200,
        specifications: { wattage: 750 },
        recommendedUseCases: ['Gaming', 'Video Editing', 'Workstation'],
        inStock: true,
      },

      // Cabinets
      {
        name: 'Ant Esports ICE-100 Air Mini Mid Tower (3 ARGB Fans)',
        category: 'Cabinet',
        brand: 'Ant Esports',
        price: 3200,
        specifications: { formFactor: 'Mid Tower' },
        recommendedUseCases: ['Gaming', 'Office'],
        inStock: true,
      },
      {
        name: 'Lian Li Lancool 216 RGB Mid Tower (E-ATX Ready)',
        category: 'Cabinet',
        brand: 'Lian Li',
        price: 7900,
        specifications: { formFactor: 'Mid Tower ATX' },
        recommendedUseCases: ['Gaming', 'Workstation', 'Video Editing'],
        inStock: true,
      },

      // Cooling
      {
        name: 'Deepcool AG400 ARGB Single Tower CPU Cooler',
        category: 'Cooling',
        brand: 'Deepcool',
        price: 1900,
        specifications: { wattage: 180 },
        recommendedUseCases: ['Gaming', 'Office', 'Programming'],
        inStock: true,
      },
      {
        name: 'Deepcool LS520 SE 240mm Liquid AIO Cooler',
        category: 'Cooling',
        brand: 'Deepcool',
        price: 6800,
        specifications: { wattage: 280 },
        recommendedUseCases: ['Video Editing', 'Workstation', 'Gaming'],
        inStock: true,
      },
    ];
    await PCComponent.insertMany(pcComponents);
    console.log(`✔ ${pcComponents.length} PC components seeded.`);

    // 6. Seed Approved Testimonials in MongoDB
    await Review.deleteMany({});
    await Review.create([
      {
        customer: customerUser._id,
        customerName: 'Prashanth Kamath',
        rating: 5,
        service: 'Laptop Repair',
        comment: 'My Dell Inspiron laptop had severe motherboard liquid damage. Other shops told me to buy a new laptop, but Lapy Procare diagnosed and replaced the shorted capacitors within 24 hours. Saved me over ₹40,000!',
        isApproved: true,
      },
      {
        customer: customerUser._id,
        customerName: 'Sneha Mendonca',
        rating: 5,
        service: 'Custom PC Builds',
        comment: 'Got my 4K video editing workstation assembled here in Mangaluru. Cable management is textbook quality, thermal performance stays under 70°C, and they provided genuine GST invoices for every single part.',
        isApproved: true,
      },
      {
        customer: customerUser._id,
        customerName: 'Vinay Hegde',
        rating: 5,
        service: 'RAM & SSD Upgrades',
        comment: 'Upgraded an older Lenovo ThinkPad with a Gen4 NVMe SSD and 16GB RAM. Boots Windows in 7 seconds now. Highly transparent pricing and friendly support near SJEC Vamanjoor.',
        isApproved: true,
      },
    ]);
    console.log('✔ Approved customer reviews seeded.');

    console.log('\n=======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!             ');
    console.log(' Admin & Lead Tech: admin@lapyprocare.com / Admin@Lapy2026!');
    console.log(' Customer:          customer@gmail.com / Customer@123');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
