import React from "react";
import PhoneInput from "react-phone-number-input";

import "react-phone-number-input/style.css";

interface PhoneNumberInputProps {
  value: string | undefined;
  onChange: (phone: string | undefined) => void;
}

export const CustomPhoneInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="w-full">
      <PhoneInput
        defaultCountry="NG"
        value={value}
        className="rounded-md h-full min-h-11 px-4"
        autoComplete="tel"
        onChange={(value) => onChange(value || "")}
        style={{
          border: "1px solid #DBDFE6",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      />
    </div>
  );
};
