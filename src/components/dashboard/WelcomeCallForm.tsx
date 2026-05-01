import type { Patient } from "@/lib/workflow";
import {
  INFUSION_SET_1_OPTIONS,
  INFUSION_SET_2_OPTIONS,
  SUBSCRIPTION_TYPE_OPTIONS,
  WELCOME_CALL_TEXT_OPTIONS,
  ORDER_HANDLING_OPTIONS,
} from "@/lib/workflow";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddressAutocomplete } from "@/components/dashboard/AddressAutocomplete";

interface Props {
  patient: Patient;
  onFieldChange: (field: keyof Patient, value: string | number | null) => void;
}

export function WelcomeCallForm({ patient, onFieldChange }: Props) {
  const handleSelectChange = (field: string, value: string, index: number | null) => {
    onFieldChange(field as keyof Patient, value);
    onFieldChange(`${field}Index` as keyof Patient, index);
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          To Fill In
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Complete these fields based on the welcome call information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Number inputs */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
            Monitor Qty
          </label>
          <Input
            type="number"
            min="0"
            value={patient.monitorQty}
            onChange={(e) => onFieldChange("monitorQty", e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
            Pump Qty
          </label>
          <Input
            type="number"
            min="0"
            value={patient.pumpQty}
            onChange={(e) => onFieldChange("pumpQty", e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
            Qty Inf. 1
          </label>
          <Input
            type="number"
            min="0"
            value={patient.qtyInf1}
            onChange={(e) => onFieldChange("qtyInf1", e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
            Qty Inf. 2
          </label>
          <Input
            type="number"
            min="0"
            value={patient.qtyInf2}
            onChange={(e) => onFieldChange("qtyInf2", e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Infusion Set 1 */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
            Infusion Set 1
          </label>
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

        {/* Infusion Set 2 */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
            Infusion Set 2
          </label>
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

        {/* Address — full width */}
        <div className="sm:col-span-2 space-y-3">
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
              onChange={(addr) => {
                console.log("[WelcomeCallForm] addressEdited onChange called with:", JSON.stringify(addr));
                onFieldChange("addressEdited", addr);
              }}
              placeholder="Search for a new address..."
            />
            {patient.addressEdited !== null && patient.addressEdited !== "" && patient.addressEdited !== patient.address && (
              <p className="text-xs text-amber-600 mt-1">Address will be updated on sync</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
