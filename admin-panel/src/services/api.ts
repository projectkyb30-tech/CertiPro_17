const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

const getHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const parseJson = async (res: Response) => {
  const json = await res.json();
  if (!res.ok) {
    const message = (json && (json.error || json.message)) || 'Request failed';
    throw new Error(message);
  }
  return json.data ?? json;
};

export const adminApi = {
  getStats: async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getHeaders() });
    return parseJson(res);
  },

  getCourses: async () => {
    const res = await fetch(`${BASE_URL}/admin/courses`, { headers: getHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      return [];
    }
    return parseJson(res);
  },

  getCourse: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/courses/${id}`, { headers: getHeaders() });
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      return null as any;
    }
    return parseJson(res);
  },

  createCourse: async (data: any) => {
    const res = await fetch(`${BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return parseJson(res);
  },

  updateCourse: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/courses/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return parseJson(res);
  },

  deleteCourse: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return parseJson(res);
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

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      const message = (json && (json.error || json.message)) || 'Failed to upload file';
      throw new Error(message);
    }

    const json = await res.json();
    return json.data ?? json;
  },

  getUsers: async (page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}/admin/users?page=${page}&limit=${limit}`, { headers: getHeaders() });
    return parseJson(res);
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return parseJson(res);
  },

  bulkDeleteUsers: async (ids: string[]) => {
    const res = await fetch(`${BASE_URL}/admin/users/bulk-delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ids })
    });
    return parseJson(res);
  },

  updateUser: async (id: string, data: any) => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return parseJson(res);
  }
};
