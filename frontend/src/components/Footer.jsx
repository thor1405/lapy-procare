import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, Phone, Mail, Clock, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] text-[#475569] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#111827] font-['Sora']">
                LAPY <span className="text-[#4F46E5]">PROCARE</span>
              </span>
            </Link>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Fast. Reliable. Professional. Premium computer, laptop logic board servicing, custom PC builds, and networking engineered with precision in Mangaluru.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4F46E5] font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>30-Day Service Warranty Guaranteed</span>
            </div>
          </div>

          {/* Core Services */}
          <div>
            <h4 className="text-[#111827] font-bold text-xs tracking-wider mb-4 uppercase">
              Technology Services
            </h4>
            <ul className="space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link to="/services" className="hover:text-[#4F46E5] transition-colors">
                  Chip-Level Laptop Repair
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#4F46E5] transition-colors">
                  Desktop Tower Diagnostics
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#4F46E5] transition-colors">
                  RAM & NVMe SSD Upgrades
                </Link>
              </li>
              <li>
                <Link to="/pc-builder" className="hover:text-[#4F46E5] transition-colors">
                  Custom Gaming & Workstation Builds
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#4F46E5] transition-colors">
                  CCTV Security Surveillance
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#4F46E5] transition-colors">
                  Enterprise IT AMC Maintenance
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Hours */}
          <div>
            <h4 className="text-[#111827] font-bold text-xs tracking-wider mb-4 uppercase">
              Workshop Schedule
            </h4>
            <ul className="space-y-2.5 text-xs text-[#475569]">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] block font-semibold">Monday – Friday:</span>
                  <span>09:00 AM – 08:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] block font-semibold">Saturday:</span>
                  <span>09:30 AM – 07:00 PM</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#111827] block font-semibold">Sunday:</span>
                  <span>10:00 AM – 02:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-[#111827] font-bold text-xs tracking-wider mb-4 uppercase">
              Service Center
            </h4>
            <ul className="space-y-3 text-xs text-[#475569]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <span>
                  Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <a href="tel:+917666104889" className="hover:text-[#4F46E5] transition-colors font-mono font-medium">
                  +91 7666104889
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#4F46E5] shrink-0" />
                <a href="mailto:lapyprocare@gmail.com" className="hover:text-[#4F46E5] transition-colors font-medium">
                  lapyprocare@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4">
          <p>© {new Date().getFullYear()} LAPY PROCARE. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> for Mangaluru's tech community.
          </p>
        </div>
      </div>
    </footer>
  );
};
