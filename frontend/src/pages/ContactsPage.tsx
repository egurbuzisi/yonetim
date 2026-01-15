import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, User, Phone, MapPin, Save } from 'lucide-react';
import { contactsApi } from '../services/api';
import { YILDIRIM_MAHALLELERI } from '../constants/mahalleler';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  createdAt: string;
}

export default function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', address: '', neighborhood: '' });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await contactsApi.getAll();
      setContacts(data);
    } catch (error) {
      console.error('Kişiler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newContact.name.trim()) {
      alert('İsim gerekli!');
      return;
    }
    
    try {
      const created = await contactsApi.create(newContact);
      setContacts([created, ...contacts]);
      setNewContact({ name: '', phone: '', address: '', neighborhood: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Kişi eklenirken hata:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingContact) return;
    
    try {
      await contactsApi.update(editingContact.id, editingContact);
      setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
      setEditingContact(null);
    } catch (error) {
      console.error('Kişi güncellenirken hata:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kişiyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await contactsApi.delete(id);
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      console.error('Kişi silinirken hata:', error);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.neighborhood && c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Kişiler</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Kişi
        </button>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="İsim, telefon veya mahalle ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">{filteredContacts.length} kişi bulundu</p>

      {/* Kişi Listesi */}
      <div className="space-y-3">
        {filteredContacts.map(contact => {
          const isEditing = editingContact?.id === contact.id;

          if (isEditing) {
            return (
              <div key={contact.id} className="bg-white rounded-xl p-4 shadow-sm border-2 border-orange-400">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      value={editingContact.name}
                      onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Telefon</label>
                    <input
                      type="tel"
                      value={editingContact.phone || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Mahalle</label>
                    <select
                      value={editingContact.neighborhood || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, neighborhood: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="">Seçin...</option>
                      {YILDIRIM_MAHALLELERI.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Adres</label>
                    <input
                      type="text"
                      value={editingContact.address || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => setEditingContact(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={contact.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    {contact.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </p>
                    )}
                    {contact.neighborhood && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {contact.neighborhood}
                        {contact.address && `, ${contact.address}`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingContact(contact)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredContacts.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Kişi bulunamadı</p>
          </div>
        )}
      </div>

      {/* Yeni Kişi Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Yeni Kişi</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="0532 123 45 67"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mahalle</label>
                <select
                  value={newContact.neighborhood}
                  onChange={(e) => setNewContact({ ...newContact, neighborhood: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Seçin...</option>
                  {YILDIRIM_MAHALLELERI.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                <input
                  type="text"
                  value={newContact.address}
                  onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                  placeholder="Sokak, Bina No"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
