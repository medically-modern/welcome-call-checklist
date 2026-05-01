import type { Patient } from "@/lib/workflow";
import { SECONDARY_INSURANCE_OPTIONS } from "@/lib/workflow";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  patient: Patient;
  onFieldChange?: (field: keyof Patient, value: string | number | null) => void;
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-medium" title={value}>
        {value}
      </p>
    </div>
  );
}

export function PatientInfoCard({ patient, onFieldChange }: Props) {
  const hasSecondaryInsurance = !!patient.secondaryInsurance && patient.secondaryInsurance !== "";

  return (
    <div className="space-y-4">
      {/* Patient name */}
      <Card className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Patient Name
        </p>
        <p className="text-lg font-semibold">{patient.name}</p>
      </Card>

      {/* Row 1: Referral/Product + Insurance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Referral Source" value={patient.doctorName} />
            <Field label="Request Type" value={patient.requestType} />
            <Field label="Serving" value={patient.serving} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Primary Insurance" value={patient.primaryInsurance} />
            <Field label="Member ID 1" value={patient.memberId1} />

            {/* Secondary Insurance: read-only if present, editable dropdown if empty */}
            {hasSecondaryInsurance ? (
              <Field label="Secondary Insurance" value={patient.secondaryInsurance} />
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Secondary Insurance
                </p>
                <Select
                  value={
                    patient.secondaryInsuranceEdited !== null
                      ? String(
                          SECONDARY_INSURANCE_OPTIONS.find(
                            (o) => o.label === patient.secondaryInsuranceEdited
                          )?.index ?? ""
                        )
                      : ""
                  }
                  onValueChange={(value) => {
                    const option = SECONDARY_INSURANCE_OPTIONS.find(
                      (o) => String(o.index) === value
                    );
                    if (onFieldChange && option) {
                      onFieldChange("secondaryInsuranceEdited", option.label);
                      onFieldChange("secondaryInsuranceIndex", option.index);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select insurance" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECONDARY_INSURANCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.index} value={String(opt.index)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Field label="Member ID 2" value={patient.memberId2} />
          </div>
        </Card>
      </div>

      {/* Row 2: Pump (read-only display removed — pump type now shown in form section 2) */}
    </div>
  );
}
