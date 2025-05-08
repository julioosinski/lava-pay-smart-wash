
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const EmailInput = ({ value, onChange }: EmailInputProps) => {
  return (
    <div className="relative">
      <Input
        type="email"
        placeholder="Email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="pl-10"
      />
      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
};
