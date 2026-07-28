import { supabaseAdmin } from '../supabase.js';

/**
 * Ghi log hoạt động vào bảng activity_logs
 * @param {string} actor_role 'admin' | 'student' | 'system'
 * @param {string} actor_id ID của người thực hiện (nếu có)
 * @param {string} action_type 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'SUBMIT' | 'LOGIN' v.v.
 * @param {string} entity 'students' | 'tuition_fees' | 'schedules' | 'assignments' | 'grades' | 'notifications' | 'system'
 * @param {string} description Nội dung log chi tiết
 */
export const logActivity = async (actor_role, actor_id, action_type, entity, description) => {
  try {
    // Strip raw UUIDs and ID strings from log descriptions for human readability
    const cleanDesc = description
      ? String(description)
          .replace(/\s*ID:\s*[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi, '')
          .replace(/\s*ID:\s*[0-9a-fA-F-]{10,}/gi, '')
          .replace(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
      : description;

    const payload = {
      actor_role,
      action_type,
      description: cleanDesc
    };
    if (actor_id) {
      payload.actor_id = actor_id;
    }

    const { error } = await supabaseAdmin
      .from('activity_logs')
      .insert(payload);

    if (error) {
      console.error('Lỗi khi ghi log hoạt động:', error);
    }
  } catch (err) {
    console.error('Lỗi ngoại lệ khi ghi log:', err);
  }
};
