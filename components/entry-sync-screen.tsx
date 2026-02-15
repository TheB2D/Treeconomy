"use client";

import { useState } from "react";
import { Button } from "./ui/8bit-button";
import type { PersonalInfo } from "./identity-gate-modal";

interface EntrySyncScreenProps {
  onSync: (info: PersonalInfo) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TEST_PERSONAS: Array<{ key: string; label: string; data: PersonalInfo }> = [
  {
    key: "excellent",
    label: "Alice Excellent (750+)",
    data: {
      firstName: "Alice",
      lastName: "Excellent",
      ssn: "666001001",
      birthDate: "1990-01-01",
      addresses: [
        {
          addressLine1: "123 Perfect St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
        },
      ],
    },
  },
  {
    key: "good",
    label: "Bob Good (680-749)",
    data: {
      firstName: "Bob",
      lastName: "Good",
      ssn: "666002002",
      birthDate: "1985-05-15",
      addresses: [
        {
          addressLine1: "456 Decent Ave",
          city: "Los Angeles",
          state: "CA",
          postalCode: "90001",
        },
      ],
    },
  },
  {
    key: "fair",
    label: "Charlie Fair (620-679)",
    data: {
      firstName: "Charlie",
      lastName: "Fair",
      ssn: "666003003",
      birthDate: "1992-07-20",
      addresses: [
        {
          addressLine1: "789 Average Blvd",
          city: "Chicago",
          state: "IL",
          postalCode: "60601",
        },
      ],
    },
  },
  {
    key: "poor",
    label: "Diana Poor (300-619)",
    data: {
      firstName: "Diana",
      lastName: "Poor",
      ssn: "666004004",
      birthDate: "1988-03-10",
      addresses: [
        {
          addressLine1: "321 Struggle Rd",
          city: "Houston",
          state: "TX",
          postalCode: "77001",
        },
      ],
    },
  },
];

export function EntrySyncScreen({ onSync, loading, error }: EntrySyncScreenProps) {
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: "",
    lastName: "",
    ssn: "",
    birthDate: "",
    addresses: [
      {
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
      },
    ],
  });
  const [selectedPersona, setSelectedPersona] = useState("");

  const handlePersonaChange = (value: string) => {
    setSelectedPersona(value);
    if (!value) return;
    const persona = TEST_PERSONAS.find((p) => p.key === value);
    if (persona) {
      setFormData(persona.data);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSync(formData);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/background1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
          opacity: 0.35,
        }}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl border-4 border-border bg-card/95 pixel-border p-6">
          <div className="flex flex-col items-center gap-3 mb-6">
            <img src="/Treeconomy_logo.png" alt="Treeconomy" className="w-60 h-auto object-contain" />
            <h1 className="text-xl text-primary text-center">ENTER THE FOREST</h1>
            <p className="text-xs text-muted-foreground text-center">
              Sync your credit profile to personalize Scene 1 and Scene 2 instantly.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Sandbox Persona Preset</label>
              <select
                className="w-full px-3 py-2 bg-background border-2 border-border text-sm"
                value={selectedPersona}
                onChange={(e) => handlePersonaChange(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a test persona...</option>
                {TEST_PERSONAS.map((persona) => (
                  <option key={persona.key} value={persona.key}>
                    {persona.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
              <input
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                placeholder="SSN (9 digits)"
                value={formData.ssn}
                onChange={(e) => setFormData((p) => ({ ...p, ssn: e.target.value }))}
                required
              />
              <input
                type="date"
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                value={formData.birthDate}
                onChange={(e) => setFormData((p) => ({ ...p, birthDate: e.target.value }))}
                required
              />
            </div>

            <input
              className="w-full px-3 py-2 bg-background border-2 border-border text-sm"
              placeholder="Address"
              value={formData.addresses[0].addressLine1}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  addresses: [{ ...p.addresses[0], addressLine1: e.target.value }],
                }))
              }
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <input
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                placeholder="City"
                value={formData.addresses[0].city}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, addresses: [{ ...p.addresses[0], city: e.target.value }] }))
                }
                required
              />
              <input
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                placeholder="State"
                value={formData.addresses[0].state}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, addresses: [{ ...p.addresses[0], state: e.target.value }] }))
                }
                required
              />
              <input
                className="px-3 py-2 bg-background border-2 border-border text-sm"
                placeholder="Zip"
                value={formData.addresses[0].postalCode}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    addresses: [{ ...p.addresses[0], postalCode: e.target.value }],
                  }))
                }
                required
              />
            </div>

            {error && <div className="text-destructive text-xs border-2 border-destructive px-3 py-2">{error}</div>}

            <div className="flex justify-end items-center pt-2">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "SYNCING..." : "LOGIN & SYNC TREECONOMY"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
