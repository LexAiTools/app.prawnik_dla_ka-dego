
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const handlePhoneInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setPhoneNumber: (value: string) => void
) => {
  const value = e.target.value.replace(/\D/g, '');
  setPhoneNumber(value);
};

export const handleVerificationCodeChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setVerificationCode: (value: string) => void
) => {
  const value = e.target.value.replace(/\D/g, '');
  setVerificationCode(value);
};

export const sendVerificationCode = async (
  phoneNumber: string,
  setVerificationSent: (sent: boolean) => void,
  setIsLoading: (loading: boolean) => void
) => {
  if (!phoneNumber || phoneNumber.length < 9) {
    toast.error('Wprowadź poprawny numer telefonu');
    return;
  }

  try {
    setIsLoading(true);
    const formattedPhone = `+48${phoneNumber}`;
    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      // Sprawdź, czy to błąd dostawcy telefonu
      if (error.message.includes('phone provider') || error.code === 'phone_provider_disabled') {
        toast.error('Uwierzytelnianie przez SMS jest obecnie niedostępne. Skontaktuj się z administratorem.');
        console.error('Phone provider error:', error);
        return;
      }
      throw error;
    }

    setVerificationSent(true);
    toast.success('Kod weryfikacyjny został wysłany');
  } catch (error) {
    console.error('Error sending verification code:', error);
    toast.error('Błąd podczas wysyłania kodu weryfikacyjnego');
  } finally {
    setIsLoading(false);
  }
};

export const verifyCode = async (
  phoneNumber: string,
  verificationCode: string,
  setIsLoggedIn: (isLoggedIn: boolean) => void,
  setStorePhoneNumber: (phoneNumber: string) => void,
  closePopup: () => void,
  setIsLoading: (loading: boolean) => void
) => {
  if (!verificationCode || verificationCode.length < 6) {
    toast.error('Wprowadź poprawny kod weryfikacyjny');
    return;
  }

  try {
    setIsLoading(true);
    const formattedPhone = `+48${phoneNumber}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: verificationCode,
      type: 'sms'
    });

    if (error) throw error;

    console.log('Authentication successful:', data);
    setIsLoggedIn(true);
    setStorePhoneNumber(formattedPhone);
    localStorage.setItem('isLoggedIn', 'true');
    closePopup();
    toast.success('Zalogowano pomyślnie');
  } catch (error) {
    console.error('Error verifying code:', error);
    toast.error('Błędny kod weryfikacyjny');
  } finally {
    setIsLoading(false);
  }
};
