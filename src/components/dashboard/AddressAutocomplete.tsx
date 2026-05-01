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
 * `google.maps.importLibrary()` to work.  The classic <script src="...">
 * tag loads the legacy SDK which does NOT expose importLibrary.
 */
function installBootstrapLoader(key: string) {
  // If the bootstrap was already installed (or someone else loaded Maps), skip.
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

  // Install the bootstrap loader so importLibrary() is available
  installBootstrapLoader(key);

  try {
    await google.maps.importLibrary("places");
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
    if (!ready || !containerRef.current || pacRef.current) {
      return;
    }
    // Verify the Places library actually loaded
    if (!(window as any).google?.maps?.places?.PlaceAutocompleteElement) {
      setFallback(true);
      return;
    }

    try {
      // @ts-ignore — PlaceAutocompleteElement is new and types may lag
      const pac = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "us" },
        types: ["address"],
      });

      pac.style.width = "100%";
      injectAutocompleteStyles();

      // Helper: read the address text from the shadow DOM input
      const readInputValue = (): string => {
        const shadow = pac.shadowRoot;
        if (shadow) {
          const input = shadow.querySelector("input");
          if (input?.value) return input.value;
        }
        return "";
      };

      // Helper: try to extract address from the event's place object (minified props vary)
      const extractAddress = async (evt: any): Promise<string> => {
        // Try documented property names first
        const place = evt.place ?? evt.detail?.place;
        if (place) {
          try {
            if (typeof place.fetchFields === "function") {
              await place.fetchFields({ fields: ["formattedAddress"] });
            }
            const addr = place.formattedAddress || place.formatted_address || place.displayName || place.name;
            if (addr) return addr;
          } catch { /* fall through */ }
        }

        // Walk all event properties looking for an object with toJSON or formattedAddress
        for (const key of Object.keys(evt)) {
          const val = evt[key];
          if (val && typeof val === "object") {
            try {
              if (typeof val.fetchFields === "function") {
                await val.fetchFields({ fields: ["formattedAddress"] });
              }
              if (val.formattedAddress) return val.formattedAddress;
              if (typeof val.toJSON === "function") {
                const j = val.toJSON();
                if (j?.formattedAddress) return j.formattedAddress;
              }
            } catch { /* skip */ }
          }
        }

        // Last resort: read from the input element directly
        return readInputValue();
      };

      for (const evtName of ["gmp-placeselect", "gmp-select"]) {
        pac.addEventListener(evtName, async (evt: any) => {
          console.log(`${evtName} fired`, evt);
          const addr = await extractAddress(evt);
          console.log("Resolved address:", addr);
          if (addr) onChange(addr);
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
      // Try immediately, and again after a short delay (shadow may not be ready)
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
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Enter address"}
      />
    );
  }

  return (
    <div ref={containerRef} />
  );
}
