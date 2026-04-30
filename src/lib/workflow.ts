/**
 * Welcome Call Checklist — Data Model
 * TODO: Define your workflow stages, checklist items, and data types here.
 */

export interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
  checked?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  notes: string;
  receivedAt: string;
  lastUpdated: string;
  // TODO: Add your workflow-specific fields here
  checklist: Record<string, boolean>;
}

export const EMPTY_CHECKLIST: Record<string, boolean> = {};
