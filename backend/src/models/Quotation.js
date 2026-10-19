import mongoose from 'mongoose';
import { QUOTATION_STATUS } from '../config/constants.js';

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  itemType: {
    type: String,
    enum: ['Labour', 'Spare Part', 'Service', 'Other'],
    default: 'Spare Part',
  },
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  partId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', default: null },
});

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepairBooking',
      required: true,
      index: true,
    },
    ticketId: {
      type: String,
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    items: [quotationItemSchema],
    labourCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    sparePartCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 18, // 18% GST standard in India for IT services
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(QUOTATION_STATUS),
      default: QUOTATION_STATUS.PENDING,
      index: true,
    },
    validityDays: {
      type: Number,
      default: 7,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
    customerClarificationRequest: { type: String, default: '' },
    termsAndConditions: {
      type: String,
      default: '1. Quotation valid for 7 days from date of issue. 2. 30 days replacement warranty on selected original spare parts. 3. Physical or liquid damage after repair voids warranty.',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const Quotation = mongoose.model('Quotation', quotationSchema);
