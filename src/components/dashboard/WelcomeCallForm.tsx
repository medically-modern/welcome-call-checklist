import type { Patient } from "@/lib/workflow";
import {
  CGM_TYPE_OPTIONS,
  INFUSION_SET_1_OPTIONS,
  INFUSION_SET_2_OPTIONS,
  SUBSCRIPTION_TYPE_OPTIONS,
  WELCOME_CALL_TEXT_OPTIONS,
  ORDER_HANDLING_OPTIONS,
} from "@/lib/workflow";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressAutocomplete, type AddressResult } from "@/components/dashboard/AddressAutocomplete";

interface Props {
  patient: Patient;
  onFieldChange: (field: keyof Patient, value: string | number | null) => void;
}

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
        {number}
      </span>
      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
    </div>
  );
}

export function WelcomeCallForm({ patient, onFieldChange }: Props) {
  const handleSelectChange = (field: string, value: string, index: number | null) => {
    onFieldChange(field as keyof Patient, value);
    onFieldChange(`${field}Index` as keyof Patient, index);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="px-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          To Fill In
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Complete these fields based on the welcome call information.
        </p>
      </div>

      {/* ─── Section 1: CGM ─── */}
      <Card className="p-6">
        <SectionHeading number={1} title="CGM" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* CGM Type — editable dropdown */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
              CGM Type
            </label>
            <Select
              value={patient.cgmTypeIndex !== null ? String(patient.cgmTypeIndex) : ""}
              onValueChange={(value) => {
                const option = CGM_TYPE_OPTIONS.find((o) => String(o.index) === value);
                handleSelectChange("cgmType", option?.label || "", option?.index ?? null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CGM type" />
              </SelectTrigger>
              <SelectContent>
                {CGM_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.index} value={String(opt.index)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Monitor Qty — toggle (0 or 1) */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
              Monitor Qty
            </label>
            <div className="flex items-center gap-3 h-10">
              <Switch
                checked={patient.monitorQty === "1"}
                onCheckedChange={(checked) =>
                  onFieldChange("monitorQty", checked ? "1" : "0")
                }
              />
              <span className="text-sm font-medium">
                {patient.monitorQty === "1" ? "1 — Yes" : "0 — No"}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Section 2: Pump & Infusion Sets ─── */}
      <Card className="p-6">
        <SectionHeading number={2} title="Pump & Infusion Sets" />

        {/* Pump Type — read-only */}
        <div className="mb-5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
            Pump Type
          </label>
          <p className="text-sm font-medium px-3 py-2 rounded-md bg-muted/50 border border-input min-h-[40px] flex items-center">
            {patient.pumpType || <span className="text-muted-foreground italic">Not set</span>}
          </p>
        </div>

        {/* Infusion Set pairs — visually tied */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Infusion Set 1 group */}
          <div className="rounded-lg border border-input bg-muted/20 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Infusion Set 1
            </p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Set Type</label>
              <Select
                value={patient.infusionSet1Index !== null ? String(patient.infusionSet1Index) : ""}
                onValueChange={(value) => {
                  const option = INFUSION_SET_1_OPTIONS.find((o) => String(o.index) === value);
                  handleSelectChange("infusionSet1", option?.label || "", option?.index ?? null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {INFUSION_SET_1_OPTIONS.map((opt) => (
                    <SelectItem key={opt.index} value={String(opt.index)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={patient.qtyInf1}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  onFieldChange("qtyInf1", String(val));
                }}
                placeholder="1"
              />
            </div>
          </div>

          {/* Infusion Set 2 group */}
          <div className="rounded-lg border border-input bg-muted/20 p-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Infusion Set 2
            </p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Set Type</label>
              <Select
                value={patient.infusionSet2Index !== null ? String(patient.infusionSet2Index) : ""}
                onValueChange={(value) => {
                  const option = INFUSION_SET_2_OPTIONS.find((o) => String(o.index) === value);
                  handleSelectChange("infusionSet2", option?.label || "", option?.index ?? null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  {INFUSION_SET_2_OPTIONS.map((opt) => (
                    <SelectItem key={opt.index} value={String(opt.index)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={patient.qtyInf2}
                onChange={(e) => {
                  const val = Math.min(10, Math.max(1, Number(e.target.value) || 1));
                  onFieldChange("qtyInf2", String(val));
                }}
                placeholder="1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Section 3: Subscription & Logistics ─── */}
      <Card className="p-6">
        <SectionHeading number={3} title="Subscription & Logistics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Subscription Type */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
              Subscription Type
            </label>
            <Select
              value={patient.subscriptionTypeIndex !== null ? String(patient.subscriptionTypeIndex) : ""}
              onValueChange={(value) => {
                const option = SUBSCRIPTION_TYPE_OPTIONS.find((o) => String(o.index) === value);
                handleSelectChange("subscriptionType", option?.label || "", option?.index ?? null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {SUBSCRIPTION_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.index} value={String(opt.index)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Welcome Call Text */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
              Welcome Call Text
            </label>
            <Select
              value={patient.welcomeCallTextIndex !== null ? String(patient.welcomeCallTextIndex) : ""}
              onValueChange={(value) => {
                const option = WELCOME_CALL_TEXT_OPTIONS.find((o) => String(o.index) === value);
                handleSelectChange("welcomeCallText", option?.label || "", option?.index ?? null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {WELCOME_CALL_TEXT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.index} value={String(opt.index)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Handling */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
              Order Handling
            </label>
            <Select
              value={patient.orderHandlingIndex !== null ? String(patient.orderHandlingIndex) : ""}
              onValueChange={(value) => {
                const option = ORDER_HANDLING_OPTIONS.find((o) => String(o.index) === value);
                handleSelectChange("orderHandling", option?.label || "", option?.index ?? null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_HANDLING_OPTIONS.map((opt) => (
                  <SelectItem key={opt.index} value={String(opt.index)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Address — full width */}
        <div className="mt-6 space-y-3">
          {/* Current Monday address (read-only) */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
              Address on File
            </label>
            <p className="text-sm font-medium px-3 py-2 rounded-md bg-muted/50 border border-input min-h-[40px] flex items-center">
              {patient.address || <span className="text-muted-foreground italic">No address on file</span>}
            </p>
          </div>

          {/* Google Places autocomplete for editing */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-1">
              Update Address
            </label>
            <AddressAutocomplete
              value={patient.addressEdited ?? ""}
              onChange={(result: AddressResult) => {
                onFieldChange("addressEdited", result.address);
                onFieldChange("addressLat" as keyof Patient, result.lat);
                onFieldChange("addressLng" as keyof Patient, result.lng);
              }}
              placeholder="Search for a new address..."
            />
            {patient.addressEdited !== null && patient.addressEdited !== "" && patient.addressEdited !== patient.address && (
              <p className="text-xs text-amber-600 mt-1">Address will be updated on sync</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
