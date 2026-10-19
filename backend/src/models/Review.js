import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    service: {
      type: String,
      default: 'Laptop Repair',
    },
    comment: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Must be approved by admin before displaying on homepage
      index: true,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', reviewSchema);
