import mongoose from 'mongoose';
import { REPAIR_STATUS, DEVICE_TYPES, SERVICE_PREFERENCE } from '../config/constants.js';

const noteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'Staff' },
  createdAt: { type: Date, default: Date.now },
});

const repairBookingSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    device: {
      deviceType: {
        type: String,
        enum: Object.values(DEVICE_TYPES),
        required: true,
      },
      brand: { type: String, required: true, trim: true },
      model: { type: String, required: true, trim: true },
      serialNumber: { type: String, trim: true, default: '' },
      deviceAge: { type: String, default: '' },
    },
    problem: {
      category: { type: String, required: true },
      description: { type: String, required: true },
    },
    photos: [{ type: String }],
    servicePreference: {
      type: String,
      enum: Object.values(SERVICE_PREFERENCE),
      default: SERVICE_PREFERENCE.DROP_OFF,
    },
    doorstepAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Mangaluru' },
      postalCode: { type: String, default: '575028' },
    },
    appointment: {
      date: { type: Date, required: true },
      timeSlot: { type: String, required: true },
    },
    status: {
      type: String,
      enum: Object.values(REPAIR_STATUS),
      default: REPAIR_STATUS.BOOKING_RECEIVED,
      index: true,
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    diagnosticFindings: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    estimatedCompletionDate: {
      type: Date,
      default: null,
    },
    customerNotes: [noteSchema],
    internalNotes: [noteSchema],
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const RepairBooking = mongoose.model('RepairBooking', repairBookingSchema);
