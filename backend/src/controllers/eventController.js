import { createSupabaseCRUDController } from './baseSupabaseController.js';

const base = createSupabaseCRUDController('events', {
  searchFields: ['title', 'description', 'location'],
  filterMap: {
    event_type: 'event_type',
    status: 'status',
  },
  defaultSort: { column: 'start_date', ascending: false },
});

export const getEvents = base.getAll;
export const getEventById = base.getOne;
export const createEvent = base.create;
export const updateEvent = base.update;
export const deleteEvent = base.remove;
