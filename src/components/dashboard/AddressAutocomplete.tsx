import { useEffect, useRef, useState } from "react";

let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: (() => void)[] = [];
let styleInjected = false;

/** Inject a <style> that forces the Google autocomplete element to be white */
function injectAutocompleteStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    gmp-place-autocomplete {
      background-color: white !important;
      border: 1px solid hsl(var(--input)) !important;
      border-radius: 0.375rem !important;
      height: 40px !important;
      font-size: 0.875rem !important;
      color: #111 !important;
      --gmpac-color-on-surface: #111 !important;
      --gmpac-color-surface: white !important;
      --gmpac-color-on-surface-variant: #666 !important;
    }
    gmp-place-autocomplete input {
      background-color: white !important;
      color: #111 !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Google's inline bootstrap loader — this is the ONLY way to get
 * `google.maps.importLibrary()` to work.
 */
function installBootstrapLoader(key: string) {
  if ((window as any).google?.maps?.importLibrary) return;

  const g: Record<string, string> = { key, v: "weekly" };
  const c = "google";
  const l = "importLibrary";
  const q = "__ib__";
  const m = document;
  const b = window as any;
  b[c] = b[c] || {};
  const d = b[c].maps = b[c].maps || {};
  const r = new Set<string>();
  const e = new URLSearchParams();
  let h: Promise<void> | undefined;
  let a: HTMLScriptElement;

  const u = () =>
    h ||
    (h = new Promise<void>(async (f, n) => {
      a = m.createElement("script");
      e.set("libraries", [...r] + "");
      for (const k in g)
        e.set(
          k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
          g[k],
        );
      e.set("callback", c + ".maps." + q);
      a.src = `https://maps.googleapis.com/maps/api/js?` + e;
      d[q] = f;
      a.onerror = () => (h = undefined, n(new Error("Google Maps JS SDK failed to load")));
      a.nonce = (m.querySelector("script[nonce]") as HTMLScriptElement)?.nonce || "";
      m.head.append(a);
    }));

  d[l]
    ? console.warn("Google Maps JS API only loads once.")
    : (d[l] = (f: string, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n)));
}

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

  installBootstrapLoader(key);

  try {
    await google.maps.importLibrary("places");
    await google.maps.importLibrary("geocoding");
    mapsLoaded = true;
    mapsLoading = false;
    loadCallbacks.forEach((cb) => cb());
    loadCallbacks.length = 0;
  } catch (err) {
    console.error("Failed to load Google Places library:", err);
    mapsLoading = false;
  }
}

/** Geocode an address string to lat/lng using the Maps Geocoder */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  try {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address });
    if (result.results?.[0]?.geometry?.location) {
      const loc = result.results[0].geometry.location;
      return { lat: loc.lat(), lng: loc.lng() };
    }
  } catch (err) {
    console.warn("Geocoding failed:", err);
  }
  return { lat: 0, lng: 0 };
}

export interface AddressResult {
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (result: AddressResult) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pacRef = useRef<HTMLElement | null>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(mapsLoaded);
  const [fallback, setFallback] = useState(false);

  // Keep the ref current so event listeners always call the latest onChange
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    loadGooglePlaces()
      .then(() => setReady(true))
      .catch(() => setFallback(true));
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || pacRef.current) {
      return;
    }
    if (!(window as any).google?.maps?.places?.PlaceAutocompleteElement) {
      setFallback(true);
      return;
    }

    try {
      // @ts-ignore
      const pac = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "us" },
        types: ["address"],
      });

      pac.style.width = "100%";
      injectAutocompleteStyles();

      // Listen for place selection — use the Place object for full address with zip
      for (const evtName of ["gmp-placeselect", "gmp-select"]) {
        pac.addEventListener(evtName, async (evt: any) => {
          try {
            // The event carries a Place object with full details
            const place = evt?.place ?? evt?.detail?.place;
            let addr = "";
            let lat = 0;
            let lng = 0;

            if (place) {
              // Fetch full fields if available (formattedAddress includes zip)
              if (typeof place.fetchFields === "function") {
                await place.fetchFields({ fields: ["formattedAddress", "location", "addressComponents"] });
              }
              addr = place.formattedAddress || place.formatted_address || "";
              if (place.location) {
                lat = typeof place.location.lat === "function" ? place.location.lat() : (place.location.lat ?? 0);
                lng = typeof place.location.lng === "function" ? place.location.lng() : (place.location.lng ?? 0);
              }
            }

            // Fallback to pac.value + geocoding if Place didn't give us what we need
            if (!addr) {
              addr = (pac as any).value || "";
            }
            if (!addr) return;

            if (!lat && !lng) {
              const coords = await geocodeAddress(addr);
              lat = coords.lat;
              lng = coords.lng;
            }

            console.log("[AddressAutocomplete] selected:", addr, { lat, lng });
            onChangeRef.current({ address: addr, lat, lng });
          } catch (err) {
            // Final fallback — just use the text value
            const addr = (pac as any).value || "";
            if (!addr) return;
            const coords = await geocodeAddress(addr);
            console.log("[AddressAutocomplete] fallback:", addr, coords);
            onChangeRef.current({ address: addr, lat: coords.lat, lng: coords.lng });
          }
        });
      }

      containerRef.current.appendChild(pac);
      pacRef.current = pac;

      // Pierce shadow DOM to force black text on white bg
      const applyShadowStyles = () => {
        const shadow = pac.shadowRoot;
        if (shadow) {
          const s = document.createElement("style");
          s.textContent = `
            input { background: white !important; color: #111 !important; }
            * { color: #111 !important; }
          `;
          shadow.appendChild(s);
        }
      };
      applyShadowStyles();
      setTimeout(applyShadowStyles, 100);
      setTimeout(applyShadowStyles, 500);
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
        onChange={(e) => onChange({ address: e.target.value, lat: 0, lng: 0 })}
        placeholder={placeholder ?? "Enter address"}
      />
    );
  }

  return (
    <div ref={containerRef} />
  );
}
