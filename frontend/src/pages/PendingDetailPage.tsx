import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Clock } from 'lucide-react';

export default function PendingDetailPage() {
  const { id } = useParams();
  const { pendingTasks } = useData();
  const navigate = useNavigate();

  const task = pendingTasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Görev bulunamadı</p>
        <button onClick={() => navigate('/pending')} className="mt-4 text-orange-600">
          Bekleyen işlere dön
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/pending')} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-orange-600 text-sm mb-2">
          <Clock className="w-4 h-4" />
          <span>{task.waitingDays} gündür bekliyor</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">{task.title}</h1>
        <p className="text-gray-500 mt-2">{task.description}</p>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-800">{task.requesterName}</p>
          <p className="text-sm text-gray-500">{task.requesterPhone}</p>
        </div>
      </div>
    </div>
  );
}
