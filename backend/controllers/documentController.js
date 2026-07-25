import { supabaseAdmin } from '../supabase.js';

// --- DOCUMENT CATEGORIES ---

export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('document_categories').select('*').order('created_at', { ascending: false });
    if (error && error.code !== '42P01') throw error;
    res.json(data || []);
  } catch (error) {
    res.json([]);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Tên thư mục là bắt buộc' });

    const { data, error } = await supabaseAdmin
      .from('document_categories')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Tên thư mục là bắt buộc' });

    const { data, error } = await supabaseAdmin
      .from('document_categories')
      .update({ name, description })
      .eq('category_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await supabaseAdmin
      .from('documents')
      .update({ category_id: null })
      .eq('category_id', id);

    const { error } = await supabaseAdmin
      .from('document_categories')
      .delete()
      .eq('category_id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Đã xóa thư mục' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- DOCUMENTS (Tương thích cả CSDL 3NF & CSDL cũ) ---

export const getDocuments = async (req, res) => {
  try {
    const { category_id, class_id } = req.query;
    
    let { data, error } = await supabaseAdmin
      .from('documents')
      .select('*, document_categories(name), classes(class_name)')
      .order('created_at', { ascending: false });

    if (error && (error.code === 'PGRST200' || error.message?.includes('relationship'))) {
      const fallback = await supabaseAdmin.from('documents').select('*').order('created_at', { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    let result = data || [];
    if (category_id) {
      result = result.filter(d => d.category_id === category_id);
    }
    if (class_id && class_id !== 'All') {
      result = result.filter(d => !d.class_id || d.class_id === class_id);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { title, description, drive_link, category_id, class_id, class_name, file_url } = req.body;
    
    // Support both drive_link and file_url
    const link = drive_link || file_url;
    if (!title || !link) {
      return res.status(400).json({ error: 'Title và link tài liệu là bắt buộc' });
    }

    // Build insert payload - handle class_name vs class_id mismatch
    const insertData = { 
      title, 
      description, 
      drive_link: link, 
      category_id: category_id || null,
    };
    // Try class_id first (database.sql schema), fallback to class_name (actual Supabase)
    if (class_id) insertData.class_id = class_id;
    if (class_name) insertData.class_name = class_name;

    const { data, error } = await supabaseAdmin
      .from('documents')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      // If class_id fails (column doesn't exist), try class_name
      if (error.code === '42703' || error.message?.includes('class_id')) {
        const fallbackData = { title, description, drive_link: link, category_id: category_id || null };
        if (class_name) fallbackData.class_name = class_name;
        const fallback = await supabaseAdmin.from('documents').insert([fallbackData]).select().single();
        if (fallback.error) throw fallback.error;
        return res.status(201).json(fallback.data);
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, drive_link, category_id, class_id, class_name, file_url } = req.body;
    
    const link = drive_link || file_url;
    if (!title || !link) {
      return res.status(400).json({ error: 'Title và link tài liệu là bắt buộc' });
    }

    const updateData = { 
      title, 
      description, 
      drive_link: link, 
      category_id: category_id || null 
    };
    if (class_id !== undefined) updateData.class_id = class_id || null;
    if (class_name !== undefined) updateData.class_name = class_name || null;

    const { data, error } = await supabaseAdmin
      .from('documents')
      .update(updateData)
      .eq('document_id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    await supabaseAdmin
      .from('assignment_documents')
      .delete()
      .eq('document_id', id)
      .then(() => {}).catch(() => {});

    const { error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('document_id', id);

    if (error) throw error;
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- ASSIGNMENT DOCUMENTS ---

export const assignDocument = async (req, res) => {
  try {
    const { assignment_id, document_id } = req.body;
    
    if (!assignment_id || !document_id) {
      return res.status(400).json({ error: 'assignment_id and document_id are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('assignment_documents')
      .insert([{ assignment_id, document_id }])
      .select();

    if (error) {
      if (error.code === '23505') {
         return res.status(400).json({ error: 'Document already assigned to this assignment' });
      }
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeAssignedDocument = async (req, res) => {
  try {
    const { assignment_id, document_id } = req.params;
    
    const { error } = await supabaseAdmin
      .from('assignment_documents')
      .delete()
      .match({ assignment_id, document_id });

    if (error) throw error;
    res.json({ message: 'Assigned document removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssignmentDocuments = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('assignment_documents')
      .select('*, documents(*)')
      .eq('assignment_id', assignment_id);

    if (error && (error.code === 'PGRST200' || error.message?.includes('relationship'))) {
      const fallback = await supabaseAdmin.from('assignment_documents').select('*').eq('assignment_id', assignment_id);
      return res.json(fallback.data || []);
    }
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
