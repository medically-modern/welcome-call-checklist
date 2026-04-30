import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onEscalate: () => Promise<void>;
  disabled?: boolean;
}

export function EscalateButton({ onEscalate, disabled }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setSending(true);
    try {
      await onEscalate();
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button
        onClick={handleClick}
        disabled={disabled || sending}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
          confirming
            ? "bg-destructive/15 text-destructive border-destructive/30"
            : "bg-muted/50 text-muted-foreground border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20",
          (disabled || sending) && "opacity-50 cursor-not-allowed",
        )}
      >
        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {sending ? "Escalating…" : confirming ? "Confirm Escalate?" : "Escalate"}
      </button>
      {confirming && !sending && (
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
