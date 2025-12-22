import { useEffect, useState } from 'react';
import { AlertTriangle, FileCode, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: string;
  cve_id: string;
  cwe_id: string;
  file_path: string;
  line_number: number | null;
  status: string;
  created_at: string;
  project_id: string;
}

export function VulnerabilitiesList() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    loadVulnerabilities();
  }, [user, filter]);

  const loadVulnerabilities = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('vulnerabilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        if (filter === 'open') {
          query = query.eq('status', 'open');
        } else {
          query = query.eq('severity', filter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setVulnerabilities(data || []);
    } catch (error) {
      console.error('Error loading vulnerabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'false_positive':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
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
          <h2 className="text-2xl font-bold text-gray-900">Vulnerabilities</h2>
          <p className="text-gray-600 mt-1">Security findings across all projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Vulnerabilities</option>
            <option value="open">Open Only</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {vulnerabilities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No vulnerabilities found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Great job! No security issues detected yet.'
              : `No ${filter} vulnerabilities found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {vulnerabilities.map((vuln) => (
            <div
              key={vuln.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(vuln.status)}
                    <h3 className="font-semibold text-gray-900 text-lg">{vuln.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{vuln.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {vuln.cve_id && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CVE ID</p>
                    <p className="text-sm font-medium text-gray-900">{vuln.cve_id}</p>
                  </div>
                )}
                {vuln.cwe_id && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">CWE ID</p>
                    <p className="text-sm font-medium text-gray-900">{vuln.cwe_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{vuln.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Detected</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(vuln.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {vuln.file_path && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <FileCode className="w-4 h-4" />
                  <span className="font-mono">{vuln.file_path}</span>
                  {vuln.line_number && <span>:{vuln.line_number}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
