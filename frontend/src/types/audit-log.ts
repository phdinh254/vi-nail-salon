export type AuditLogEntry = {
  id: string;
  actorName: string;
  actorRole: "STAFF" | "ADMIN" | "SYSTEM";
  action: string;
  resourceType: string;
  resourceLabel: string;
  createdAt: string;
};
