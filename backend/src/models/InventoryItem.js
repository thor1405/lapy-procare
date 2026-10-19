import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Spare Parts',
      index: true,
    },
    supplier: {
      type: String,
      default: 'Authorized IT Supplier',
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    reorderThreshold: {
      type: Number,
      default: 3,
    },
    location: {
      type: String,
      default: 'Shelf A-1, Vamanjoor Service Center',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
