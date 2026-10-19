import React, { useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import { toast } from 'sonner';
import { User, Lock, Save } from 'lucide-react';

export const CustomerProfile = () => {
  const { user, updateUser } = useAuthStore();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || 'Mangaluru',
    postalCode: user?.address?.postalCode || '575028',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          postalCode: profileData.postalCode,
        },
      });
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
      }
      toast.success('Profile information updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Profile & Account Security
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Manage your contact credentials and account security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information Form */}
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-5">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <User className="w-4 h-4 text-[#4F46E5]" />
            <span>Customer Contact Info</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#64748B] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Street / Locality Address
              </label>
              <input
                type="text"
                value={profileData.street}
                onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                placeholder="Door No, Street name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={profileData.postalCode}
                  onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={isSavingProfile}
              className="w-full mt-2"
              icon={Save}
            >
              Update Contact Details
            </Button>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-5">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <Lock className="w-4 h-4 text-[#4F46E5]" />
            <span>Change Account Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                New Secure Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>

            <Button
              type="submit"
              variant="outline"
              size="sm"
              isLoading={isSavingPassword}
              className="w-full mt-2"
              icon={Lock}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
