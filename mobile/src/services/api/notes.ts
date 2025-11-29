import { api } from '.';

export interface Note {
  id: string;
  title: string | null;
  content: string;
  family_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const notesApi = {
  async list() {
    const res = await api.get('/notes');
    return res.data;
  },
  async create(payload: { title?: string; content?: string }) {
    const res = await api.post('/notes', payload);
    return res.data;
  },
  async update(id: string, payload: Partial<{ title: string | null; content: string }>) {
    const res = await api.put(`/notes/${id}`, payload);
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`/notes/${id}`);
    return res.data;
  },
};


