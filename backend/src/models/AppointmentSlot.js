import mongoose from 'mongoose';

const appointmentSlotSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format YYYY-MM-DD
      required: true,
      index: true,
    },
    timeSlot: {
      type: String, // e.g. "09:30 AM - 11:00 AM"
      required: true,
    },
    maxCapacity: {
      type: Number,
      default: 4, // Up to 4 simultaneous repair drop-offs/appointments
    },
    bookedCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound unique index so slot cannot be duplicated on same date
appointmentSlotSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

export const AppointmentSlot = mongoose.model('AppointmentSlot', appointmentSlotSchema);
