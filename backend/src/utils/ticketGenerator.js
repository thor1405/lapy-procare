import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  sequence: { type: Number, default: 0 },
});

export const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

/**
 * Generate an atomic collision-safe ticket ID in format LPC-YYYY-XXXXXX
 */
export const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const counterKey = `ticket_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = String(counter.sequence).padStart(6, '0');
  return `LPC-${year}-${paddedSequence}`;
};

/**
 * Generate an atomic collision-safe quotation ID in format QUO-YYYY-XXXXXX
 */
export const generateQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const counterKey = `quotation_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = String(counter.sequence).padStart(6, '0');
  return `QUO-${year}-${paddedSequence}`;
};

/**
 * Generate an atomic collision-safe invoice ID in format INV-YYYY-XXXXXX
 */
export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const counterKey = `invoice_${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  const paddedSequence = String(counter.sequence).padStart(6, '0');
  return `INV-${year}-${paddedSequence}`;
};
