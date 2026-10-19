import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Send,
} from 'lucide-react';

export const CustomerQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clarification Modal State
  const [clarifyModalOpen, setClarifyModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [clarifyText, setClarifyText] = useState('');
  const [isSubmittingClarify, setIsSubmittingClarify] = useState(false);

  const fetchQuotations = () => {
    setIsLoading(true);
    api
      .get('/quotations/my')
      .then((res) => {
        setQuotations(res.data?.data?.quotations || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleApprove = async (id, num) => {
    try {
      await api.post(`/quotations/${id}/approve`);
      toast.success(`Quotation ${num} approved! Repair authorization granted.`);
      fetchQuotations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve quotation');
    }
  };

  const handleReject = async (id, num) => {
    const reason = prompt('Please provide a reason for declining this estimate:');
    if (reason === null) return;

    try {
      await api.post(`/quotations/${id}/reject`, { reason });
      toast.info(`Quotation ${num} declined.`);
      fetchQuotations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject quotation');
    }
  };

  const handleClarifySubmit = async () => {
    if (!clarifyText.trim()) return;
    setIsSubmittingClarify(true);

    try {
      await api.post(`/quotations/${selectedQuote._id}/clarify`, { query: clarifyText });
      toast.success('Your clarification request was sent to our technicians.');
      setClarifyModalOpen(false);
      fetchQuotations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit clarification');
    } finally {
      setIsSubmittingClarify(false);
    }
  };

  const handleDownloadPdf = async (id, num) => {
    try {
      const res = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation-${num}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Quotation PDF downloaded');
    } catch (err) {
      toast.error('Unable to download PDF quotation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Repair Quotations & Estimates
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Review transparent diagnostic findings, itemized spare parts, and labour charges.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <Card className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0]">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-[#111827] mb-1">No quotations pending</h3>
          <p className="text-xs max-w-sm mx-auto">
            Once our technicians complete physical diagnosis on your booked device, itemized estimates will appear here for your review and approval.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {quotations.map((quote) => {
            const isPending = quote.status === 'Pending';

            return (
              <Card key={quote._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-5">
                {/* Quotation Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-[#4F46E5]">
                        {quote.quotationNumber}
                      </span>
                      <Badge status={quote.status} />
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Ticket Ref: <strong className="text-[#111827] font-mono">{quote.ticketId}</strong> • Issued on{' '}
                      {new Date(quote.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadPdf(quote._id, quote.quotationNumber)}
                      icon={Download}
                    >
                      Download PDF
                    </Button>
                  </div>
                </div>

                {/* Diagnosis Summary */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider block">
                    Diagnostic Analysis & Required Overhaul:
                  </span>
                  <p className="text-[#334155] leading-relaxed">{quote.diagnosis}</p>
                </div>

                {/* Itemized Line Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                        <th className="pb-2 font-semibold">Description / Part</th>
                        <th className="pb-2 font-semibold">Category</th>
                        <th className="pb-2 text-center font-semibold">Qty</th>
                        <th className="pb-2 text-right font-semibold">Unit Price</th>
                        <th className="pb-2 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {quote.items?.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 text-[#111827] font-semibold">{item.description}</td>
                          <td className="py-2.5 text-[#64748B]">{item.itemType}</td>
                          <td className="py-2.5 text-center text-[#475569]">{item.quantity}</td>
                          <td className="py-2.5 text-right text-[#475569] font-mono">
                            ₹{item.unitPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 text-right text-[#4F46E5] font-mono font-semibold">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Total */}
                <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="text-[11px] text-[#64748B] space-y-0.5">
                    <p>Labour: ₹{quote.labourCharges.toLocaleString('en-IN')}</p>
                    <p>Spare Parts: ₹{quote.sparePartCharges.toLocaleString('en-IN')}</p>
                    <p>GST ({quote.taxRate}%): ₹{quote.taxAmount.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#64748B] block font-medium">Total Authorized Amount</span>
                    <span className="text-2xl font-extrabold text-[#111827] font-mono">
                      ₹{quote.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Clarification or Actions */}
                {quote.customerClarificationRequest && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                    <strong>Your Question to Techs:</strong> "{quote.customerClarificationRequest}"
                  </div>
                )}

                {isPending && (
                  <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-end gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setClarifyText('');
                        setClarifyModalOpen(true);
                      }}
                      icon={HelpCircle}
                      className="text-xs text-[#64748B] hover:text-[#111827]"
                    >
                      Ask Question / Clarify
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReject(quote._id, quote.quotationNumber)}
                      icon={XCircle}
                      className="text-xs"
                    >
                      Decline Estimate
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(quote._id, quote.quotationNumber)}
                      icon={CheckCircle2}
                      className="text-xs"
                    >
                      Authorize & Proceed
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Clarification Modal */}
      <Modal
        isOpen={clarifyModalOpen}
        onClose={() => setClarifyModalOpen(false)}
        title={`Inquire About Quotation: ${selectedQuote?.quotationNumber}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#475569]">
            Have a question about parts necessity, alternatives, or turnaround time? Submit a note directly to our lead engineer.
          </p>
          <textarea
            value={clarifyText}
            onChange={(e) => setClarifyText(e.target.value)}
            rows={4}
            placeholder="Type your question or alternative parts inquiry here..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setClarifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              isLoading={isSubmittingClarify}
              onClick={handleClarifySubmit}
              icon={Send}
            >
              Send Clarification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
