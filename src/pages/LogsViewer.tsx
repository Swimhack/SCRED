import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Search, Calendar, Filter, ExternalLink, Download } from 'lucide-react';
import SEO from '@/components/SEO';

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  metadata: any; // Can be JSON object, string, null, etc
  user_id?: string | null;
  session_id?: string | null;
  component?: string | null;
  route?: string | null;
  error_stack?: string | null;
  created_at?: string;
  ip_address?: any;
  request_id?: string | null;
  user_agent?: string | null;
}

interface LogsResponse {
  success: boolean;
  data: LogEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  filters: Record<string, any>;
  timestamp: string;
}

const LogsViewer = () => {
  const { user, userRole, session } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    level: '',
    component: '',
    search: '',
    start_date: '',
    end_date: '',
    limit: 50,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false
  });
  const [apiUrl, setApiUrl] = useState('');

  // Generate the API URL that can be used by external agents
  useEffect(() => {
    if (user && session) {
      const baseUrl = 'https://tvqyozyjqcswojsbduzw.supabase.co/functions/v1/get-logs';
      const params = new URLSearchParams();
      
      if (filters.level) params.append('level', filters.level);
      if (filters.component) params.append('component', filters.component);
      if (filters.search) params.append('search', filters.search);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      params.append('limit', filters.limit.toString());
      params.append('offset', filters.offset.toString());

      const url = `${baseUrl}?${params.toString()}`;
      setApiUrl(url);
    }
  }, [user, session, filters]);

  const fetchLogs = async () => {
    if (!user || userRole !== 'super_admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can access application logs.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Apply filters to the query
      let query = supabase
        .from('application_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.level) {
        query = query.eq('level', filters.level);
      }
      if (filters.component) {
        query = query.eq('component', filters.component);
      }
      if (filters.search) {
        query = query.or(`message.ilike.%${filters.search}%,component.ilike.%${filters.search}%`);
      }
      if (filters.start_date) {
        query = query.gte('timestamp', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('timestamp', filters.end_date);
      }

      // Apply pagination
      query = query.range(filters.offset, filters.offset + filters.limit - 1);

      const { data: directLogs, error: directError } = await query;
        
      if (!directError && directLogs) {
        // Transform the data to match our interface expectations
        const transformedLogs = directLogs.map((log: any) => ({
          ...log,
          metadata: typeof log.metadata === 'object' && log.metadata !== null 
            ? log.metadata 
            : {}
        }));
        setLogs(transformedLogs);
        // Get total count for pagination
        const { count } = await supabase
          .from('application_logs')
          .select('*', { count: 'exact', head: true });

        setPagination({
          total: count || 0,
          limit: filters.limit,
          offset: filters.offset,
          has_more: (count || 0) > filters.offset + filters.limit
        });
        return;
      }
      
      throw new Error('Failed to fetch logs from database');
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch logs',
        variant: 'destructive'
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debug': return 'bg-gray-100 text-gray-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'fatal': return 'bg-red-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyApiUrl = () => {
    navigator.clipboard.writeText(apiUrl);
    toast({
      title: 'Copied!',
      description: 'API URL copied to clipboard'
    });
  };

  const exportLogsAsJSON = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `logs-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: 'Export Complete',
      description: 'Logs exported as JSON file'
    });
  };

  const exportLogsAsCSV = () => {
    if (logs.length === 0) {
      toast({
        title: 'No Data',
        description: 'No logs to export',
        variant: 'destructive'
      });
      return;
    }

    const csvHeaders = ['timestamp', 'level', 'message', 'component', 'route', 'user_id', 'session_id'];
    const csvData = logs.map(log => [
      log.timestamp,
      log.level,
      `"${log.message.replace(/"/g, '""')}"`, // Escape quotes
      log.component || '',
      log.route || '',
      log.user_id || '',
      log.session_id || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `logs-export-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: 'Export Complete',
      description: 'Logs exported as CSV file'
    });
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.level, filters.component, filters.limit, filters.offset]);

  if (userRole !== 'super_admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only administrators can access application logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <SEO 
        title="System Logs - StreetCredRX Admin"
        description="Monitor and analyze application events and errors"
        canonicalPath="/logs"
      />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Application Logs</h1>
          <p className="text-muted-foreground">
            Monitor and analyze application events and errors
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Refresh
          </Button>
          <Button onClick={exportLogsAsJSON} variant="outline" disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={exportLogsAsCSV} variant="outline" disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* API URL Card for External Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            API Access for External Agents
          </CardTitle>
          <CardDescription>
            Use this URL to access logs programmatically. Requires Bearer token authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              value={apiUrl} 
              readOnly 
              className="flex-1 font-mono text-sm"
              placeholder="Configure filters to generate API URL"
            />
            <Button onClick={copyApiUrl} variant="outline">
              Copy URL
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <p><strong>Authentication:</strong> Add header: <code>Authorization: Bearer YOUR_JWT_TOKEN</code></p>
            <p><strong>Method:</strong> GET</p>
            <p><strong>Access:</strong> Admin role required</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Log Level</label>
              <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value, offset: 0})}>
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="fatal">Fatal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Component</label>
              <Input 
                value={filters.component} 
                onChange={(e) => setFilters({...filters, component: e.target.value, offset: 0})}
                placeholder="Component name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Search</label>
              <Input 
                value={filters.search} 
                onChange={(e) => setFilters({...filters, search: e.target.value, offset: 0})}
                placeholder="Search in messages"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Limit</label>
              <Select value={filters.limit.toString()} onValueChange={(value) => setFilters({...filters, limit: parseInt(value), offset: 0})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                type="datetime-local"
                value={filters.start_date} 
                onChange={(e) => setFilters({...filters, start_date: e.target.value, offset: 0})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input 
                type="datetime-local"
                value={filters.end_date} 
                onChange={(e) => setFilters({...filters, end_date: e.target.value, offset: 0})}
              />
            </div>
          </div>

          <Button onClick={fetchLogs} className="w-full" disabled={loading}>
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs ({pagination.total} total)
          </CardTitle>
          <CardDescription>
            Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No logs found matching your criteria
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Badge>
                      {log.component && (
                        <Badge variant="outline">{log.component}</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="font-medium">{log.message}</div>
                  
                  {log.route && (
                    <div className="text-sm text-muted-foreground">
                      Route: {log.route}
                    </div>
                  )}
                  
                  {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Metadata
                      </summary>
                      <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  {log.error_stack && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-red-600 hover:text-red-800">
                        Error Stack
                      </summary>
                      <pre className="mt-2 bg-red-50 p-2 rounded text-xs overflow-x-auto text-red-800">
                        {log.error_stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-between items-center mt-6">
              <Button 
                variant="outline" 
                disabled={pagination.offset === 0}
                onClick={() => setFilters({...filters, offset: Math.max(0, pagination.offset - pagination.limit)})}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {Math.floor(pagination.offset / pagination.limit) + 1} of {Math.ceil(pagination.total / pagination.limit)}
              </span>
              <Button 
                variant="outline" 
                disabled={!pagination.has_more}
                onClick={() => setFilters({...filters, offset: pagination.offset + pagination.limit})}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsViewer;