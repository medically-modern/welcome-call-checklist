import type { Patient } from "./workflow";
import type { MondayItem } from "./mondayApi";

/**
 * Convert a Monday board item into a Patient row.
 * TODO: Map your Monday columns to Patient fields here.
 */
export function mondayItemToPatient(item: MondayItem): Patient {
  return {
    id: item.id,
    name: item.name,
    dob: "",
    notes: "",
    receivedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    checklist: {},
  };
}
