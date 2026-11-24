// src/components/auth/PasswordStrength.tsx

import { cn } from "../../lib/utils";
import React from "react";

interface PasswordStrengthProps {
  password?: string;
}

/**
 * A component to visually represent password strength.
 * It displays a series of bars and a text label that change based on password criteria.
 */
const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password = "",
}) => {
  /**
   * Calculates a strength score based on several criteria.
   * @param {string} pass - The password string to evaluate.
   * @returns {number} A score from 0 to 5.
   */
  const checkPasswordStrength = (pass: string): number => {
    let score = 0;
    if (!pass) return 0; // No password, score is 0

    // Your validation criteria from the Zod schema
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[#?!@$%^&*-.]/.test(pass)) score++;

    // If the password has content but is less than 8 characters, it's "Very Weak"
    if (pass.length > 0 && pass.length < 8) return 1;

    return score;
  };

  const strength = checkPasswordStrength(password);

  // Defines the label and colors for each strength level
  const strengthLevels = {
    0: { label: "", barColor: "bg-gray-200", textColor: "" },
    1: {
      label: "Very Weak",
      barColor: "bg-gray-400",
      textColor: "text-gray-500",
    },
    2: {
      label: "Weak",
      barColor: "bg-gray-500",
      textColor: "text-gray-600",
    },
    3: {
      label: "Medium",
      barColor: "bg-gray-600",
      textColor: "text-gray-700",
    },
    4: { label: "Good", barColor: "bg-gray-800", textColor: "text-gray-800" },
    5: {
      label: "Strong",
      barColor: "bg-gray-950",
      textColor: "text-gray-950",
    },
  };

  const currentStrength =
    strengthLevels[strength as keyof typeof strengthLevels];

  // Don't render anything if the password field is empty
  if (!password) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-2 mt-2 w-full">
      <div className="flex gap-1 w-full">
        {/* Map through 5 bars for the strength indicator */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              // Color the bar if its index is less than the current strength score
              index < strength ? currentStrength.barColor : "bg-gray-200"
            )}
          />
        ))}
      </div>
      {/* Display the strength label with its corresponding color */}
      <p className={cn("text-xs font-medium", currentStrength.textColor)}>
        {currentStrength.label}
      </p>
    </div>
  );
};

export default PasswordStrength;
