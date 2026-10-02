import Dexie, { type EntityTable } from "dexie";
import { Lead } from "@/types/lead";
import { Conversation } from "@/types/chat";

const db = new Dexie("LeadPilotDB") as Dexie & {
  leads: EntityTable<Lead, "id">;
  conversations: EntityTable<Conversation, "id">;
};

db.version(1).stores({
  leads: "id, name, priorityScore, status, createdAt",
  conversations: "id, leadId, createdAt",
});

// lead CRUD
export async function createLead(lead: Lead): Promise<string> {
  await db.leads.add(lead);
  return lead.id;
}

export async function getLeads(): Promise<Lead[]> {
  return db.leads.toArray();
}

export async function getLead(id: string): Promise<Lead | undefined> {
  return db.leads.get(id);
}

export async function updateLead(
  id: string,
  updates: Partial<Lead>
): Promise<void> {
  await db.leads.update(id, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteLead(id: string): Promise<void> {
  await db.leads.delete(id);
  // also delete associated conversations
  await db.conversations.where("leadId").equals(id).delete();
}

// conversation helpers
export async function getConversation(
  leadId: string
): Promise<Conversation | undefined> {
  return db.conversations.where("leadId").equals(leadId).first();
}

export async function saveConversation(
  conversation: Conversation
): Promise<void> {
  await db.conversations.put(conversation);
}

// utility
export async function getLeadCount(): Promise<number> {
  return db.leads.count();
}

export default db;
