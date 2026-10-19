import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
      index: true,
    },
    movementType: {
      type: String,
      enum: ['PURCHASE_IN', 'REPAIR_CONSUMED', 'REPAIR_RETURNED', 'ADJUSTMENT', 'DAMAGED'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    repairBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepairBooking',
      default: null,
    },
    ticketId: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);
