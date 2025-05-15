
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Control } from 'react-hook-form';

interface EmailInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
}

export function EmailInput({ 
  control, 
  name, 
  label = "Email", 
  placeholder = "Digite seu email" 
}: EmailInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              type={name.includes('email') ? "email" : "text"}
              autoCapitalize="none"
              autoComplete={name.includes('email') ? "email" : name}
              autoCorrect="off"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
