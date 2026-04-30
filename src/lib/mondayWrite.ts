import { writeStatusIndex, writeNumber, writeLocation, COL } from "./mondayApi";
import type { Patient } from "./workflow";

export async function sendPatientToMonday(p: Patient): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (p.monitorQty) tasks.push(writeNumber(p.id, COL.monitorQty, Number(p.monitorQty)));
  if (p.pumpQty) tasks.push(writeNumber(p.id, COL.pumpQty, Number(p.pumpQty)));
  if (p.qtyInf1) tasks.push(writeNumber(p.id, COL.qtyInf1, Number(p.qtyInf1)));
  if (p.qtyInf2) tasks.push(writeNumber(p.id, COL.qtyInf2, Number(p.qtyInf2)));

  if (p.infusionSet1Index !== null)
    tasks.push(writeStatusIndex(p.id, COL.infusionSet1, p.infusionSet1Index));
  if (p.infusionSet2Index !== null)
    tasks.push(writeStatusIndex(p.id, COL.infusionSet2, p.infusionSet2Index));
  if (p.subscriptionTypeIndex !== null)
    tasks.push(writeStatusIndex(p.id, COL.subscriptionType, p.subscriptionTypeIndex));
  if (p.welcomeCallTextIndex !== null)
    tasks.push(writeStatusIndex(p.id, COL.welcomeCallText, p.welcomeCallTextIndex));
  if (p.orderHandlingIndex !== null)
    tasks.push(writeStatusIndex(p.id, COL.orderHandling, p.orderHandlingIndex));

  if (p.addressEdited) tasks.push(writeLocation(p.id, COL.address, p.addressEdited));

  tasks.push(writeStatusIndex(p.id, COL.stageAdvancer, 4)); // Completed

  await Promise.all(tasks);
}

export async function escalatePatient(itemId: string): Promise<void> {
  await writeStatusIndex(itemId, COL.escalation, 0); // Escalation Required
}
