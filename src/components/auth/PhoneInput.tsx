
import React from 'react';
import { Input } from '../ui/input';

interface PhoneInputProps {
  phoneNumber: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

export const PhoneInput = ({ phoneNumber, onChange, disabled }: PhoneInputProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Numer telefonu</label>
      <div className="flex border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-3 py-2 text-gray-700 border-r">+48</div>
        <Input 
          type="tel" 
          placeholder="123 456 789" 
          className="flex-1 px-3 py-2 focus:outline-none border-0 text-gray-900" 
          value={phoneNumber}
          onChange={onChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
