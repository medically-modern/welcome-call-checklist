/**
 * Welcome Call Checklist — Data Model
 */

export interface Patient {
  id: string;
  name: string;
  // Read-only demographics
  dob: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  // Read-only insurance
  primaryInsurance: string;
  memberId1: string;
  secondaryInsurance: string;
  memberId2: string;
  // Read-only product/referral
  serving: string;
  pumpType: string;
  cgmType: string;
  cgmTypeIndex: number | null;       // editable override
  requestType: string;
  doctorName: string;
  diagnosis: string;
  notes: string;
  // Secondary insurance (editable when empty)
  secondaryInsuranceIndex: number | null;
  secondaryInsuranceEdited: string | null;
  // Editable welcome call fields
  monitorQty: string;
  pumpQty: string;
  qtyInf1: string;
  infusionSet1: string;
  infusionSet1Index: number | null;
  qtyInf2: string;
  infusionSet2: string;
  infusionSet2Index: number | null;
  subscriptionType: string;
  subscriptionTypeIndex: number | null;
  welcomeCallText: string;
  welcomeCallTextIndex: number | null;
  orderHandling: string;
  orderHandlingIndex: number | null;
  addressEdited: string | null; // local edit of address
  addressLat: number | null;    // lat from Google Places geocode
  addressLng: number | null;    // lng from Google Places geocode
  escalated: boolean;
  receivedAt: string;
  lastUpdated: string;
}

export const INFUSION_SET_1_OPTIONS = [
  { index: 0, label: 'AutoSoft XC 6mm 23"' },
  { index: 1, label: 'AutoSoft XC 6mm 32"' },
  { index: 2, label: 'AutoSoft XC 6mm 43"' },
  { index: 3, label: 'AutoSoft XC 9mm 23"' },
  { index: 4, label: 'AutoSoft 30 13mm 23"' },
  { index: 6, label: 'TruSteel 6mm 23"' },
  { index: 7, label: 'TruSteel 6mm 32"' },
  { index: 8, label: 'TruSteel 8mm 23"' },
  { index: 9, label: 'TruSteel 8mm 32"' },
  { index: 10, label: 'VariSoft 13mm 23"' },
  { index: 11, label: 'VariSoft 13mm 32"' },
  { index: 12, label: 'VariSoft 17mm 23"' },
  { index: 13, label: 'Contact 6mm 23"' },
  { index: 14, label: 'Inset 6mm 23"' },
  { index: 15, label: 'AutoSoft XC 6mm 5"' },
  { index: 16, label: 'AutoSoft 90 6mm 23"' },
  { index: 17, label: 'AutoSoft 90 6mm 43"' },
  { index: 18, label: 'AutoSoft 90 9mm 23"' },
  { index: 19, label: 'AutoSoft 90 9mm 43"' },
  { index: 101, label: 'Not Serving' },
  { index: 102, label: 'Mio Advance Clear 9mm 23"' },
];

export const INFUSION_SET_2_OPTIONS = [
  { index: 0, label: 'AutoSoft 90 6mm 23"' },
  { index: 1, label: 'AutoSoft XC 6mm 23"' },
  { index: 2, label: 'AutoSoft 90 6mm 43"' },
  { index: 3, label: 'AutoSoft 90 9mm 23"' },
  { index: 4, label: 'AutoSoft 90 9mm 43"' },
  { index: 6, label: 'AutoSoft XC 6mm 5"' },
  { index: 7, label: 'AutoSoft XC 6mm 32"' },
  { index: 8, label: 'AutoSoft XC 6mm 43"' },
  { index: 9, label: 'AutoSoft XC 9mm 23"' },
  { index: 10, label: 'AutoSoft 30 13mm 23"' },
  { index: 11, label: 'TruSteel 6mm 23"' },
  { index: 12, label: 'TruSteel 6mm 32"' },
  { index: 13, label: 'TruSteel 8mm 23"' },
  { index: 14, label: 'TruSteel 8mm 32"' },
  { index: 15, label: 'VariSoft 13mm 23"' },
  { index: 16, label: 'VariSoft 13mm 32"' },
  { index: 17, label: 'VariSoft 17mm 23"' },
  { index: 18, label: 'Contact 6mm 23"' },
  { index: 19, label: 'Inset 6mm 23"' },
  { index: 101, label: 'Not Serving' },
];

export const SUBSCRIPTION_TYPE_OPTIONS = [
  { index: 0, label: 'Sensors' },
  { index: 1, label: 'Sensors & Supplies' },
  { index: 2, label: 'Supplies' },
];

export const WELCOME_CALL_TEXT_OPTIONS = [
  { index: 0, label: 'Send' },
];

export const ORDER_HANDLING_OPTIONS = [
  { index: 0, label: 'Separate' },
  { index: 1, label: 'Together' },
  { index: 2, label: 'Not Applicable' },
];

export const CGM_TYPE_OPTIONS = [
  { index: 0, label: 'FreeStyle Libre 14-Day' },
  { index: 1, label: 'Guardian 4' },
  { index: 2, label: 'Instinct' },
  { index: 3, label: 'FreeStyle Libre 3 Plus' },
  { index: 4, label: 'FreeStyle Libre 2 Plus' },
  { index: 6, label: 'Dexcom G7' },
  { index: 7, label: 'Dexcom G7 15-Day' },
  { index: 8, label: 'Dexcom G6' },
  { index: 9, label: 'Not Serving' },
];

export const SECONDARY_INSURANCE_OPTIONS = [
  { index: 0, label: 'None' },
  { index: 1, label: 'NY Medicaid' },
  { index: 2, label: 'Medicare Supplement' },
];

