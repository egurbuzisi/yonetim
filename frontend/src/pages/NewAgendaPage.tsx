import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData, allUsers } from '../contexts/DataContext';
import { ArrowLeft, User, Users, X, Check, Search } from 'lucide-react';
import { staffApi } from '../services/api';

export default function NewAgendaPage() {
  const { user } = useAuth();
  const { addAgenda } = useData();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [relatedTo, setRelatedTo] = useState('');
  const [relatedToName, setRelatedToName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showRelatedSelector, setShowRelatedSelector] = useState(false);
  
  // Staff listesi
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [relatedSearchTerm, setRelatedSearchTerm] = useState('');
  
  // Staff listesini yükle
  useEffect(() => {
    staffApi.getAll()
      .then(data => setStaffList(data))
      .catch(err => {
        console.error('Staff yüklenemedi:', err);
        // Fallback olarak allUsers kullan
        setStaffList(allUsers);
      });
  }, []);

  // Kullanıcı seçimini toggle et
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };
  
  // İlgili kişi seç
  const selectRelatedPerson = (person: any) => {
    setRelatedTo(person.id);
    setRelatedToName(person.name);
    setShowRelatedSelector(false);
    setRelatedSearchTerm('');
  };
  
  // Filtrelenmiş listeler
  const filteredStaffForRelated = staffList.filter(s => 
    s.name.toLowerCase().includes(relatedSearchTerm.toLowerCase()) ||
    s.title?.toLowerCase().includes(relatedSearchTerm.toLowerCase())
  );
  
  const filteredStaffForVisible = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addAgenda({
      title,
      description,
      status: 'bekliyor',
      priority: 'orta',
      createdBy: user.id,
      assignedTo: [user.id],
      visibleTo: selectedUsers.length > 0 ? selectedUsers : [user.id],
      relatedTo: relatedTo || undefined,
      relatedToName: relatedToName || undefined,
    });

    navigate('/agenda');
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <h1 className="text-xl font-bold text-gray-800">Yeni Gündem</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gündem Başlığı</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            rows={4}
          />
        </div>

        {/* Kim ile ilgili */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-4 h-4 inline mr-1" />
            Kim ile ilgili?
          </label>
          <button
            type="button"
            onClick={() => setShowRelatedSelector(true)}
            className="w-full px-4 py-2 border rounded-lg text-left hover:bg-gray-50 flex items-center justify-between"
          >
            {relatedToName ? (
              <span className="text-orange-600 font-medium">{relatedToName}</span>
            ) : (
              <span className="text-gray-500">Kişi seçmek için tıklayın...</span>
            )}
            <User className="w-4 h-4 text-gray-400" />
          </button>
          {relatedToName && (
            <button
              type="button"
              onClick={() => { setRelatedTo(''); setRelatedToName(''); }}
              className="text-xs text-red-500 mt-1 hover:underline"
            >
              Kişiyi Kaldır
            </button>
          )}
        </div>

        {/* Kimler görebilsin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="w-4 h-4 inline mr-1" />
            Kimler Görebilsin?
          </label>
          <button
            type="button"
            onClick={() => setShowUserSelector(true)}
            className="w-full px-4 py-2 border rounded-lg text-left hover:bg-gray-50 flex items-center justify-between"
          >
            {selectedUsers.length > 0 ? (
              <span className="text-green-600 font-medium">
                {selectedUsers.length} kişi seçildi
              </span>
            ) : (
              <span className="text-gray-500">Kişi seçmek için tıklayın...</span>
            )}
            <Users className="w-4 h-4 text-gray-400" />
          </button>
          
          {/* Seçili kişileri göster */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUsers.map(userId => {
                const person = staffList.find(s => s.id === userId);
                return person ? (
                  <span 
                    key={userId} 
                    className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {person.name}
                    <button 
                      type="button"
                      onClick={() => toggleUserSelection(userId)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Gündem Oluştur
        </button>
      </form>

      {/* Kim ile ilgili Seçici Modal */}
      {showRelatedSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Kim ile ilgili?</h3>
              <button onClick={() => { setShowRelatedSelector(false); setRelatedSearchTerm(''); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Arama */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kişi ara..."
                  value={relatedSearchTerm}
                  onChange={(e) => setRelatedSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredStaffForRelated.length > 0 ? (
                filteredStaffForRelated.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => selectRelatedPerson(person)}
                    className="w-full p-3 flex items-center justify-between hover:bg-orange-50 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{person.name}</p>
                      {person.title && <p className="text-xs text-gray-500">{person.title}</p>}
                    </div>
                    {relatedTo === person.id && (
                      <Check className="w-5 h-5 text-orange-600" />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">Kişi bulunamadı</p>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                type="button"
                onClick={() => { setShowRelatedSelector(false); setRelatedSearchTerm(''); }}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kimler Görebilsin Seçici Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Kimler Görebilsin?</h3>
              <button onClick={() => { setShowUserSelector(false); setSearchTerm(''); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Arama */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kişi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredStaffForVisible.length > 0 ? (
                filteredStaffForVisible.map(person => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => toggleUserSelection(person.id)}
                    className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 ${
                      selectedUsers.includes(person.id) ? 'bg-green-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{person.name}</p>
                      {person.title && <p className="text-xs text-gray-500">{person.title}</p>}
                    </div>
                    {selectedUsers.includes(person.id) && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">Kişi bulunamadı</p>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                type="button"
                onClick={() => { setShowUserSelector(false); setSearchTerm(''); }}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-medium"
              >
                Tamam ({selectedUsers.length} kişi seçildi)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
