
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleShow: () => void;
  label?: string; // Make label optional
}

export const PasswordInput = ({ 
  value, 
  onChange, 
  showPassword, 
  onToggleShow,
  label = "Senha" // Default value if not provided
}: PasswordInputProps) => {
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="pl-10 pr-10"
      />
      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};
