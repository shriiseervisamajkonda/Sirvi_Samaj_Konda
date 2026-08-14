/**
 * ============================================================================
 * SUPABASE DATABASE ADAPTER & CRUD SERVICE
 * Provides unified, high-performance PostgreSQL operations via Supabase client.
 * Maintains complete API contract parity with previous Mongoose operations.
 * ============================================================================
 */

import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export class SupabaseService {
  constructor(tableName, defaultSelect = '*') {
    this.tableName = tableName;
    this.defaultSelect = defaultSelect;
  }

  // Find multiple records with pagination, filtering, searching and sorting
  async findMany({
    page = 1,
    limit = 10,
    select = this.defaultSelect,
    filters = {},
    search = '',
    searchColumns = [],
    orderBy = 'created_at',
    ascending = false,
  } = {}) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(this.tableName)
      .select(select, { count: 'exact' });

    // Apply strict equality or boolean filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    // Apply search across specified columns
    if (search && searchColumns.length > 0) {
      const orFilter = searchColumns
        .map(col => `${col}.ilike.%${search}%`)
        .join(',');
      query = query.or(orFilter);
    }

    // Apply sorting & pagination
    query = query.order(orderBy, { ascending }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // Find single record by ID or field
  async findById(id, select = this.defaultSelect) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Find single record by custom field
  async findOne(field, value, select = this.defaultSelect) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .select(select)
      .eq(field, value)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Create new record
  async create(recordData) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(recordData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update existing record by ID
  async update(id, updateData) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .update({ ...updateData, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete record by ID
  async delete(id) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Count documents matching filter
  async count(filters = {}) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured in .env');
    }

    let query = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query = query.eq(key, value);
      }
    });

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  }
}

// Pre-instantiated service instances for all primary tables
export const usersDb = new SupabaseService('users');
export const villageDb = new SupabaseService('village_information');
export const settingsDb = new SupabaseService('settings');
export const familiesDb = new SupabaseService('families');
export const familyMembersDb = new SupabaseService('family_members');
export const committeesDb = new SupabaseService('committees');
export const organizationsDb = new SupabaseService('organizations');
export const gramUnitsDb = new SupabaseService('gram_units');
export const gramUnitMembersDb = new SupabaseService('gram_unit_members');
export const formationEventsDb = new SupabaseService('formation_events');
export const eventsDb = new SupabaseService('events');
export const newsDb = new SupabaseService('news');
export const albumsDb = new SupabaseService('albums');
export const galleryDb = new SupabaseService('gallery');
export const documentsDb = new SupabaseService('documents');
export const donationsDb = new SupabaseService('donations');
export const lekhaJokhaDb = new SupabaseService('lekha_jokha');
export const panchSettlementsDb = new SupabaseService('panch_settlements');
export const socialInfoDb = new SupabaseService('social_info');
export const studentsDb = new SupabaseService('students');
export const businessesDb = new SupabaseService('businesses');
export const bloodDonorsDb = new SupabaseService('blood_donors');
export const marriageProfilesDb = new SupabaseService('marriage_profiles');
export const contactsDb = new SupabaseService('contacts');
export const activityLogsDb = new SupabaseService('activity_logs');
