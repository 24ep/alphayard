import { api } from '.';

export interface TodoItem {
  id: string;
  title: string;
  description?: string | null;
  is_completed: boolean;
  position: number;
  category: 'work' | 'personal' | 'family' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  family_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string | null;
  category?: 'work' | 'personal' | 'family' | 'urgent';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
}

export interface UpdateTodoPayload {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  category?: 'work' | 'personal' | 'family' | 'urgent';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
}

export const todosApi = {
  async list() {
    const res = await api.get('/todos');
    return res.data;
  },
  async create(payload: CreateTodoPayload) {
    const res = await api.post('/todos', payload);
    return res.data;
  },
  async update(id: string, payload: UpdateTodoPayload) {
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
