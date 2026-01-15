import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CenazeDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/cenaze')} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <p className="text-gray-500">Cenaze detayı</p>
      </div>
    </div>
  );
}
