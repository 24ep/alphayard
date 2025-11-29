import { api } from '.';

export interface TodoItem {
  id: string;
  title: string;
  description?: string | null;
  is_completed: boolean;
  position: number;
  family_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const todosApi = {
  async list() {
    const res = await api.get('/todos');
    return res.data;
  },
  async create(payload: { title: string; description?: string | null }) {
    const res = await api.post('/todos', payload);
    return res.data;
  },
  async update(id: string, payload: Partial<{ title: string; description?: string | null; is_completed: boolean }>) {
    const res = await api.put(`/todos/${id}`, payload);
    return res.data;
  },
  async remove(id: string) {
    const res = await api.delete(`/todos/${id}`);
    return res.data;
  },
  async reorder(orderedIds: string[]) {
    const res = await api.post('/todos/reorder', { orderedIds });
    return res.data;
  },
};


