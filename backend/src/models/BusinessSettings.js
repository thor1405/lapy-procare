import mongoose from 'mongoose';

const businessSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: 'Lapy Procare' },
    email: { type: String, default: 'lapyprocare@gmail.com' },
    phone: { type: String, default: '+91 7666104889' },
    whatsapp: { type: String, default: '+91 7666104889' },
    address: {
      type: String,
      default: 'Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028, India',
    },
    googleMapsEmbedUrl: {
      type: String,
      default: 'https://maps.google.com/?q=St+Joseph+Engineering+College+Vamanjoor+Mangaluru',
    },
    workingHours: {
      weekday: { type: String, default: '09:00 AM - 08:00 PM' },
      saturday: { type: String, default: '09:30 AM - 07:00 PM' },
      sunday: { type: String, default: '10:00 AM - 02:00 PM' },
    },
    isDoorstepServiceEnabled: { type: Boolean, default: true },
    isAIAssistantEnabled: { type: Boolean, default: true },
    isOnlinePaymentsEnabled: { type: Boolean, default: false },
    standardGSTPercentage: { type: Number, default: 18 },
  },
  { timestamps: true }
);

export const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);
