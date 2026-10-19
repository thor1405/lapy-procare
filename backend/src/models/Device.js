import mongoose from 'mongoose';
import { DEVICE_TYPES } from '../config/constants.js';

const deviceSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceType: {
      type: String,
      enum: Object.values(DEVICE_TYPES),
      default: DEVICE_TYPES.LAPTOP,
      required: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
    },
    deviceAge: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Device = mongoose.model('Device', deviceSchema);
