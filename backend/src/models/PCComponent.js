import mongoose from 'mongoose';
import { COMPONENT_CATEGORIES } from '../config/constants.js';

const pcComponentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: COMPONENT_CATEGORIES,
      required: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    specifications: {
      socket: { type: String, default: '' }, // e.g. AM5, LGA1700
      memoryType: { type: String, default: '' }, // e.g. DDR4, DDR5
      wattage: { type: Number, default: 0 }, // TDP or PSU rating
      formFactor: { type: String, default: '' }, // e.g. ATX, Micro-ATX
      capacity: { type: String, default: '' }, // e.g. 16GB, 1TB
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
    recommendedUseCases: [{ type: String }],
  },
  { timestamps: true }
);

export const PCComponent = mongoose.model('PCComponent', pcComponentSchema);
