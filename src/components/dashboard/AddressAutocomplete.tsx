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

      // Deep debug: log everything we can find about the element and event
      const findAddress = (evt: any): string => {
        // 1. Try reading from the element's shadow DOM
        const shadow = pac.shadowRoot;
        console.log("Shadow root:", shadow);
        if (shadow) {
          // Try input
          const input = shadow.querySelector("input");
          console.log("Shadow input:", input, "value:", input?.value);
          if (input?.value) return input.value;

          // Try any element with text content that looks like an address
          const allEls = shadow.querySelectorAll("*");
          console.log("Shadow DOM elements:", allEls.length);
          allEls.forEach((el: any) => {
            if (el.value) console.log("  element with value:", el.tagName, el.value);
            if (el.textContent?.includes(",")) console.log("  element with text:", el.tagName, el.textContent?.trim());
          });
        }

        // 2. Try the pac element itself
        console.log("pac.value:", (pac as any).value);
        console.log("pac.innerText:", pac.innerText);
        console.log("pac.textContent:", pac.textContent);
        if ((pac as any).value) return (pac as any).value;

        // 3. Walk event properties deeply
        const evtKeys = Object.getOwnPropertyNames(evt);
        console.log("Event own props:", evtKeys);
        for (const key of evtKeys) {
          try {
            const val = evt[key];
            if (val && typeof val === "object" && val !== evt.target && val !== evt.currentTarget) {
              const valKeys = Object.getOwnPropertyNames(val);
              console.log(`  evt.${key} props:`, valKeys);
              // Look for string properties that look like addresses
              for (const vk of valKeys) {
                try {
                  const inner = val[vk];
                  if (typeof inner === "string" && inner.includes(",") && inner.length > 5) {
                    console.log(`  evt.${key}.${vk} = "${inner}"`);
                    return inner;
                  }
                } catch {}
              }
              // Try toJSON
              if (typeof val.toJSON === "function") {
                const j = val.toJSON();
                console.log(`  evt.${key}.toJSON():`, j);
                if (j?.formattedAddress) return j.formattedAddress;
                if (j?.formatted_address) return j.formatted_address;
              }
              // Try fetchFields
              if (typeof val.fetchFields === "function") {
                console.log(`  evt.${key} has fetchFields`);
              }
            }
          } catch {}
        }

        return "";
      };

      for (const evtName of ["gmp-placeselect", "gmp-select"]) {
        pac.addEventListener(evtName, (evt: any) => {
          console.log(`${evtName} fired`, evt);

          // Small delay to let Google populate the input
          setTimeout(() => {
            const addr = findAddress(evt);
            console.log("Resolved address:", addr);
            if (addr) onChange(addr);
          }, 50);
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
