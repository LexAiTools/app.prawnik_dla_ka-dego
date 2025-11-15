
import React, { useState } from 'react';
import { X, Phone, ArrowRight } from 'lucide-react';
import { PhoneInput } from './PhoneInput';
import { VerificationInput } from './VerificationInput';
import { handlePhoneInputChange, handleVerificationCodeChange, sendVerificationCode, verifyCode } from './authUtils';
import { useUserStore } from '@/stores/userStore';

interface LoginPopupProps {
  showLoginPopup: boolean;
  setShowLoginPopup: (show: boolean) => void;
  setShowRegisterPopup: (show: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  verificationSent: boolean;
  setVerificationSent: (sent: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const LoginPopup = ({
  showLoginPopup,
  setShowLoginPopup,
  setShowRegisterPopup,
  phoneNumber,
  setPhoneNumber,
  verificationCode,
  setVerificationCode,
  verificationSent,
  setVerificationSent,
  setIsLoggedIn
}: LoginPopupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const setStorePhoneNumber = useUserStore(state => state.setPhoneNumber);

  if (!showLoginPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-sm w-full mx-4">
        <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold">Logowanie</h3>
          <button onClick={() => setShowLoginPopup(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Zaloguj się używając swojego numeru telefonu:</p>
          
          <PhoneInput 
            phoneNumber={phoneNumber}
            onChange={(e) => handlePhoneInputChange(e, setPhoneNumber)}
            disabled={verificationSent || isLoading}
          />
          
          {verificationSent && (
            <VerificationInput 
              verificationCode={verificationCode}
              onChange={(e) => handleVerificationCodeChange(e, setVerificationCode)}
              disabled={isLoading}
            />
          )}
          
          {verificationSent ? (
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => verifyCode(
                phoneNumber,
                verificationCode,
                setIsLoggedIn,
                setStorePhoneNumber,
                () => setShowLoginPopup(false),
                setIsLoading
              )}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center">
                <span>{isLoading ? 'Weryfikacja...' : 'Zaloguj się'}</span>
                {!isLoading && <ArrowRight size={16} className="ml-2" />}
              </div>
            </button>
          ) : (
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => sendVerificationCode(phoneNumber, setVerificationSent, setIsLoading)}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center">
                <span>{isLoading ? 'Wysyłanie...' : 'Wyślij kod SMS'}</span>
                {!isLoading && <Phone size={16} className="ml-2" />}
              </div>
            </button>
          )}
          
          <p className="text-xs text-center mt-4">
            Nie masz konta? <button 
              className="text-blue-600 font-medium"
              onClick={() => {
                setShowLoginPopup(false);
                setShowRegisterPopup(true);
                setVerificationSent(false);
                setVerificationCode("");
              }}
            >
              Zarejestruj się
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
