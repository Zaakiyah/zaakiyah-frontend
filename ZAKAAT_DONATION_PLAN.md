# Zakaat Donation Feature - Implementation Plan

## Overview
This document outlines the implementation plan for the Zakaat donation feature, following the design flow provided. The implementation will be done in phases, starting with UI/UX before full backend integration.

## Design Flow Reference
Based on the provided design, the user journey is:
1. **Zakaat Recipients List** → Browse approved recipients
2. **Recipient Profile** → View details, documents, application info
3. **Document Viewer** → View supporting documents (PDFs, images)
4. **Donation Basket** → Add/remove recipients, see selected recipients
5. **Fund Distribution Modal** → Choose equal or manual distribution
6. **Allocate Fund** → Manual allocation screen with amount inputs
7. **Amount Input** → Numeric keypad for entering amounts
8. **Payment Method** → Choose payment method (Paystack for now)
9. **Success Screen** → Confirmation after successful donation
10. **Donation History** → View past donations

## Features to Implement

### Core Features
1. **Recipients List**
   - Show approved and ready recipients
   - Filter by category/type
   - Search functionality
   - Watchlist toggle
   - Add to basket action

2. **Recipient Details**
   - Full profile information
   - Application details
   - Supporting documents viewer
   - "Why they need help" section
   - Add to basket from profile

3. **Donation Basket**
   - List of selected recipients
   - Remove recipients
   - Total amount calculation
   - Continue to distribution

4. **Fund Distribution**
   - Equal distribution option
   - Manual distribution option
   - Modal confirmation for manual distribution

5. **Manual Allocation**
   - Individual amount inputs per recipient
   - Numeric keypad for amount entry
   - Donation summary
   - Support Zaakiyah option
   - Anonymous donation toggle

6. **Payment**
   - Paystack integration (only option for now)
   - Payment confirmation
   - Success screen

7. **Donation History**
   - List of past donations
   - Filter by date/recipient
   - View donation details

8. **Watchlist**
   - Save recipients for later
   - Quick access from recipients list
   - Add/remove from watchlist

### Additional Features
- Anonymous donation toggle
- Support Zaakiyah platform option
- Currency: Naira (NGN) only for now
- Responsive design with dark mode support

## Technical Implementation

### Phase 1: Types & Data Models (Frontend)
- Create TypeScript types for:
  - Recipient
  - Donation Basket Item
  - Donation
  - Watchlist Item
  - Payment Method

### Phase 2: UI Components
1. **Pages**
   - `ZakaatRecipientsPage.tsx` - Main recipients list
   - `RecipientDetailPage.tsx` - Recipient profile/details
   - `DonationBasketPage.tsx` - Basket management
   - `AllocateFundPage.tsx` - Manual fund allocation
   - `DonationHistoryPage.tsx` - History view
   - `DocumentViewerPage.tsx` - Document viewer modal/page

2. **Components**
   - `RecipientCard.tsx` - Recipient list item
   - `BasketItem.tsx` - Basket item component
   - `AmountInput.tsx` - Numeric keypad component
   - `DistributionModal.tsx` - Equal/Manual choice modal
   - `PaymentMethodModal.tsx` - Payment method selection
   - `DonationSummary.tsx` - Summary component
   - `DocumentViewer.tsx` - PDF/image viewer

3. **Shared Components**
   - Reuse existing: `BottomSheet`, `Avatar`, `Button`, etc.

### Phase 3: State Management
- Use Zustand for:
  - Donation basket state
  - Watchlist state
  - Current donation flow state

### Phase 4: Services (Mock for now)
- Create service functions (will connect to backend later)
- Mock data for UI testing

### Phase 5: Routing
- Add routes to App.tsx
- Navigation between pages

## Design Guidelines
- Follow existing modern design system
- Use consistent spacing, colors, typography
- Support dark mode throughout
- Mobile-first responsive design
- Smooth animations and transitions
- Loading states for all async operations
- Error handling with user-friendly messages

## File Structure
```
src/
  pages/
    zakaat/
      donation/
        ZakaatRecipientsPage.tsx
        RecipientDetailPage.tsx
        DonationBasketPage.tsx
        AllocateFundPage.tsx
        DonationHistoryPage.tsx
  components/
    zakaat/
      donation/
        RecipientCard.tsx
        BasketItem.tsx
        AmountInput.tsx
        DistributionModal.tsx
        PaymentMethodModal.tsx
        DonationSummary.tsx
        DocumentViewer.tsx
  types/
    donation.types.ts
  services/
    donationService.ts (mock for now)
  store/
    donationStore.ts (Zustand)
```

## Next Steps
1. Create types
2. Build UI components in order of user flow
3. Add routing
4. Test UI flow
5. Backend integration (later phase)



