
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface UserState {
  tokenBalance: number | null;
  isLoading: boolean;
  phoneNumber: string | null;
  email: string | null;
  fetchTokenBalance: () => Promise<void>;
  updateTokenBalance: (newBalance: number) => Promise<void>;
  setPhoneNumber: (phone: string | null) => void;
  setEmail: (email: string | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  tokenBalance: null,
  isLoading: false,
  phoneNumber: null,
  email: null,
  fetchTokenBalance: async () => {
    try {
      set({ isLoading: true });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ tokenBalance: null });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('token_balance, phone_number')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        set({ 
          tokenBalance: profile.token_balance,
          phoneNumber: profile.phone_number,
          email: user.email
        });
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updateTokenBalance: async (newBalance: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ token_balance: newBalance })
        .eq('id', user.id);

      set({ tokenBalance: newBalance });
    } catch (error) {
      console.error('Error updating token balance:', error);
    }
  },
  setPhoneNumber: (phone: string | null) => set({ phoneNumber: phone }),
  setEmail: (email: string | null) => set({ email })
}));
