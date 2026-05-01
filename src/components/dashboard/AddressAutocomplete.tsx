import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    google: typeof google;
    __googleMapsCallback?: () => void;
  }
}

let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  if (mapsLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    if (mapsLoading) {
      loadCallbacks.push(resolve);
      return;
    }
    mapsLoading = true;
    loadCallbacks.push(resolve);

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!key) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is not set — address autocomplete disabled");
      mapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
      return;
    }

    window.__googleMapsCallback = () => {
      mapsLoaded = true;
      mapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
  street: { long_name: string; short_name: string };
  streetNumber: { long_name: string; short_name: string };
  city: { long_name: string; short_name: string };
  country: { long_name: string; short_name: string };
}

interface Props {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, onPlaceSelect, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(mapsLoaded);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;
    if (!window.google?.maps?.places) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
      fields: ["formatted_address", "geometry", "place_id", "address_components"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place.formatted_address) return;

      const getComponent = (type: string) => {
        const comp = place.address_components?.find((c) => c.types.includes(type));
        return { long_name: comp?.long_name ?? "", short_name: comp?.short_name ?? "" };
      };

      const result: PlaceResult = {
        address: place.formatted_address,
        lat: place.geometry?.location?.lat() ?? 0,
        lng: place.geometry?.location?.lng() ?? 0,
        placeId: place.place_id ?? "",
        street: getComponent("route"),
        streetNumber: getComponent("street_number"),
        city: getComponent("locality"),
        country: getComponent("country"),
      };

      onChange(result.address);
      onPlaceSelect?.(result);
    });

    autocompleteRef.current = ac;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [ready]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Start typing an address..."}
    />
  );
}
