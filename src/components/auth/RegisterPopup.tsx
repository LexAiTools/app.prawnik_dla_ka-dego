
import React, { useState } from 'react';
import { X, Phone, Check } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { PhoneInput } from './PhoneInput';
import { VerificationInput } from './VerificationInput';
import { handlePhoneInputChange, handleVerificationCodeChange, sendVerificationCode, verifyCode } from './authUtils';
import { useUserStore } from '@/stores/userStore';

interface RegisterPopupProps {
  showRegisterPopup: boolean;
  setShowRegisterPopup: (show: boolean) => void;
  setShowLoginPopup: (show: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  verificationSent: boolean;
  setVerificationSent: (sent: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const RegisterPopup = ({
  showRegisterPopup,
  setShowRegisterPopup,
  setShowLoginPopup,
  phoneNumber,
  setPhoneNumber,
  verificationCode,
  setVerificationCode,
  verificationSent,
  setVerificationSent,
  setIsLoggedIn
}: RegisterPopupProps) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDataProcessing, setAcceptDataProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setStorePhoneNumber = useUserStore(state => state.setPhoneNumber);

  if (!showRegisterPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-sm w-full mx-4">
        <div className="bg-blue-700 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold">Utwórz konto</h3>
          <button onClick={() => setShowRegisterPopup(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">Zarejestruj się używając swojego numeru telefonu:</p>
          
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
          
          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                disabled={isLoading}
              />
              <label 
                htmlFor="terms" 
                className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Akceptuję <a 
                  href="https://info.lexai.tools/regulamin/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  regulamin
                </a> usługi
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="privacy" 
                checked={acceptDataProcessing}
                onCheckedChange={(checked) => setAcceptDataProcessing(checked === true)}
                disabled={isLoading}
              />
              <label 
                htmlFor="privacy" 
                className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Wyrażam zgodę na <a 
                  href="https://info.lexai.tools/polityka-prywatnosci/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  przetwarzanie danych
                </a>
              </label>
            </div>
          </div>
          
          {verificationSent ? (
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => verifyCode(
                phoneNumber,
                verificationCode,
                setIsLoggedIn,
                setStorePhoneNumber,
                () => setShowRegisterPopup(false),
                setIsLoading
              )}
              disabled={!acceptTerms || !acceptDataProcessing || isLoading}
            >
              <div className="flex items-center justify-center">
                <span>{isLoading ? 'Weryfikacja...' : 'Utwórz konto'}</span>
                {!isLoading && <Check size={16} className="ml-2" />}
              </div>
            </button>
          ) : (
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => sendVerificationCode(phoneNumber, setVerificationSent, setIsLoading)}
              disabled={!acceptTerms || !acceptDataProcessing || isLoading}
            >
              <div className="flex items-center justify-center">
                <span>{isLoading ? 'Wysyłanie...' : 'Wyślij kod SMS'}</span>
                {!isLoading && <Phone size={16} className="ml-2" />}
              </div>
            </button>
          )}
          
          <p className="text-xs text-center mt-4">
            Masz już konto? <button 
              className="text-blue-600 font-medium"
              onClick={() => {
                setShowRegisterPopup(false);
                setShowLoginPopup(true);
                setVerificationSent(false);
                setVerificationCode("");
              }}
            >
              Zaloguj się
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
