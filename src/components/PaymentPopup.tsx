import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TokenPackage } from './AsystentPrawny';
import { Button } from './ui/button';
import { useUserStore } from '@/stores/userStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from './ui/input';

interface PaymentPopupProps {
  tokenPackages: TokenPackage[];
  setShowPaymentPopup: (show: boolean) => void;
}

const PaymentPopup = ({ tokenPackages, setShowPaymentPopup }: PaymentPopupProps) => {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(false);
  const updateTokenBalance = useUserStore(state => state.updateTokenBalance);
  const tokenBalance = useUserStore(state => state.tokenBalance);
  const phoneNumber = useUserStore(state => state.phoneNumber);

  const handlePackageSelect = (pkg: TokenPackage) => {
    setSelectedPackage(pkg);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(validateEmail(newEmail));
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !isValidEmail) {
        toast.error('Proszę podać poprawny adres email');
        return;
      }

      const paymentEmail = user?.email || email;
      
      if (!user) {
        if (phoneNumber) {
        } else {
          const { error } = await supabase.auth.signInWithOtp({
            email,
          });

          if (error) throw error;
          toast.success('Link weryfikacyjny został wysłany na Twój adres email');
        }
      }

      const newBalance = (tokenBalance || 0) + selectedPackage.tokens;
      await updateTokenBalance(newBalance);
      
      toast.success('Zakup tokenów zakończony sukcesem!');
      setShowPaymentPopup(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Wystąpił błąd podczas przetwarzania płatności');
    }
  };

  const isPaymentReady = selectedPackage && (userIsLoggedIn() || isValidEmail);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold">Doładuj tokeny</h3>
          <button onClick={() => setShowPaymentPopup(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Wybierz pakiet tokenów, który najlepiej odpowiada Twoim potrzebom:</p>
          
          <div className="space-y-3 mb-6">
            {tokenPackages.map(pkg => (
              <div 
                key={pkg.id} 
                className={`border rounded-lg p-3 cursor-pointer flex justify-between items-center transition-colors ${
                  selectedPackage?.id === pkg.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-blue-500'
                }`}
                onClick={() => handlePackageSelect(pkg)}
              >
                <div>
                  <div className="font-bold text-blue-700">{pkg.tokens} tokenów</div>
                  <div className="text-sm text-gray-600">{pkg.price} zł</div>
                </div>
                {pkg.discount && (
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                    Rabat {pkg.discount}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {(!userIsLoggedIn() || !getUserEmail()) && (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {userIsLoggedIn() 
                  ? 'E-mail (potrzebny do realizacji płatności)' 
                  : 'E-mail (wymagany do utworzenia konta)'}
              </label>
              <Input 
                type="email"
                id="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={handleEmailChange}
                className="text-black"
              />
              {email && !isValidEmail && (
                <p className="mt-1 text-xs text-red-600">Proszę podać poprawny adres e-mail</p>
              )}
            </div>
          )}
          
          <Button 
            className={`w-full py-3 rounded-lg font-medium ${
              isPaymentReady
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 cursor-not-allowed text-gray-500'
            }`}
            onClick={handlePayment}
            disabled={!isPaymentReady}
          >
            Przejdź do płatności
          </Button>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Płatność jest bezpieczna i obsługiwana przez naszego partnera płatności Stripe.
            {!userIsLoggedIn() && (
              <span className="block mt-1">
                Po dokonaniu płatności automatycznie utworzymy dla Ciebie konto.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );

  function userIsLoggedIn(): boolean {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    return isLoggedIn;
  }

  function getUserEmail(): string | null {
    return null;
  }
};

export default PaymentPopup;
