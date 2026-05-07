/**
 * Razorpay Checkout Helper
 * Uses the Razorpay Checkout.js script loaded in index.html
 */

const RAZORPAY_KEY_ID = 'rzp_test_Sj0AyHVKS3wjql';

/**
 * Opens Razorpay Checkout modal
 * @param {Object} options
 * @param {string} options.orderId - Razorpay Order ID from backend
 * @param {number} options.amount - Amount in paise (smallest currency unit)
 * @param {string} options.currency - Currency code (e.g., 'INR')
 * @param {string} options.policyName - Name of the policy being purchased
 * @param {string} options.userName - Current user's name/username
 * @param {string} options.userEmail - Current user's email (optional)
 * @param {string} options.userPhone - Current user's phone (optional)
 * @param {Function} options.onSuccess - Callback on successful payment
 * @param {Function} options.onFailure - Callback on payment failure
 */
export const openRazorpayCheckout = ({
  orderId,
  amount,
  currency = 'INR',
  policyName = 'Insurance Policy',
  userName = '',
  userEmail = '',
  userPhone = '',
  onSuccess,
  onFailure,
}) => {
  if (!window.Razorpay) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount, // Amount in paise
    currency: currency,
    name: 'SmartSure Insurance',
    description: `Purchase: ${policyName}`,
    order_id: orderId,
    handler: function (response) {
      // response.razorpay_payment_id
      // response.razorpay_order_id
      // response.razorpay_signature
      if (onSuccess) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      }
    },
    prefill: {
      name: userName,
      email: userEmail,
      contact: userPhone,
    },
    theme: {
      color: '#6366f1',
      backdrop_color: 'rgba(15, 23, 42, 0.8)',
    },
    modal: {
      ondismiss: function () {
        if (onFailure) {
          onFailure('Payment cancelled by user');
        }
      },
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response) {
    if (onFailure) {
      onFailure(response.error?.description || 'Payment failed');
    }
  });
  rzp.open();
};

export default openRazorpayCheckout;
