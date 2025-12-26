# Paystack Integration Plan

## Recommendation: Backend Link Generation

**Recommended Approach: Backend generates Paystack payment link**

### Why Backend Link Generation?

1. **Security**
   - Secret keys stay on backend (never exposed to frontend)
   - Payment amounts validated server-side
   - Prevents tampering with payment data
   - Better PCI DSS compliance

2. **Idempotency**
   - Backend can generate unique transaction references
   - Prevents duplicate payments
   - Better transaction tracking
   - Easier reconciliation

3. **Control**
   - Backend can validate donation basket before payment
   - Can check recipient availability
   - Can enforce business rules
   - Better error handling

4. **Webhook Handling**
   - Backend can securely handle Paystack webhooks
   - Update donation status automatically
   - Handle failed payments
   - Better audit trail

### Implementation Flow

1. **Frontend**: User clicks "Pay with Card"
2. **Frontend**: Calls backend API `/donations/initiate-payment`
3. **Backend**: 
   - Validates donation basket
   - Creates donation record (status: pending)
   - Generates Paystack payment link
   - Returns payment link + donation ID
4. **Frontend**: Redirects user to Paystack checkout
5. **Paystack**: User completes payment
6. **Paystack**: Redirects back to frontend with reference
7. **Frontend**: Calls backend `/donations/verify-payment`
8. **Backend**: Verifies with Paystack API
9. **Backend**: Updates donation status
10. **Webhook**: Paystack sends webhook (backup verification)
11. **Backend**: Final status update

### Backend API Endpoints Needed

```typescript
POST /donations/initiate-payment
Body: {
  basket: DonationBasket,
  paymentMethod: 'paystack'
}
Response: {
  donationId: string,
  paymentLink: string, // Paystack checkout URL
  reference: string // Unique transaction reference
}

POST /donations/verify-payment
Body: {
  donationId: string,
  reference: string // From Paystack redirect
}
Response: {
  status: 'completed' | 'failed',
  donation: Donation
}

POST /donations/webhook/paystack
// Handles Paystack webhook callbacks
```

### Security Considerations

1. **Idempotency Key**: Use donation ID + timestamp
2. **Amount Validation**: Always verify on backend
3. **Webhook Signature**: Verify Paystack webhook signatures
4. **Rate Limiting**: Prevent payment spam
5. **Transaction Logging**: Log all payment attempts

### Frontend Implementation

```typescript
// In PaymentPage.tsx
const handlePaystackPayment = async () => {
  const response = await donationService.initiatePayment({
    basket: basket,
    paymentMethod: 'paystack'
  });
  
  // Redirect to Paystack checkout
  window.location.href = response.data.paymentLink;
};

// After Paystack redirect
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('reference');
  const donationId = urlParams.get('donation_id');
  
  if (reference && donationId) {
    verifyPayment(donationId, reference);
  }
}, []);
```

### Alternative: Frontend Integration (Not Recommended)

If using frontend integration:
- Requires exposing public key only (acceptable)
- But still need backend for verification
- Less control over payment flow
- Harder to ensure idempotency
- More complex error handling

**Conclusion**: Backend link generation is the better approach for security, control, and maintainability.



