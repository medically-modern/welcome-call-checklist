import { useEffect, useRef, useState } from "react";

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

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
    script.async = true;
    script.onload = () => {
      mapsLoaded = true;
      mapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps JS SDK");
      mapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

interface Props {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const [ready, setReady] = useState(mapsLoaded);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || elementRef.current) return;

    // Check if the new PlaceAutocompleteElement API is available
    if (!window.google?.maps?.places?.PlaceAutocompleteElement) {
      console.warn("PlaceAutocompleteElement not available, falling back to text input");
      setFallback(true);
      return;
    }

    try {
      const pac = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "us" },
        types: ["address"],
      });

      // Style the element to match the rest of the form
      pac.style.width = "100%";

      pac.addEventListener("gmp-placeselect", async (evt: any) => {
        const place = evt.place;
        if (!place) return;

        // Fetch full details including formatted address
        await place.fetchFields({ fields: ["formattedAddress", "location", "id", "addressComponents"] });

        const addr = place.formattedAddress ?? "";
        onChange(addr);
      });

      containerRef.current.appendChild(pac);
      elementRef.current = pac;
    } catch (err) {
      console.error("Failed to create PlaceAutocompleteElement:", err);
      setFallback(true);
    }

    return () => {
      if (elementRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(elementRef.current);
        } catch { /* already removed */ }
        elementRef.current = null;
      }
    };
  }, [ready]);

  // Fallback: plain input if the API isn't available or billing isn't set up
  if (!ready || fallback) {
    return (
      <input
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter address"}
      />
    );
  }

  return (
    <div>
      <div ref={containerRef} className="address-autocomplete-container" />
      <style>{`
        .address-autocomplete-container gmp-place-autocomplete {
          width: 100%;
          --gmpac-color-surface: hsl(var(--background));
          --gmpac-color-on-surface: hsl(var(--foreground));
          --gmpac-color-outline: hsl(var(--input));
          --gmpac-color-on-surface-variant: hsl(var(--muted-foreground));
          --gmpac-color-primary: hsl(var(--ring));
          font-family: inherit;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
