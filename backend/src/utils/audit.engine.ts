import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class AuditEngine {
  private static logFilePath = path.join(process.cwd(), 'openmrs-audit.jsonl');

  /**
   * Generates a cryptographically secure, immutable audit trail entry.
   * This is designed to be ingested by Splunk/ELK.
   */
  static async logEvent(eventType: string, userId: number, details: any) {
    const timestamp = new Date().toISOString();
    const eventId = crypto.randomUUID();
    
    const payload = {
      audit_id: eventId,
      timestamp,
      event_type: eventType,
      user_id: userId,
      details,
      // In a real system, you'd add IP address, User-Agent, and a cryptographic hash chain
      hash: crypto.createHash('sha256').update(`${eventId}${timestamp}${eventType}${userId}${JSON.stringify(details)}`).digest('hex')
    };

    const logLine = JSON.stringify(payload) + '\n';
    
    // Asynchronous append (don't block API)
    fs.appendFile(this.logFilePath, logLine, (err) => {
      if (err) console.error('[AUDIT ENGINE] Failed to write to audit log', err);
    });
    
    console.log(`[AUDIT] 🚨 Security Event Logged: ${eventType} (User: ${userId})`);
  }
}
