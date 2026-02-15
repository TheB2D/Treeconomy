"use client";

// ==========================================
// IDENTITY GATE MODAL
// Retro pixel identity verification UI
// ==========================================

import { useState } from "react";
import { EightBitButton } from "./ui/8bit-button";

interface IdentityGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (personalInfo: PersonalInfo) => void;
  isVerifying?: boolean;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  ssn: string;
  birthDate: string;
  addresses: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  }[];
}

export function IdentityGateModal({
  isOpen,
  onClose,
  onVerify,
  isVerifying = false,
}: IdentityGateModalProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    ssn: "",
    birthDate: "",
    addresses: [
      {
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
      },
    ],
  });

  const [useSandboxData, setUseSandboxData] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (
    field: keyof Omit<PersonalInfo, "addresses">,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      addresses: [
        {
          ...prev.addresses[0],
          [field]: value,
        },
      ],
    }));
  };

  const loadSandboxData = () => {
    setFormData({
      firstName: "Alice",
      lastName: "Excellent",
      ssn: "666001001",
      birthDate: "1990-01-01",
      addresses: [
        {
          addressLine1: "123 Perfect St",
          addressLine2: "",
          city: "New York",
          state: "NY",
          postalCode: "10001",
        },
      ],
    });
    setUseSandboxData(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Pixel art border */}
        <div className="bg-gradient-to-b from-green-900 to-green-950 border-4 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
          {/* Header */}
          <div className="bg-green-800 border-b-4 border-green-400 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-green-100 pixel-font">
                🌲 IDENTITY VERIFICATION GATE
              </h2>
              <button
                onClick={onClose}
                className="text-green-300 hover:text-green-100 text-2xl"
                disabled={isVerifying}
              >
                ✕
              </button>
            </div>
            <p className="text-green-300 text-sm mt-2">
              Before entering the forest, we must verify your identity
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Sandbox Helper */}
            <div className="bg-yellow-900/30 border-2 border-yellow-600 p-4 rounded">
              <p className="text-yellow-300 text-sm mb-2">
                🧪 <strong>Development Mode:</strong> Use sandbox test data
              </p>
              <button
                type="button"
                onClick={loadSandboxData}
                className="text-yellow-400 underline hover:text-yellow-200 text-sm"
                disabled={isVerifying}
              >
                Load Test Persona (Alice Excellent)
              </button>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-300 border-b-2 border-green-700 pb-2">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(v) => handleInputChange("firstName", v)}
                  required
                  disabled={isVerifying}
                />
                <InputField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(v) => handleInputChange("lastName", v)}
                  required
                  disabled={isVerifying}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="SSN (9 digits, no dashes)"
                  value={formData.ssn}
                  onChange={(v) => handleInputChange("ssn", v)}
                  placeholder="666001001"
                  required
                  maxLength={9}
                  disabled={isVerifying}
                />
                <InputField
                  label="Birth Date"
                  type="date"
                  value={formData.birthDate}
                  onChange={(v) => handleInputChange("birthDate", v)}
                  required
                  disabled={isVerifying}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-300 border-b-2 border-green-700 pb-2">
                Current Address
              </h3>

              <InputField
                label="Street Address"
                value={formData.addresses[0].addressLine1}
                onChange={(v) => handleAddressChange("addressLine1", v)}
                required
                disabled={isVerifying}
              />

              <InputField
                label="Apartment / Unit (Optional)"
                value={formData.addresses[0].addressLine2}
                onChange={(v) => handleAddressChange("addressLine2", v)}
                disabled={isVerifying}
              />

              <div className="grid grid-cols-3 gap-4">
                <InputField
                  label="City"
                  value={formData.addresses[0].city}
                  onChange={(v) => handleAddressChange("city", v)}
                  required
                  disabled={isVerifying}
                />
                <InputField
                  label="State"
                  value={formData.addresses[0].state}
                  onChange={(v) => handleAddressChange("state", v)}
                  placeholder="NY"
                  maxLength={2}
                  required
                  disabled={isVerifying}
                />
                <InputField
                  label="Zip Code"
                  value={formData.addresses[0].postalCode}
                  onChange={(v) => handleAddressChange("postalCode", v)}
                  placeholder="10001"
                  maxLength={5}
                  required
                  disabled={isVerifying}
                />
              </div>
            </div>

            {/* Consent */}
            <div className="bg-green-900/50 border-2 border-green-700 p-4 rounded">
              <p className="text-green-200 text-sm">
                ✓ By submitting, you authorize Treeconomy to verify your
                identity and access your credit report for gamification purposes
                only. Your data is encrypted and never stored permanently.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <EightBitButton
                type="button"
                onClick={onClose}
                disabled={isVerifying}
                variant="secondary"
              >
                Cancel
              </EightBitButton>
              <EightBitButton type="submit" disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⚡</span>
                    Verifying...
                  </>
                ) : (
                  <>🌿 Verify & Sync Forest</>
                )}
              </EightBitButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Helper Input Component
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  maxLength,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-green-300 text-sm font-semibold block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
        className="w-full px-3 py-2 bg-green-950/50 border-2 border-green-700 
                   text-green-100 rounded focus:outline-none focus:border-green-400
                   disabled:opacity-50 disabled:cursor-not-allowed
                   placeholder:text-green-700"
      />
    </div>
  );
}
