import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <h1 className="text-xl font-bold text-gray-800">Raporlar</h1>

      <div className="bg-white rounded-xl p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Rapor verisi bulunmuyor</p>
      </div>
    </div>
  );
}
