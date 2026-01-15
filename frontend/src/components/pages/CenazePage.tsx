import { Heart } from 'lucide-react';

export default function CenazePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Cenaze İşlemleri</h1>

      <div className="bg-white rounded-xl p-8 text-center">
        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Cenaze kaydı bulunmuyor</p>
        <p className="text-sm text-gray-400 mt-2">Word dosyası yükleyerek cenaze bilgisi ekleyebilirsiniz</p>
      </div>
    </div>
  );
}
