import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type State = "idle" | "sending" | "success" | "error";

interface Props {
  onEscalate: () => Promise<void>;
  disabled?: boolean;
}

export function EscalateButton({ onEscalate, disabled }: Props) {
  const [state, setState] = useState<State>("idle");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state === "success" || state === "error") {
      const t = setTimeout(() => setState("idle"), 2200);
      return () => clearTimeout(t);
    }
  }, [state]);

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    setState("sending");
    try {
      await onEscalate();
      setState("success");
    } catch {
      setState("error");
    }
  };

  const handleCancel = () => setConfirming(false);

  if (confirming) {
    return (
      <div className="flex justify-center gap-3 pt-2">
        <Button
          onClick={handleClick}
          size="lg"
          className="gap-2 bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-12 text-base font-semibold shadow-elevate"
        >
          <AlertTriangle className="h-4 w-4" />
          Yes, Escalate
        </Button>
        <Button
          onClick={handleCancel}
          size="lg"
          variant="outline"
          className="rounded-full px-8 h-12 text-base font-semibold"
        >
          Cancel
        </Button>
      </div>
    );
  }

  const config = {
    idle: {
      label: "Escalate",
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-red-600 hover:bg-red-700 text-white",
    },
    sending: {
      label: "Escalating…",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      className: "bg-amber-500 hover:bg-amber-500 text-white",
    },
    success: {
      label: "Escalated",
      icon: <Check className="h-4 w-4" />,
      className: "bg-red-600 hover:bg-red-600 text-white ring-4 ring-red-300/60",
    },
    error: {
      label: "Escalation failed — retry",
      icon: <AlertTriangle className="h-4 w-4" />,
      className: "bg-red-800 hover:bg-red-900 text-white",
    },
  }[state];

  return (
    <div className="flex justify-center pt-2">
      <Button
        onClick={handleClick}
        disabled={disabled || state === "sending"}
        size="lg"
        className={cn(
          "gap-2 shadow-elevate rounded-full px-8 h-12 text-base font-semibold transition-all duration-300",
          config.className,
        )}
      >
        {config.icon}
        <span>{config.label}</span>
      </Button>
    </div>
  );
}
