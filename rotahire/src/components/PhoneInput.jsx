'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Top 50 countries by usage for job applications
const COUNTRIES = [
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰', iso: 'LK' },
  { code: '+1', name: 'United States', flag: '🇺🇸', iso: 'US' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧', iso: 'GB' },
  { code: '+91', name: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '+971', name: 'UAE', flag: '🇦🇪', iso: 'AE' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', iso: 'SG' },
  { code: '+61', name: 'Australia', flag: '🇦🇺', iso: 'AU' },
  { code: '+81', name: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '+86', name: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '+49', name: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '+33', name: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '+39', name: 'Italy', flag: '🇮🇹', iso: 'IT' },
  { code: '+34', name: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '+7', name: 'Russia', flag: '🇷🇺', iso: 'RU' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', iso: 'KR' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭', iso: 'TH' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾', iso: 'MY' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭', iso: 'PH' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', iso: 'NZ' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬', iso: 'EG' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', iso: 'ZA' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪', iso: 'KE' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', iso: 'MX' },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', iso: 'BR' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷', iso: 'AR' },
  { code: '+56', name: 'Chile', flag: '🇨🇱', iso: 'CL' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹', iso: 'PT' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', iso: 'NL' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', iso: 'SE' },
  { code: '+47', name: 'Norway', flag: '🇳🇴', iso: 'NO' },
  { code: '+358', name: 'Finland', flag: '🇫🇮', iso: 'FI' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰', iso: 'DK' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭', iso: 'CH' },
  { code: '+43', name: 'Austria', flag: '🇦🇹', iso: 'AT' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪', iso: 'BE' },
  { code: '+48', name: 'Poland', flag: '🇵🇱', iso: 'PL' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿', iso: 'CZ' },
  { code: '+30', name: 'Greece', flag: '🇬🇷', iso: 'GR' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷', iso: 'TR' },
  { code: '+972', name: 'Israel', flag: '🇮🇱', iso: 'IL' },
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦', iso: 'QA' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼', iso: 'KW' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭', iso: 'BH' },
  { code: '+968', name: 'Oman', flag: '🇴🇲', iso: 'OM' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳', iso: 'VN' }
];

// Props: { value, onChange, disabled, error }
// Country code selector with phone number input
export default function PhoneInput({ value = '', onChange, disabled = false, error = '' }) {
  const [countryCode, setCountryCode] = useState('+94');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Parse existing value if provided
    if (value) {
      const country = COUNTRIES.find(c => value.startsWith(c.code));
      if (country) {
        setCountryCode(country.code);
        setPhoneNumber(value.substring(country.code.length));
      }
    }
  }, [value]);

  const handleCountryChange = (newCode) => {
    setCountryCode(newCode);
    onChange?.(newCode + phoneNumber);
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value.replace(/\D/g, ''); // Only digits
    setPhoneNumber(newPhone);
    onChange?.(countryCode + newPhone);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone-input">Mobile Number</Label>
      <div className="flex gap-2">
        <Select
          value={countryCode}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-32 bg-white border-gray-300">
            <SelectValue>
              {COUNTRIES.find(c => c.code === countryCode)?.flag} {countryCode}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-64 bg-white">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.iso} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-gray-500">{country.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          id="phone-input"
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder="712345678"
          disabled={disabled}
          className={`flex-1 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
