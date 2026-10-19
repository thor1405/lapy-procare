import mongoose from 'mongoose';
import { PC_BUILD_USE_CASES } from '../config/constants.js';

const customPCBuildSchema = new mongoose.Schema(
  {
    buildName: {
      type: String,
      default: 'My Custom PC Build',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    useCase: {
      type: String,
      enum: PC_BUILD_USE_CASES,
      default: 'Gaming',
    },
    budgetTier: {
      type: String,
      default: 'Mid-Range (₹60,000 - ₹1,00,000)',
    },
    components: {
      processor: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      motherboard: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      ram: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      graphicsCard: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      storage: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      powerSupply: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      cabinet: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
      cooling: { type: mongoose.Schema.Types.ObjectId, ref: 'PCComponent' },
    },
    totalEstimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedWattage: {
      type: Number,
      default: 0,
    },
    compatibilityStatus: {
      isCompatible: { type: Boolean, default: true },
      issues: [{ type: String }],
    },
    status: {
      type: String,
      enum: ['Saved', 'Quote Requested', 'Approved', 'Building', 'Delivered'],
      default: 'Saved',
    },
    customerNotes: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const CustomPCBuild = mongoose.model('CustomPCBuild', customPCBuildSchema);
