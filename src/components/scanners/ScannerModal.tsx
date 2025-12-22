import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Scanner {
  id: string;
  name: string;
  type: string;
  vendor: string;
  api_url: string;
  api_key: string;
  status: string;
}

interface ScannerModalProps {
  scanner: Scanner | null;
  onClose: () => void;
}

const SCANNER_TYPES = ['SAST', 'DAST', 'SCA', 'Network', 'Container'];

const SCANNER_VENDORS = {
  SAST: ['Checkmarx', 'Fortify', 'SonarQube', 'Semgrep', 'CodeQL'],
  DAST: ['Acunetix', 'Burp Enterprise', 'OWASP ZAP', 'Netsparker'],
  SCA: ['Dependency Track', 'Snyk', 'Nexus IQ', 'WhiteSource'],
  Network: ['Nessus', 'OpenVAS', 'Qualys', 'Rapid7'],
  Container: ['Trivy', 'Clair', 'Anchore', 'Aqua Security'],
};

export function ScannerModal({ scanner, onClose }: ScannerModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('SAST');
  const [vendor, setVendor] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('inactive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (scanner) {
      setName(scanner.name);
      setType(scanner.type);
      setVendor(scanner.vendor);
      setApiUrl(scanner.api_url);
      setApiKey(scanner.api_key);
      setStatus(scanner.status);
    }
  }, [scanner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      if (scanner) {
        const { error } = await supabase
          .from('scanners')
          .update({
            name,
            type,
            vendor,
            api_url: apiUrl,
            api_key: apiKey,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', scanner.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scanners')
          .insert({
            name,
            type,
            vendor,
            api_url: apiUrl,
            api_key: apiKey,
            status,
            owner_id: user.id,
          });

        if (error) throw error;
      }

      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableVendors = SCANNER_VENDORS[type as keyof typeof SCANNER_VENDORS] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-xl font-bold text-gray-900">
            {scanner ? 'Edit Scanner' : 'Add New Scanner'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scanner Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Production SAST Scanner"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scanner Type *
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setVendor('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {SCANNER_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor *
              </label>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select vendor</option>
                {availableVendors.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API URL
            </label>
            <input
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://scanner-api.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter API key"
            />
            <p className="mt-1 text-xs text-gray-500">Keep your API keys secure</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : scanner ? 'Update Scanner' : 'Add Scanner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
