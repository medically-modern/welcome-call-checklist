import type { Patient } from "./workflow";

/**
 * Push patient data back to Monday.
 * TODO: Implement your write logic here using utilities from mondayApi.ts
 */
export async function sendPatientToMonday(p: Patient): Promise<void> {
  // TODO: Add your Monday write calls here
  // Example:
  // import { writeStatusIndex, writeLongText, COL } from "./mondayApi";
  // await writeStatusIndex(p.id, COL.someColumn, 1);
  console.log("sendPatientToMonday called for:", p.name);
}
