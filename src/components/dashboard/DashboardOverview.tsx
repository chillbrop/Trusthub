import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  totalProjects: number;
  totalScans: number;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  activeScans: number;
  resolvedVulnerabilities: number;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    totalScans: 0,
    totalVulnerabilities: 0,
    criticalVulnerabilities: 0,
    activeScans: 0,
    resolvedVulnerabilities: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [projectsRes, scansRes, vulnsRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('owner_id', user.id),
        supabase.from('scans').select('id, status', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('vulnerabilities').select('id, severity, status', { count: 'exact' }),
      ]);

      const activeScans = await supabase
        .from('scans')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'running']);

      const criticalVulns = vulnsRes.data?.filter((v) => v.severity === 'critical').length || 0;
      const resolvedVulns = vulnsRes.data?.filter((v) => v.status === 'resolved').length || 0;

      setStats({
        totalProjects: projectsRes.count || 0,
        totalScans: scansRes.count || 0,
        totalVulnerabilities: vulnsRes.count || 0,
        criticalVulnerabilities: criticalVulns,
        activeScans: activeScans.count || 0,
        resolvedVulnerabilities: resolvedVulns,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: Shield,
      color: 'blue',
      trend: null,
    },
    {
      label: 'Active Scans',
      value: stats.activeScans,
      icon: Activity,
      color: 'green',
      trend: null,
    },
    {
      label: 'Total Vulnerabilities',
      value: stats.totalVulnerabilities,
      icon: AlertTriangle,
      color: 'orange',
      trend: stats.criticalVulnerabilities > 0 ? 'up' : null,
    },
    {
      label: 'Critical Issues',
      value: stats.criticalVulnerabilities,
      icon: AlertTriangle,
      color: 'red',
      trend: stats.criticalVulnerabilities > 5 ? 'up' : 'down',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of your security posture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend === 'up' ? TrendingUp : TrendingDown;

          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`p-3 bg-${card.color}-50 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
              {card.trend && (
                <div className="mt-4 flex items-center">
                  <TrendIcon className={`w-4 h-4 ${card.trend === 'up' ? 'text-red-500' : 'text-green-500'}`} />
                  <span className={`text-sm ml-1 ${card.trend === 'up' ? 'text-red-600' : 'text-green-600'}`}>
                    {card.trend === 'up' ? 'Needs attention' : 'Improving'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.totalScans === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity. Start by creating a project.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Scans Completed</p>
                    <p className="text-xs text-gray-500">{stats.totalScans} total scans</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Vulnerabilities Found</p>
                    <p className="text-xs text-gray-500">{stats.totalVulnerabilities} issues detected</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-left transition-colors">
              <p className="font-medium">Create New Project</p>
              <p className="text-xs text-blue-600 mt-1">Set up a new security project</p>
            </button>
            <button className="w-full px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-left transition-colors">
              <p className="font-medium">Run Security Scan</p>
              <p className="text-xs text-green-600 mt-1">Start scanning for vulnerabilities</p>
            </button>
            <button className="w-full px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-left transition-colors">
              <p className="font-medium">Configure Scanner</p>
              <p className="text-xs text-orange-600 mt-1">Add or update scanner integrations</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
