import { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber } from "@/lib/format-utils"; // Create this utility function in a utils file

interface CustomInputProps {
  form: any;
  name: "phone";
  label: string;
  placeholder: string;
}

export const CustomPhoneInput = ({
  form,
  name,
  label,
  placeholder,
}: CustomInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    const formValue = form.getValues(name);
    if (formValue) {
      setDisplayValue(formatPhoneNumber(formValue));
    }
  }, [form, name]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              value={displayValue}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setDisplayValue(formatted);
                field.onChange(formatted);
              }}
              onBlur={() => {
                if (displayValue.length > 0 && displayValue.length < 14) {
                  form.setError(name, {
                    type: "manual",
                    message: "Please complete the phone number",
                  });
                }
              }}
              maxLength={14}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
