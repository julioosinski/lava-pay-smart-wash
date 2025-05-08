
import { useState, useEffect } from "react";
import { LaundryLocation } from "@/types";

export function useLocationSelection(ownerLaundries: LaundryLocation[]) {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  useEffect(() => {
    if (ownerLaundries.length > 0 && (selectedLocation === "all" || !selectedLocation)) {
      setSelectedLocation(ownerLaundries[0]?.id || "all");
      console.log("Setting selected location to:", ownerLaundries[0]?.id || "all");
    }
  }, [ownerLaundries, selectedLocation]);

  return { selectedLocation, setSelectedLocation };
}
