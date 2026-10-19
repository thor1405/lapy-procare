import mongoose from 'mongoose';

const technicianProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    specialization: [{ type: String }],
    experienceYears: {
      type: Number,
      default: 2,
    },
    bio: {
      type: String,
      default: '',
    },
    activeRepairsCount: {
      type: Number,
      default: 0,
    },
    totalRepairsCompleted: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const TechnicianProfile = mongoose.model('TechnicianProfile', technicianProfileSchema);
