
import React from 'react';
import { Input } from '../ui/input';

interface VerificationInputProps {
  verificationCode: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const VerificationInput = ({ verificationCode, onChange, disabled }: VerificationInputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Kod weryfikacyjny</label>
      <Input 
        type="text" 
        placeholder="Wpisz kod z SMS" 
        className="w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" 
        value={verificationCode}
        onChange={onChange}
        disabled={disabled}
      />
      <p className="text-xs text-gray-500 mt-1">
        Kod weryfikacyjny został wysłany na Twój numer telefonu.
      </p>
    </div>
  );
};
