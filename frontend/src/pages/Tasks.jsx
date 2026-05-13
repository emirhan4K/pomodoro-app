import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TaskService } from '../services/api.services';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const navigate = useNavigate();
  // Auth context'ten profil yenileme fonksiyonunu alıyoruz ki XP artınca Navbar hemen güncellensin
  const authContext = useAuth();
  const refreshProfile = authContext?.refreshProfile;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await TaskService.getTasks();
      // API yanıtına göre veri kısmını alıyoruz
      setTasks(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Görevler çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (id) => {
    try {
      await TaskService.completeTask(id);
      if (refreshProfile) await refreshProfile(); // Navbar'daki XP dolsun
      fetchTasks(); // Listeyi yenile ki görev alta düşsün/silikleşsin
    } catch (error) {
      console.error("Görev tamamlanamadı:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu görevi kalıcı olarak silmek istediğine emin misin?")) {
      try {
        await TaskService.deleteTask(id);
        fetchTasks();
      } catch (error) {
        console.error("Görev silinemedi:", error);
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0b0e14] text-white p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Üst Başlık Bölümü (Oda Lobisi ile Birebir Aynı) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <div className="w-full md:w-auto">
            <button 
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors text-sm font-black uppercase tracking-tighter"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              DASHBOARD
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight italic uppercase">
              Görev Merkezi
            </h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              Odaklan, görevlerini tamamla, XP kazan ve seviye atla.
            </p>
          </div>
          
          <button 
            onClick={openCreateModal}
            className="w-full md:w-auto justify-center px-6 py-3 md:px-8 md:py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm md:text-base"
          >
            <span className="text-xl">+</span> YENİ GÖREV EKLE
          </button>
        </div>

        {/* Görev Kartları Grid Yapısı */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskCard 
                  key={task._id} 
                  task={task} 
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-[#161b22] border border-gray-800 rounded-3xl shadow-inner">
                <p className="text-gray-500 font-black italic uppercase tracking-widest text-xs md:text-sm">
                  Henüz hiç görev tanımlanmamış.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ekleme/Düzenleme Modalı */}
      {isModalOpen && (
        <CreateTaskModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchTasks} 
          editTask={editingTask}
        />
      )}
    </div>
  );
};

export default Tasks;