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
  authMethod: 'pi' | 'bamboochain' | null;
  bmcBalance: number;
  login: () => Promise<void>;
  skipLogin: () => void;
  loginWithBaMbooChain: () => void;
  purchaseProfile: (profileId: string, amount: number, onSuccess: () => void, onError: (err: any) => void) => void;
}

declare global {
  interface Window {
    Pi: any;
  }
}

export const usePiStore = create<PiState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthenticating: false,
  error: null,
  authMethod: null,
  bmcBalance: 0,
  skipLogin: () => {
    set({
      user: { uid: 'test_uid_123', username: 'TestBuilder' },
      isAuthenticated: true,
      isAuthenticating: false,
      error: null,
      authMethod: 'pi'
    });
  },
  loginWithBaMbooChain: () => {
    set({ isAuthenticating: true, error: null });
    // Simulate SSO Redirect & Token Callback
    setTimeout(() => {
      set({
        user: { uid: 'bmc_user_999', username: 'BambooBuilder' },
        isAuthenticated: true,
        isAuthenticating: false,
        authMethod: 'bamboochain',
        bmcBalance: 100 // Give 100 BMC for testing
      });
    }, 1500);
  },
  purchaseProfile: (profileId, amount, onSuccess, onError) => {
    const { authMethod, bmcBalance } = get();

    if (authMethod === 'bamboochain') {
      console.log(`[BaMbooChain] Processing payment for ${profileId} - Amount: ${amount} BMC`);
      if (bmcBalance < amount) {
        onError(new Error("Insufficient BMC Balance"));
        return;
      }
      // Simulate network request
      setTimeout(() => {
        set({ bmcBalance: bmcBalance - amount });
        console.log(`[BaMbooChain] Payment successful. Remaining BMC: ${bmcBalance - amount}`);
        onSuccess();
      }, 1000);
      return;
    }

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
          isAuthenticating: false,
          authMethod: 'pi'
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
