
import { useState } from "react";
import { LaundryLocation, Machine } from "@/types";

export type TotemStep = "select-laundry" | "select-machine" | "payment" | "processing" | "success" | "error";

export interface CardDetails {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
}

export function useTotemState() {
  const [step, setStep] = useState<TotemStep>("select-laundry");
  const [selectedLaundry, setSelectedLaundry] = useState<LaundryLocation | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "debit" | "pix">("credit");
  const [pixQRCode, setPixQRCode] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    cardholderName: "",
    expirationMonth: "",
    expirationYear: "",
    securityCode: ""
  });

  const handleLaundrySelect = (laundry: LaundryLocation) => {
    setSelectedLaundry(laundry);
    setStep("select-machine");
  };

  const handleMachineSelect = (machine: Machine) => {
    setSelectedMachine(machine);
    setStep("payment");
  };

  const handleBackToLaundries = () => {
    setSelectedLaundry(null);
    setSelectedMachine(null);
    setStep("select-laundry");
    setPixQRCode(null);
  };

  const handleBackToMachines = () => {
    setSelectedMachine(null);
    setStep("select-machine");
    setPixQRCode(null);
  };

  const handleBackToPayment = () => {
    setStep("payment");
    setPixQRCode(null);
  };

  const handleCardFieldChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    step,
    setStep,
    selectedLaundry,
    selectedMachine,
    paymentMethod,
    pixQRCode,
    cardDetails,
    setPixQRCode,
    setPaymentMethod,
    handleLaundrySelect,
    handleMachineSelect,
    handleBackToLaundries,
    handleBackToMachines,
    handleBackToPayment,
    handleCardFieldChange
  };
}
