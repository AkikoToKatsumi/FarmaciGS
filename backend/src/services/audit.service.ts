import { prisma } from '../config/database';

export interface CreateAuditLogParams {
  userId: number;
  action: string;
  details?: string;
}

export const createAuditLog = async ({ userId, action, details }: CreateAuditLogParams) => {
  // ...
};
