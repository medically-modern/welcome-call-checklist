import { useEffect, useRef, useState } from "react";

let mapsLoaded = false;
let mapsLoading = false;
let placesLib: google.maps.PlacesLibrary | null = null;
const loadCallbacks: (() => void)[] = [];

async function loadGooglePlaces(): Promise<void> {
  if (mapsLoaded) return;

  if (mapsLoading) {
    return new Promise((resolve) => { loadCallbacks.push(resolve); });
  }

  mapsLoading = true;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) {
    console.warn("VITE_GOOGLE_MAPS_API_KEY is not set — address autocomplete disabled");
    mapsLoading = false;
    return;
  }

  // Load the Maps JS SDK using the inline bootstrap loader (recommended by Google)
  // @ts-ignore
  if (!window.google?.maps) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Maps SDK"));
      document.head.appendChild(script);
    });
  }

  // Import the places library using the new importLibrary pattern
  try {
    placesLib = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
    mapsLoaded = true;
    mapsLoading = false;
    loadCallbacks.forEach((cb) => cb());
    loadCallbacks.length = 0;
  } catch (err) {
    console.error("Failed to load Google Places library:", err);
    mapsLoading = false;
  }
}

interface Props {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pacRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(mapsLoaded);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    loadGooglePlaces()
      .then(() => setReady(true))
      .catch(() => setFallback(true));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || pacRef.current || !placesLib) {
      if (ready && !placesLib) setFallback(true);
      return;
    }

    try {
      // @ts-ignore — PlaceAutocompleteElement is new and types may lag
      const pac = new placesLib.PlaceAutocompleteElement({
        componentRestrictions: { country: "us" },
        types: ["address"],
      });

      pac.style.width = "100%";

      pac.addEventListener("gmp-placeselect", async (evt: any) => {
        const place = evt.place;
        if (!place) return;
        try {
          await place.fetchFields({ fields: ["formattedAddress"] });
          onChange(place.formattedAddress ?? "");
        } catch {
          // If fetchFields fails, try displayName
          onChange(place.displayName ?? "");
        }
      });

      containerRef.current.appendChild(pac);
      pacRef.current = pac;
    } catch (err) {
      console.error("Failed to create PlaceAutocompleteElement:", err);
      setFallback(true);
    }

    return () => {
      if (pacRef.current && containerRef.current) {
        try { containerRef.current.removeChild(pacRef.current); } catch {}
        pacRef.current = null;
      }
    };
  }, [ready]);

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
    <div ref={containerRef} />
  );
}
