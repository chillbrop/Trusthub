import { useEffect, useState } from 'react';
import { Plus, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ScannerModal } from './ScannerModal';

interface Scanner {
  id: string;
  name: string;
  type: string;
  vendor: string;
  api_url: string;
  status: string;
  last_connected_at: string | null;
  created_at: string;
}

export function ScannersList() {
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScanner, setEditingScanner] = useState<Scanner | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadScanners();
  }, [user]);

  const loadScanners = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scanners')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScanners(data || []);
    } catch (error) {
      console.error('Error loading scanners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (scanner: Scanner) => {
    setEditingScanner(scanner);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingScanner(null);
    loadScanners();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SAST':
        return 'bg-blue-100 text-blue-800';
      case 'DAST':
        return 'bg-green-100 text-green-800';
      case 'SCA':
        return 'bg-yellow-100 text-yellow-800';
      case 'Network':
        return 'bg-red-100 text-red-800';
      case 'Container':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Scanners</h2>
          <p className="text-gray-600 mt-1">Manage your security scanner integrations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Scanner</span>
        </button>
      </div>

      {scanners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No scanners configured</h3>
          <p className="text-gray-600 mb-6">Add your first security scanner to start scanning</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Configure Scanner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scanners.map((scanner) => (
            <div
              key={scanner.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => handleEdit(scanner)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{scanner.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getTypeColor(scanner.type)}`}>
                      {scanner.type}
                    </span>
                  </div>
                </div>
                {getStatusIcon(scanner.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium text-gray-900">{scanner.vendor}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    scanner.status === 'active' ? 'text-green-600' :
                    scanner.status === 'error' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {scanner.status}
                  </span>
                </div>
              </div>

              {scanner.last_connected_at && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Last connected: {new Date(scanner.last_connected_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ScannerModal
          scanner={editingScanner}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
