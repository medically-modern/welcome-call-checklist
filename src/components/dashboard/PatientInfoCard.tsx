import type { Patient } from "@/lib/workflow";
import { Card } from "@/components/ui/card";

interface Props {
  patient: Patient;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-medium" title={value || "—"}>
        {value || "—"}
      </p>
    </div>
  );
}

export function PatientInfoCard({ patient }: Props) {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Patient Name
        </p>
        <p className="text-lg font-semibold">{patient.name}</p>
      </div>

      <div className="border-t pt-4">
        <Section title="Demographics">
          <Field label="Date of Birth" value={patient.dob} />
          <Field label="Phone" value={patient.phone} />
          <Field label="Email" value={patient.email} />
          <Field label="Address" value={patient.address} />
          <Field label="Gender" value={patient.gender} />
        </Section>

        <Section title="Insurance">
          <Field label="Primary Insurance" value={patient.primaryInsurance} />
          <Field label="Member ID 1" value={patient.memberId1} />
          <Field label="Secondary Insurance" value={patient.secondaryInsurance} />
          <Field label="Member ID 2" value={patient.memberId2} />
        </Section>

        <Section title="Product & Referral">
          <Field label="Serving" value={patient.serving} />
          <Field label="Pump Type" value={patient.pumpType} />
          <Field label="CGM Type" value={patient.cgmType} />
          <Field label="Request Type" value={patient.requestType} />
          <Field label="Doctor Name" value={patient.doctorName} />
          <Field label="Diagnosis" value={patient.diagnosis} />
        </Section>

        {patient.notes && (
          <Section title="Notes">
            <div className="col-span-full">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Prior Notes
              </p>
              <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
            </div>
          </Section>
        )}
      </div>
    </Card>
  );
}
