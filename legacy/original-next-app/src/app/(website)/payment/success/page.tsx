'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/atoms/Button';
import { cn } from '@/utils/cn';
import { gtagTrackConversion, CONVERSION_LABELS } from '@/utils/googleAds';

interface ReceiptData {
  receiptNumber: string;
  transactionId: string;
  bookingId: string;
  paymentDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: {
    name: string;
    model: string;
    plateNumber: string;
  };
  service: string;
  pickupLocation: string;
  dropoffLocation: string | null;
  pickupNote?: string;
  dropoffNote?: string;
  startDate: string;
  startTime: string;
  duration: string;
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  status: string;
  stripeSessionUrl: string | null;
  invoiceUrl: string | null;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get booking_id from sessionStorage (stored before redirect to Stripe)
    const bookingId = sessionStorage.getItem('pending_booking_id');
    
    // Clean up sessionStorage after reading
    if (bookingId) {
      sessionStorage.removeItem('pending_booking_id');
    }

    if (bookingId) {
      // First, confirm payment (fallback if webhook hasn't fired)
      const confirmPayment = async () => {
        try {
          const confirmResponse = await fetch('/api/stripe/confirm-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId: bookingId,
            }),
          });

          const confirmResult = await confirmResponse.json();
          if (confirmResult.success) {
            console.log('✅ Payment confirmed:', confirmResult.message);
          } else {
            console.log('ℹ️ Payment confirmation:', confirmResult.message);
          }
        } catch (error) {
          console.error('Error confirming payment:', error);
          // Continue anyway to fetch receipt
        }
      };

      // Confirm payment first
      confirmPayment();

      // Then fetch receipt data using booking_id
      fetch(`/api/stripe/receipt?booking_id=${bookingId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReceiptData(data.data);
            
            // Track Google Ads conversion - Booking completed & payment successful
            gtagTrackConversion(CONVERSION_LABELS.SUBMIT_LEAD_FORM, {
              value: data.data.totalAmount,
              currency: data.data.currency || 'SGD',
              transaction_id: data.data.bookingId,
            });
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching receipt:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Payment Receipt - ${receiptData?.receiptNumber}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  padding: 40px;
                  background: #fff;
                  color: #1a1a2e;
                }
                .receipt-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: #fff;
                  border: 2px solid #D4AF37;
                  border-radius: 10px;
                  padding: 40px;
                }
                .header {
                  text-align: center;
                  border-bottom: 3px solid #D4AF37;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .header h1 {
                  color: #D4AF37;
                  font-size: 32px;
                  margin-bottom: 10px;
                  letter-spacing: 2px;
                }
                .header p {
                  color: #666;
                  font-size: 14px;
                }
                .receipt-title {
                  text-align: center;
                  font-size: 24px;
                  font-weight: bold;
                  color: #1a1a2e;
                  margin-bottom: 30px;
                }
                .section {
                  margin-bottom: 25px;
                }
                .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  color: #1a1a2e;
                  margin-bottom: 15px;
                  border-bottom: 1px solid #e0e0e0;
                  padding-bottom: 8px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px dotted #e0e0e0;
                }
                .info-label {
                  color: #666;
                  font-weight: 500;
                }
                .info-value {
                  color: #1a1a2e;
                  font-weight: 600;
                }
                .amount-highlight {
                  color: #D4AF37;
                  font-size: 20px;
                  font-weight: bold;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #e0e0e0;
                  text-align: center;
                  color: #666;
                  font-size: 12px;
                }
                @media print {
                  body { padding: 20px; }
                  .receipt-container { border: none; box-shadow: none; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  const handleDownloadReceipt = () => {
    if (receiptRef.current) {
      const printContent = receiptRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Payment Receipt - ${receiptData?.receiptNumber}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  padding: 40px;
                  background: #fff;
                  color: #1a1a2e;
                }
                .receipt-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background: #fff;
                  border: 2px solid #D4AF37;
                  border-radius: 10px;
                  padding: 40px;
                }
                .header {
                  text-align: center;
                  border-bottom: 3px solid #D4AF37;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .header h1 {
                  color: #D4AF37;
                  font-size: 32px;
                  margin-bottom: 10px;
                  letter-spacing: 2px;
                }
                .header p {
                  color: #666;
                  font-size: 14px;
                }
                .receipt-title {
                  text-align: center;
                  font-size: 24px;
                  font-weight: bold;
                  color: #1a1a2e;
                  margin-bottom: 30px;
                }
                .section {
                  margin-bottom: 25px;
                }
                .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  color: #1a1a2e;
                  margin-bottom: 15px;
                  border-bottom: 1px solid #e0e0e0;
                  padding-bottom: 8px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px dotted #e0e0e0;
                }
                .info-label {
                  color: #666;
                  font-weight: 500;
                }
                .info-value {
                  color: #1a1a2e;
                  font-weight: 600;
                }
                .amount-highlight {
                  color: #D4AF37;
                  font-size: 20px;
                  font-weight: bold;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #e0e0e0;
                  text-align: center;
                  color: #666;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-white">Processing your payment receipt...</p>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Receipt Not Found</h2>
          <p className="text-gray-300 mb-6">We couldn't find the receipt information. Please contact support.</p>
          <Button onClick={() => router.push('/')} variant="primary">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-navy via-deep-navy to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-300 text-lg">Your booking deposit has been confirmed</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8" ref={receiptRef}>
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-deep-navy via-deep-navy to-gray-900 p-8 text-center border-b-4 border-luxury-gold">
            <h1 className="text-3xl font-bold text-luxury-gold mb-2" style={{ letterSpacing: '2px' }}>
              ZBK LIMOUSINE TOURS
            </h1>
            <p className="text-white/80 text-sm">Premium Luxury Transportation Services</p>
            <p className="text-white/60 text-xs mt-2">Jurong West Street 65, Singapore 640635</p>
          </div>

          <div className="p-8">
            {/* Receipt Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-deep-navy mb-2">PAYMENT RECEIPT</h2>
              <p className="text-gray-500 text-sm">Receipt Number: {receiptData.receiptNumber.substring(0, 20)}...</p>
            </div>

            {/* Payment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-deep-navy mb-4 pb-2 border-b border-gray-200">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Transaction ID:</span>
                  <span className="text-deep-navy font-semibold font-mono text-sm">{receiptData.transactionId.substring(0, 30)}...</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Payment Date:</span>
                  <span className="text-deep-navy font-semibold">{formatDate(receiptData.paymentDate)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Payment Method:</span>
                  <span className="text-deep-navy font-semibold capitalize">
                    {receiptData.cardBrand ? `${receiptData.cardBrand} •••• ${receiptData.cardLast4}` : receiptData.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Payment Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold capitalize">
                    {receiptData.paymentStatus.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-deep-navy mb-4 pb-2 border-b border-gray-200">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-deep-navy font-semibold">{receiptData.customerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-deep-navy font-semibold">{receiptData.customerEmail}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-deep-navy font-semibold">{receiptData.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-deep-navy mb-4 pb-2 border-b border-gray-200">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Booking ID:</span>
                  <span className="text-deep-navy font-semibold font-mono text-sm">{receiptData.bookingId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Vehicle:</span>
                  <span className="text-deep-navy font-semibold">{receiptData.vehicle.name} ({receiptData.vehicle.model})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Service:</span>
                  <span className="text-deep-navy font-semibold">{receiptData.service.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Pickup Location:</span>
                  <div className="text-right max-w-xs">
                    <span className="text-deep-navy font-semibold block">{receiptData.pickupLocation}</span>
                    {receiptData.pickupNote && (
                      <span className="text-yellow-600 text-sm font-medium mt-1 block">📍 {receiptData.pickupNote}</span>
                    )}
                  </div>
                </div>
                {receiptData.dropoffLocation && (
                  <div className="flex justify-between items-start py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Drop-off Location:</span>
                    <div className="text-right max-w-xs">
                      <span className="text-deep-navy font-semibold block">{receiptData.dropoffLocation}</span>
                      {receiptData.dropoffNote && (
                        <span className="text-yellow-600 text-sm font-medium mt-1 block">📍 {receiptData.dropoffNote}</span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Date & Time:</span>
                  <span className="text-deep-navy font-semibold">
                    {formatDate(receiptData.startDate)} at {receiptData.startTime}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Duration:</span>
                  <span className="text-deep-navy font-semibold">{receiptData.duration}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-r from-luxury-gold/10 to-luxury-gold/5 rounded-xl p-6 mb-6 border-2 border-luxury-gold/20">
              <h3 className="text-lg font-bold text-deep-navy mb-4 pb-2 border-b border-luxury-gold/30">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Total Booking Amount:</span>
                  <span className="text-deep-navy font-semibold text-lg">
                    {receiptData.currency} {receiptData.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-luxury-gold/20 pt-3">
                  <span className="text-gray-700 font-medium">Deposit Amount (20%):</span>
                  <span className="text-luxury-gold font-bold text-xl">
                    {receiptData.currency} {receiptData.depositAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t-2 border-luxury-gold pt-3 mt-3">
                  <span className="text-deep-navy font-bold text-lg">Amount Paid:</span>
                  <span className="text-green-600 font-bold text-2xl">
                    {receiptData.currency} {receiptData.amountPaid.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 pt-2">
                  <span className="text-gray-600 text-sm">Remaining Balance:</span>
                  <span className="text-gray-700 font-semibold">
                    {receiptData.currency} {(receiptData.totalAmount - receiptData.amountPaid).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm mb-2">
                <strong className="text-luxury-gold">✓</strong> A confirmation email has been sent to your email address.
              </p>
              <p className="text-gray-500 text-xs">
                This receipt serves as proof of payment. Please keep it for your records.
              </p>
              {receiptData.invoiceUrl && (
                <a
                  href={receiptData.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-luxury-gold hover:underline text-sm mt-2 inline-block"
                >
                  View Stripe Invoice →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={handlePrintReceipt}
            variant="primary"
            size="large"
            className="bg-luxury-gold hover:bg-luxury-gold/90"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Receipt
          </Button>
          <Button
            onClick={handleDownloadReceipt}
            variant="ghost"
            size="large"
            className="text-white hover:bg-white/10 border border-white/20"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Receipt
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            size="large"
            className="text-white hover:bg-white/10"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => router.push(`/booking/confirmation?bookingId=${receiptData.bookingId}`)}
            variant="ghost"
            size="large"
            className="text-white hover:bg-white/10"
          >
            View Booking Details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-deep-navy flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

