const { supabaseAdmin } = require('../lib/supabaseAdmin');

/**
 * Service for logging critical system and user actions.
 * These logs provide an audit trail for security and troubleshooting.
 */
const auditService = {
  /**
   * Logs an action to the audit_logs table.
   * Fails silently to ensure the main business logic is not interrupted.
   */
  async logAction(userId, action, details = {}) {
    try {
      const logEntry = {
        user_id: userId,
        action: action,
        details: details,
        ip_address: details.ip || null,
        user_agent: details.userAgent || null,
        created_at: new Date().toISOString()
      };

      // In a real environment, this would go to a dedicated 'audit_logs' table
      // We use supabaseAdmin to bypass RLS for logging
      const { error } = await supabaseAdmin
        .from('audit_logs')
        .insert(logEntry);

      if (error) {
        // If table doesn't exist, we fallback to console but don't crash
        console.warn(`[Audit Log Fallback]: ${action} by ${userId}`, details);
      }
    } catch (err) {
      console.error('Audit logging failed:', err);
    }
  }
};

module.exports = auditService;
