import { getAdminDb } from '@/lib/firebase-admin';

export type AuditAction = 
  | 'create_agent' | 'update_agent' | 'delete_agent' 
  | 'override_create' | 'override_delete'
  | 'eval_submit' | 'eval_update'
  | 'agent_graduation' | 'batch_archive'
  | 'config_change' | 'system_repair'
  | 'staff_login' | 'password_change';

export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  targetId?: string;
  targetName?: string;
  details?: any;
  timestamp: string;
  ip?: string;
}

export class AuditService {
  private static readonly COLLECTION = 'activity_logs';

  /**
   * Log an activity to Firestore
   */
  static async log(log: Omit<AuditLog, 'timestamp'>) {
    try {
      const db = getAdminDb();
      const fullLog: AuditLog = {
        ...log,
        timestamp: new Date().toISOString()
      };
      
      await db.collection(this.COLLECTION).add(fullLog);
      console.log(`[AuditService] Logged action: ${log.action} by ${log.userName}`);
    } catch (err) {
      console.error('[AuditService] Failed to log activity:', err);
    }
  }

  /**
   * Get recent logs (Admin only)
   */
  static async getRecentLogs(limit: number = 100) {
    const db = getAdminDb();
    const snap = await db.collection(this.COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snap.docs.map(d => ({ id: d.id, ...d.data() })) as AuditLog[];
  }
}
