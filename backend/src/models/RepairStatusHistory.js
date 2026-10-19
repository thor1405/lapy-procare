import mongoose from 'mongoose';
import { REPAIR_STATUS } from '../config/constants.js';

const repairStatusHistorySchema = new mongoose.Schema(
  {
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
    fromStatus: {
      type: String,
      enum: [...Object.values(REPAIR_STATUS), 'None'],
      default: 'None',
    },
    toStatus: {
      type: String,
      enum: Object.values(REPAIR_STATUS),
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    changedByName: {
      type: String,
      default: 'System',
    },
  },
  { timestamps: true }
);

export const RepairStatusHistory = mongoose.model('RepairStatusHistory', repairStatusHistorySchema);
