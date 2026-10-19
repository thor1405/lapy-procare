import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Wrench',
    },
    category: {
      type: String,
      required: true,
      default: 'Hardware',
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    startingPrice: {
      type: Number,
      required: true,
      default: 299,
    },
    estimatedTime: {
      type: String,
      default: '2 - 4 Hours',
    },
    features: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
