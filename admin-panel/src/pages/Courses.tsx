import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Loader2, Trash2, Edit } from 'lucide-react';
import { adminApi } from '../services/api';
import { toast } from 'sonner';

export const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await adminApi.getCourses();
      if (Array.isArray(data)) {
        setCourses(data);
      } else {
        console.error('Invalid courses data:', data);
        setCourses([]);
      }
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest curs?')) {
      try {
        await adminApi.deleteCourse(id);
        toast.success('Curs șters cu succes');
        setCourses(courses.filter(c => c.id !== id));
      } catch (err) {
        toast.error('Eroare la ștergere');
      }
    }
  };

  const filteredCourses = (courses || []).filter(course => 
    course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management Cursuri</h1>
          <p className="text-gray-500">Gestionează structura și conținutul cursurilor</p>
        </div>
        <button 
          onClick={() => navigate('/courses/new')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Curs Nou
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Caută cursuri..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
             <div className="h-32 bg-gray-100 flex items-center justify-center">
                {course.icon ? (
                  <span className="text-4xl">{course.icon}</span> // Assuming icon is emoji/text for now
                ) : (
                  <FileText className="w-12 h-12 text-gray-300" />
                )}
             </div>
             <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-gray-900 line-clamp-1" title={course.title}>{course.title}</h3>
                   <span className={`px-2 py-1 text-xs rounded-full ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                     {course.is_published ? 'Publicat' : 'Draft'}
                   </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                  {course.description || 'Fără descriere'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                   <span>{course.price > 0 ? `$${course.price}` : 'Gratuit'}</span>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/courses/${course.id}/edit`)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
             Nu am găsit cursuri care să corespundă căutării.
          </div>
        )}
      </div>
    </div>
  );
};
