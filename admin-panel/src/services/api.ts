const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

const getHeaders = () => {
  const token = localStorage.getItem('admin_token');
  // If we are testing locally without real auth flow, we might need to handle this.
  // For now assuming token is present or handled.
  // In development, we might mock the token if we don't have a login page yet in admin panel.
  // However, the user asked for full architecture.
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };
};

export const adminApi = {
  // Stats
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders() });
    return res.json();
  },

  // Courses
  getCourses: async () => {
    const res = await fetch(`${BASE_URL}/admin/courses`, { headers: getHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      return [];
    }
    return res.json();
  },

  getCourse: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/courses/${id}`, { headers: getHeaders() });
    return res.json();
  },

  createCourse: async (data: any) => {
    const res = await fetch(`${BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  updateCourse: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  deleteCourse: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = getHeaders();
    delete (headers as any)['Content-Type'];
    
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (!res.ok) throw new Error('Failed to upload file');
    return res.json();
  },

  // Users
  getUsers: async (page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}/admin/users?page=${page}&limit=${limit}`, { headers: getHeaders() });
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  bulkDeleteUsers: async (ids: string[]) => {
    const res = await fetch(`${BASE_URL}/admin/users/bulk-delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids })
    });
    return res.json();
  },

  updateUser: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
