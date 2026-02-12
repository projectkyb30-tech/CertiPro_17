import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, ArrowLeft, Plus, Trash, Code, FileText, Settings } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';

export const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = React.useRef<ReactQuill>(null);
  const [loading, setLoading] = useState(false);
  
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'python',
    is_published: false,
    icon: '',
    modules: [] as any[]
  });

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Custom Image Handler
  const imageHandler = React.useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const res = await adminApi.uploadFile(file);
          const range = quillRef.current?.getEditor().getSelection();
          if (range) {
            quillRef.current?.getEditor().insertEmbed(range.index, 'image', res.url);
          }
        } catch (err) {
          console.error('Upload failed', err);
          alert('Upload failed');
        }
      }
    };
  }, []);

  const quillModules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  // Load data
  useEffect(() => {
    if (id && id !== 'new') {
      loadCourse(id);
    }
  }, [id]);

  const loadCourse = async (courseId: string) => {
    setLoading(true);
    try {
      const data = await adminApi.getCourse(courseId);
      setCourse({ ...data, category: data.category || 'python', modules: data.modules || [] });
      
      // Don't auto-select module, show settings by default
      // if (data.modules?.length > 0) {
      //   setActiveModuleId(data.modules[0].id);
      //   if (data.modules[0].lessons?.length > 0) {
      //     setActiveLessonId(data.modules[0].lessons[0].id);
      //   }
      // }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (id === 'new') {
        const newCourse = await adminApi.createCourse(course);
        navigate(`/courses/${newCourse.id}/edit`);
      } else {
        await adminApi.updateCourse(id!, course);
        alert('Salvat cu succes!');
      }
    } catch (err) {
      console.error(err);
      alert('Eroare la salvare');
    } finally {
      setLoading(false);
    }
  };

  const addModule = () => {
    const newModule = {
      id: `temp-${Date.now()}`,
      title: 'Capitol Nou',
      order: course.modules.length,
      lessons: []
    };
    setCourse({ ...course, modules: [...course.modules, newModule] });
    setActiveModuleId(newModule.id);
    setActiveLessonId(null);
  };

  const addLesson = (moduleId: string) => {
    const newLesson = {
      id: `temp-${Date.now()}`,
      title: 'Lecție Nouă',
      content: '',
      type: 'text',
      order: 0,
      module_id: moduleId
    };
    
    const updatedModules = course.modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: [...(m.lessons || []), newLesson] };
      }
      return m;
    });

    setCourse({ ...course, modules: updatedModules });
    setActiveLessonId(newLesson.id);
  };

  const updateModule = (moduleId: string, updates: any) => {
    const updatedModules = course.modules.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    );
    setCourse({ ...course, modules: updatedModules });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: any) => {
    const updatedModules = course.modules.map(m => {
      if (m.id === moduleId) {
        const updatedLessons = m.lessons.map((l: any) => 
          l.id === lessonId ? { ...l, ...updates } : l
        );
        return { ...m, lessons: updatedLessons };
      }
      return m;
    });
    setCourse({ ...course, modules: updatedModules });
  };

  const getActiveModule = () => course.modules.find(m => m.id === activeModuleId);
  const getActiveLesson = () => {
    const module = getActiveModule();
    return module?.lessons?.find((l: any) => l.id === activeLessonId);
  };

  const activeModule = getActiveModule();
  const activeLesson = getActiveLesson();

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => navigate('/courses')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex gap-4 flex-1 max-w-2xl items-center">
            <input 
              type="text" 
              value={course.title}
              onChange={(e) => setCourse({...course, title: e.target.value})}
              placeholder="Titlu Curs..."
              className="text-xl font-bold border-none focus:ring-0 placeholder-gray-300 flex-1 bg-transparent"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Se salvează...' : 'Salvează'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Structure */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-700">Structură Curs</h3>
            <button onClick={addModule} className="p-1 hover:bg-gray-200 rounded text-blue-600" title="Adaugă Capitol">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-2 space-y-2">
            {/* Global Settings Item */}
            <div 
              className={`p-3 cursor-pointer rounded-lg border flex items-center gap-3 transition-colors ${!activeModuleId ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}
              onClick={() => {
                setActiveModuleId(null);
                setActiveLessonId(null);
              }}
            >
              <Settings className="w-5 h-5" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">Setări Curs</span>
                <span className="text-[10px] opacity-75">Preț, Descriere, Icon</span>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-1" />

            {course.modules.map((module) => (
              <div key={module.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <div 
                  className={`p-3 cursor-pointer flex justify-between items-center ${activeModuleId === module.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    setActiveModuleId(module.id);
                    setActiveLessonId(null); // Deselect lesson when selecting module
                  }}
                >
                  <span className="font-medium text-sm text-gray-800">{module.title}</span>
                  <div className="flex gap-1">
                     <button className="text-gray-400 hover:text-red-500"><Trash className="w-3 h-3" /></button>
                  </div>
                </div>
                
                {/* Lessons List */}
                {activeModuleId === module.id && (
                  <div className="bg-gray-50 p-2 space-y-1 border-t border-gray-100">
                    {module.lessons?.map((lesson: any) => (
                      <div 
                        key={lesson.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLessonId(lesson.id);
                        }}
                        className={`p-2 pl-4 text-sm rounded cursor-pointer flex items-center gap-2 ${activeLessonId === lesson.id ? 'bg-white shadow-sm text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {lesson.type === 'react' ? <Code className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {lesson.title}
                      </div>
                    ))}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addLesson(module.id);
                      }}
                      className="w-full text-left p-2 text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Adaugă Lecție
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
          {activeLesson ? (
            // LESSON EDITOR
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px] flex flex-col">
               <div className="p-6 border-b border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <input 
                      className="text-2xl font-bold border-none focus:ring-0 p-0 w-full" 
                      placeholder="Titlu Lecție"
                      value={activeLesson.title}
                      onChange={(e) => updateLesson(activeModuleId!, activeLessonId!, { title: e.target.value })}
                    />
                    <select 
                      value={activeLesson.type}
                      onChange={(e) => updateLesson(activeModuleId!, activeLessonId!, { type: e.target.value })}
                      className="border-gray-200 rounded-lg text-sm bg-gray-50"
                    >
                      <option value="text">Text / Video</option>
                      <option value="react">Componentă Interactivă (React)</option>
                      <option value="presentation">Prezentare (Slide Deck)</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  
                  {activeLesson.type === 'react' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <label className="block text-sm font-medium text-blue-900 mb-1">Nume Componentă React</label>
                      <input 
                        type="text"
                        className="w-full border-blue-200 rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: PythonBasicsDemo, SQLTerminal, NetworkSimulator"
                        value={activeLesson.content} 
                        onChange={(e) => updateLesson(activeModuleId!, activeLessonId!, { content: e.target.value })}
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        Această componentă va fi randată dinamic în aplicația utilizatorului. Asigură-te că există în ComponentRegistry.
                      </p>
                    </div>
                  )}

                  {activeLesson.type === 'presentation' && (
                    <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 space-y-4">
                      <div className="flex items-start justify-between">
                         <div>
                           <h3 className="text-indigo-900 font-semibold mb-1">Fișier Prezentare (Code-Based Slides)</h3>
                           <p className="text-sm text-indigo-700">
                             Încarcă fișierul JSON/MDX care definește structura prezentării.
                             Acesta va fi randat automat ca un slide-deck interactiv.
                           </p>
                         </div>
                         <div className="bg-white p-2 rounded shadow-sm">
                           <code className="text-xs text-gray-500">Supported: .json, .md, .mdx</code>
                         </div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                          <Plus className="w-4 h-4" />
                          Încarcă Fișier
                          <input 
                            type="file" 
                            accept=".json,.md,.mdx,.txt"
                            className="hidden"
                            onChange={async (e) => {
                              if (e.target.files?.[0]) {
                                try {
                                  setLoading(true);
                                  const res = await adminApi.uploadFile(e.target.files[0]);
                                  updateLesson(activeModuleId!, activeLessonId!, { content: res.url });
                                } catch (err) {
                                  alert('Upload failed');
                                } finally {
                                  setLoading(false);
                                }
                              }
                            }}
                          />
                        </label>
                        
                        {activeLesson.content && (
                          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded border border-green-200">
                            <FileText className="w-4 h-4" />
                            Fișier încărcat cu succes
                          </div>
                        )}
                      </div>

                      {activeLesson.content && (
                        <div className="mt-4 p-4 bg-gray-900 rounded-lg text-gray-300 font-mono text-sm overflow-hidden">
                          <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                            <span>PREVIEW SOURCE URL</span>
                            <a href={activeLesson.content} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Deschide</a>
                          </div>
                          <div className="break-all">{activeLesson.content}</div>
                        </div>
                      )}
                    </div>
                  )}
               </div>
               
               {activeLesson.type === 'text' && (
                 <div className="flex-1 p-6">
                   <ReactQuill 
                     ref={quillRef}
                     theme="snow"
                     modules={quillModules}
                     value={activeLesson.content || ''}
                     onChange={(content) => updateLesson(activeModuleId!, activeLessonId!, { content })}
                     className="h-[400px]"
                     placeholder="Scrie conținutul lecției aici..."
                   />
                 </div>
               )}
            </div>
          ) : activeModule ? (
            // MODULE EDITOR
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Editare Capitol</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titlu Capitol</label>
                  <input 
                    type="text"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={activeModule.title}
                    onChange={(e) => updateModule(activeModuleId!, { title: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ) : (
            // COURSE SETTINGS
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Setări Curs
              </h2>
              
              <div className="space-y-6 max-w-2xl">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titlu Curs</label>
                  <input 
                    type="text"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={course.title}
                    onChange={(e) => setCourse({...course, title: e.target.value})}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descriere</label>
                  <textarea 
                    rows={4}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={course.description || ''}
                    onChange={(e) => setCourse({...course, description: e.target.value})}
                    placeholder="Descrie despre ce este acest curs..."
                  />
                </div>

                {/* Price & Published */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preț (EUR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      <input 
                        type="number"
                        min="0"
                        className="w-full pl-8 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        value={course.price}
                        onChange={(e) => setCourse({...course, price: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={course.is_published || false}
                        onChange={(e) => setCourse({...course, is_published: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-gray-700 font-medium">Publicat</span>
                    </label>
                  </div>
                </div>

                {/* Icon URL */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL (SVG/PNG)</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input 
                          type="text"
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                          value={course.icon || ''}
                          onChange={(e) => setCourse({...course, icon: e.target.value})}
                          placeholder="https://..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Lăsați gol pentru a folosi iconița implicită a categoriei.</p>
                      </div>
                      {course.icon && (
                        <div className="w-16 h-16 rounded-lg border border-gray-200 p-2 flex items-center justify-center bg-gray-50">
                          <img src={course.icon} className="max-w-full max-h-full object-contain" alt="Preview" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                      )}
                    </div>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
