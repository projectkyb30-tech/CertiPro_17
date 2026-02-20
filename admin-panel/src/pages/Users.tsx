import { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { Trash, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur dorești să ștergi acest utilizator?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('Utilizator șters cu succes');
      loadUsers();
    } catch (err) {
      toast.error('Eroare la ștergere', {
        description: 'Verifică consola pentru detalii'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Sigur dorești să ștergi ${selectedIds.length} utilizatori?`)) return;
    try {
      await adminApi.bulkDeleteUsers(selectedIds);
      toast.success(`${selectedIds.length} utilizatori șterși`);
      setSelectedIds([]);
      loadUsers();
    } catch (err) {
      toast.error('Eroare la ștergere multiplă');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u.id));
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleRoleUpdate = async (id: string, newRole: string) => {
    try {
      await adminApi.updateUser(id, { role: newRole });
      toast.success('Rol actualizat');
      loadUsers();
    } catch (err) {
      toast.error('Eroare la actualizare');
    }
  };

  if (loading) return <div className="p-8">Se încarcă...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Utilizatori</h1>
        {selectedIds.length > 0 && (
          <button 
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash className="w-4 h-4" />
            Șterge ({selectedIds.length})
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  checked={users.length > 0 && selectedIds.length === users.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Rol</th>
              <th className="p-4 font-semibold text-gray-600">Creat la</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  {user.email}
                </td>
                <td className="p-4">
                  <select 
                    value={user.user_metadata?.role || 'user'}
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                    className="border-gray-300 rounded-md text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
