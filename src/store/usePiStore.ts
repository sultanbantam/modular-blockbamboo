import { create } from 'zustand';

interface PiUser {
  uid: string;
  username: string;
}

interface PiState {
  user: PiUser | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: () => Promise<void>;
  skipLogin: () => void;
  purchaseProfile: (profileId: string, amount: number, onSuccess: () => void, onError: (err: any) => void) => void;
}

declare global {
  interface Window {
    Pi: any;
  }
}

export const usePiStore = create<PiState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthenticating: false,
  error: null,
  skipLogin: () => {
    set({
      user: { uid: 'test_uid_123', username: 'TestBuilder' },
      isAuthenticated: true,
      isAuthenticating: false,
      error: null
    });
  },
  purchaseProfile: (profileId, amount, onSuccess, onError) => {
    // Mock purchase if not in Pi Browser
    if (typeof window === 'undefined' || !window.Pi) {
      console.log(`[Mock Purchase] Profile ${profileId} purchased for ${amount} Pi`);
      onSuccess();
      return;
    }

    try {
      window.Pi.createPayment({
        amount: amount,
        memo: `Unlock premium profile: ${profileId}`,
        metadata: { profileId },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            const res = await fetch('/api/pi/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              alert("Backend Error: " + (data.error || "Approval failed"));
              throw new Error(data.error || "Approval failed");
            }
          } catch (e: any) {
            console.error(e);
            throw e;
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            const res = await fetch('/api/pi/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              alert("Backend Error (Completion): " + (data.error || "Completion failed"));
              throw new Error(data.error || "Completion failed");
            }
            onSuccess();
          } catch (e: any) {
            console.error(e);
            throw e;
          }
        },
        onCancel: (paymentId: string) => {
          console.log('Payment cancelled', paymentId);
          onError(new Error("Payment Cancelled"));
        },
        onError: (error: any, payment: any) => {
          console.error('Payment error', error, payment);
          onError(error);
        },
      });
    } catch (e) {
      console.error("Failed to initialize payment", e);
      onError(e);
    }
  },
  login: async () => {
    set({ isAuthenticating: true, error: null });
    try {
      if (typeof window !== 'undefined' && window.Pi) {
        const scopes = ['username', 'payments'];
        const onIncompletePaymentFound = (payment: any) => {
          console.log("Incomplete payment found", payment);
          // Complete it automatically
          fetch('/api/pi/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid }),
          }).catch(console.error);
        };
        
        const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
        set({
          user: { uid: auth.user.uid, username: auth.user.username },
          isAuthenticated: true,
          isAuthenticating: false
        });
      } else {
        set({ error: "Pi SDK not loaded (Are you running in Pi Browser?)", isAuthenticating: false });
      }
    } catch (err: any) {
      console.error(err);
      set({ error: err.message || "Failed to authenticate", isAuthenticating: false });
    }
  }
}));
