import { createSupabaseCRUDController } from './baseSupabaseController.js';
import { asyncHandler } from '../middleware/validate.js';
import supabase from '../config/supabase.js';

const base = createSupabaseCRUDController('contacts', {
  searchFields: ['name', 'email', 'phone', 'subject', 'message'],
  filterMap: { status: 'status' },
  defaultSort: { column: 'created_at', ascending: false },
});

export const getContacts = base.getAll;
export const getContactById = base.getOne;
export const updateContact = base.update;
export const deleteContact = base.remove;

// Public inquiry submission
export const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      name: name || 'Anonymous',
      email: email || null,
      phone: phone || null,
      subject: subject || 'General Inquiry',
      message: message || '',
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(201).json({ success: true, message: 'Message sent successfully', data });
});
