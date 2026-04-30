import type { Patient } from "@/lib/workflow";
import { Card } from "@/components/ui/card";

interface Props {
  patient: Patient;
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

export function PatientInfoCard({ patient }: Props) {
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
            <Field label="Secondary Insurance" value={patient.secondaryInsurance} />
            <Field label="Member ID 2" value={patient.memberId2} />
          </div>
        </Card>
      </div>

      {/* Row 2: CGM + Pump */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <Field label="CGM Type" value={patient.cgmType} />
        </Card>
        <Card className="p-4">
          <Field label="Pump Type" value={patient.pumpType} />
        </Card>
      </div>
    </div>
  );
}
