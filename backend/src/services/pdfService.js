import PDFDocument from 'pdfkit';

/**
 * Generate a PDF for an Invoice or Quotation
 * @param {'INVOICE' | 'QUOTATION'} type
 * @param {Object} documentData
 * @param {import('stream').Writable} resStream
 */
export const generateDocumentPDF = (type, data, resStream) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(resStream);

  const isInvoice = type === 'INVOICE';
  const docTitle = isInvoice ? 'TAX INVOICE' : 'ESTIMATE / QUOTATION';
  const docNumber = isInvoice ? data.invoiceNumber : data.quotationNumber;

  // Header Background Accent Bar
  doc.rect(0, 0, 595.28, 12).fill('#00AFFF');

  // Header Title
  doc.fillColor('#050B18').fontSize(22).font('Helvetica-Bold').text('LAPY PROCARE', 40, 30);
  doc.fontSize(9).font('Helvetica').fillColor('#64748B')
    .text('Expert Computer Repairs & Enterprise IT Services', 40, 56)
    .text('Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028', 40, 68)
    .text('Phone / WhatsApp: +91 7666104889 | Email: lapyprocare@gmail.com', 40, 80);

  // Document Badge
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#007BFF').text(docTitle, 380, 30, { align: 'right' });
  doc.fontSize(10).font('Helvetica').fillColor('#334155')
    .text(`Doc #: ${docNumber}`, 380, 52, { align: 'right' })
    .text(`Ticket Ref: ${data.ticketId}`, 380, 66, { align: 'right' })
    .text(`Date: ${new Date(data.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 380, 80, { align: 'right' });

  // Divider Line
  doc.moveTo(40, 100).lineTo(555, 100).strokeColor('#E2E8F0').lineWidth(1).stroke();

  // Billed To / Customer Section
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A').text('CUSTOMER DETAILS:', 40, 115);
  doc.font('Helvetica').fillColor('#334155');
  const customerName = data.customer?.name || data.billingDetails?.name || 'Customer';
  const customerEmail = data.customer?.email || data.billingDetails?.email || '';
  const customerPhone = data.customer?.phone || data.billingDetails?.phone || '';
  const customerAddr = data.billingDetails?.address || 'Mangaluru, Karnataka';

  doc.text(`Name: ${customerName}`, 40, 130);
  doc.text(`Phone: ${customerPhone}`, 40, 144);
  doc.text(`Email: ${customerEmail}`, 40, 158);
  doc.text(`Address: ${customerAddr}`, 40, 172);

  // Status Box
  doc.rect(380, 115, 175, 60).fillAndStroke('#F8FAFC', '#E2E8F0');
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(10).text('STATUS SUMMARY', 390, 125);
  doc.font('Helvetica').fontSize(9).fillColor('#475569');
  if (isInvoice) {
    doc.text(`Payment Status: ${data.paymentStatus}`, 390, 140);
    doc.text(`Payment Mode: ${data.paymentMethod || 'Cash / UPI'}`, 390, 154);
  } else {
    doc.text(`Approval Status: ${data.status}`, 390, 140);
    doc.text(`Valid Until: ${new Date(data.expiresAt).toLocaleDateString('en-IN')}`, 390, 154);
  }

  // Items Table Header
  const tableTop = 205;
  doc.rect(40, tableTop, 515, 24).fill('#0F172A');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
  doc.text('#', 50, tableTop + 7);
  doc.text('DESCRIPTION / PART', 80, tableTop + 7);
  doc.text('TYPE', 310, tableTop + 7);
  doc.text('QTY', 370, tableTop + 7);
  doc.text('RATE (₹)', 420, tableTop + 7);
  doc.text('AMOUNT (₹)', 485, tableTop + 7);

  // Items Rows
  let y = tableTop + 24;
  const items = data.items || [];
  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.rect(40, y, 515, 20).fill('#F8FAFC');
    }
    doc.fillColor('#1E293B').font('Helvetica').fontSize(9);
    doc.text(String(index + 1), 50, y + 5);
    doc.text(item.description || 'Service/Part', 80, y + 5, { width: 220, ellipsis: true });
    doc.text(item.itemType || 'Service', 310, y + 5);
    doc.text(String(item.quantity || 1), 370, y + 5);
    doc.text(Number(item.unitPrice || 0).toLocaleString('en-IN'), 420, y + 5);
    doc.text(Number(item.amount || 0).toLocaleString('en-IN'), 485, y + 5);
    y += 20;
  });

  // Table bottom border
  doc.moveTo(40, y + 5).lineTo(555, y + 5).strokeColor('#CBD5E1').stroke();
  y += 15;

  // Totals Section
  const totalsLeft = 360;
  doc.fontSize(9).font('Helvetica').fillColor('#475569');
  doc.text('Labour Charges:', totalsLeft, y);
  doc.text(`₹${Number(data.labourCharges || 0).toLocaleString('en-IN')}`, 490, y);
  y += 16;

  doc.text('Spare Parts Total:', totalsLeft, y);
  doc.text(`₹${Number(data.sparePartCharges || 0).toLocaleString('en-IN')}`, 490, y);
  y += 16;

  if (data.discount > 0) {
    doc.text('Special Discount:', totalsLeft, y);
    doc.text(`- ₹${Number(data.discount).toLocaleString('en-IN')}`, 490, y);
    y += 16;
  }

  doc.text(`GST Tax (${data.taxRate || 18}%):`, totalsLeft, y);
  doc.text(`₹${Number(data.taxAmount || 0).toLocaleString('en-IN')}`, 490, y);
  y += 20;

  // Grand Total Highlight Bar
  doc.rect(totalsLeft - 10, y, 205, 28).fill('#007BFF');
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11);
  doc.text('GRAND TOTAL:', totalsLeft, y + 8);
  doc.text(`₹${Number(data.totalAmount || 0).toLocaleString('en-IN')}`, 470, y + 8);
  y += 45;

  // Diagnosis / Notes
  if (data.diagnosis) {
    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9).text('ENGINEER DIAGNOSIS & REMARKS:', 40, y);
    doc.font('Helvetica').fillColor('#334155').fontSize(9).text(data.diagnosis, 40, y + 14, { width: 515 });
    y += 35;
  }

  // Terms & Conditions Footer
  doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(8).text('TERMS & CONDITIONS:', 40, y);
  doc.font('Helvetica').fillColor('#64748B').fontSize(8);
  const termsText = isInvoice
    ? (data.terms || 'All repairs carry 30 days service warranty. Physical or liquid damage voids warranty.')
    : (data.termsAndConditions || 'Quotation valid for 7 days. Approval is required before repair commencement.');
  doc.text(termsText, 40, y + 12, { width: 515 });

  doc.end();
};
