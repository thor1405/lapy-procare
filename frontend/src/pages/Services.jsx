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
} from 'lucide-react';

const iconMap = {
  Laptop,
  Monitor,
  HardDrive,
  Cpu,
  Terminal,
  Wifi,
  Camera,
  Building2,
  Wrench,
};

const iconBgMap = {
  Hardware: 'bg-indigo-50 text-indigo-600',
  Upgrades: 'bg-blue-50 text-blue-600',
  'Custom PC': 'bg-teal-50 text-teal-600',
  Software: 'bg-indigo-50 text-indigo-600',
  Networking: 'bg-sky-50 text-sky-600',
  Security: 'bg-teal-50 text-teal-600',
  Enterprise: 'bg-blue-50 text-blue-600',
};

export const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Hardware', 'Upgrades', 'Software', 'Custom PC', 'Networking', 'Security', 'Enterprise'];

  useEffect(() => {
    api
      .get('/services')
      .then((res) => {
        if (res.data?.data?.services) {
          setServices(res.data.data.services);
          setFilteredServices(res.data.data.services);
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
          s.category.toLowerCase().includes(q)
      );
    }

    setFilteredServices(result);
  }, [activeCategory, searchQuery, services]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge status="Device Received" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Authorized Repair & Maintenance
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] font-['Sora']">
          Professional Technology Services
        </h1>
        <p className="text-[#64748B] text-sm sm:text-base">
          From micro-soldering logic board diagnostics to custom high-frequency gaming rigs and commercial CCTV systems in Mangaluru.
        </p>
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
            placeholder="Search services..."
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
              <Card key={service._id || service.slug} className="flex flex-col justify-between group border-[#E2E8F0] hover:border-indigo-300">
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
                    {service.features?.slice(0, 3).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase block">Starting Base</span>
                    <span className="text-base font-extrabold text-[#111827]">₹{service.startingPrice}</span>
                  </div>
                  <Link to={`/customer/book?service=${encodeURIComponent(service.title)}`}>
                    <Button size="sm">Book Service</Button>
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
