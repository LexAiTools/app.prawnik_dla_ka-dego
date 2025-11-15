
import React from 'react';
import { LoginPopup } from './auth/LoginPopup';
import { RegisterPopup } from './auth/RegisterPopup';

interface AuthPopupsProps {
  showLoginPopup: boolean;
  showRegisterPopup: boolean;
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

export const AuthPopups = ({ 
  showLoginPopup,
  showRegisterPopup,
  setShowLoginPopup,
  setShowRegisterPopup,
  phoneNumber,
  setPhoneNumber,
  verificationCode,
  setVerificationCode,
  verificationSent,
  setVerificationSent,
  setIsLoggedIn
}: AuthPopupsProps) => {
  return (
    <>
      <LoginPopup 
        showLoginPopup={showLoginPopup}
        setShowLoginPopup={setShowLoginPopup}
        setShowRegisterPopup={setShowRegisterPopup}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        verificationSent={verificationSent}
        setVerificationSent={setVerificationSent}
        setIsLoggedIn={setIsLoggedIn}
      />
      
      <RegisterPopup 
        showRegisterPopup={showRegisterPopup}
        setShowRegisterPopup={setShowRegisterPopup}
        setShowLoginPopup={setShowLoginPopup}
        phoneNumber={phoneNumber}
        setPhoneNumber={setPhoneNumber}
        verificationCode={verificationCode}
        setVerificationCode={setVerificationCode}
        verificationSent={verificationSent}
        setVerificationSent={setVerificationSent}
        setIsLoggedIn={setIsLoggedIn}
      />
    </>
  );
};
