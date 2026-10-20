import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { TechLayout } from '../layouts/TechLayout';

// Protection Wrappers
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';

// Public Pages
import { Home } from '../pages/Home';
import { Services } from '../pages/Services';
import { Tracking } from '../pages/Tracking';
import { CustomPCBuilder } from '../pages/CustomPCBuilder';
import { AIAssistant } from '../pages/AIAssistant';
import { Contact } from '../pages/Contact';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { NotFound } from '../pages/NotFound';

// Customer Portal Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { BookRepair } from '../pages/customer/BookRepair';
import { CustomerRepairs } from '../pages/customer/CustomerRepairs';
import { CustomerQuotations } from '../pages/customer/CustomerQuotations';
import { CustomerInvoices } from '../pages/customer/CustomerInvoices';
import { CustomerProfile } from '../pages/customer/CustomerProfile';

// Admin Suite Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminBookings } from '../pages/admin/AdminBookings';
import { AdminQuotations } from '../pages/admin/AdminQuotations';
import { AdminInvoices } from '../pages/admin/AdminInvoices';
import { AdminInventory } from '../pages/admin/AdminInventory';
import { AdminTechnicians } from '../pages/admin/AdminTechnicians';
import { AdminCustomers } from '../pages/admin/AdminCustomers';
import { AdminInquiries } from '../pages/admin/AdminInquiries';
import { AdminSettings } from '../pages/admin/AdminSettings';

// Technician Pages
import { TechnicianDashboard } from '../pages/technician/TechnicianDashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="track" element={<Tracking />} />
        <Route path="pc-builder" element={<CustomPCBuilder />} />
        <Route path="ai-assistant" element={<Navigate to="/services" replace />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Customer Portal Protected Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="book" element={<BookRepair />} />
        <Route path="repairs" element={<CustomerRepairs />} />
        <Route path="quotations" element={<CustomerQuotations />} />
        <Route path="invoices" element={<CustomerInvoices />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Admin Suite Restricted to ADMIN role */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="quotations" element={<AdminQuotations />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="technicians" element={<AdminTechnicians />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Technician Portal Redirect to Admin Suite */}
      <Route path="/technician" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
