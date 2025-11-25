import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, ExternalLink, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Report {
  id: string;
  name: string;
  start_date: string;
  status: string;
  score?: number;
  audit_type?: string;
  calculatedScore?: number;
}

// Calculate score using pessimistic aggregation logic
const calculatePessimisticScore = (
  pages: { criteria_results: { code: string; status: string }[] }[],
  auditType: string
): number => {
  const totalCriteria = auditType === 'native-app' ? 41 : 55;
  
  // Track criteria status across all pages (pessimistic aggregation)
  const perCodeStatus = new Map<string, { hasCompliant: boolean; hasNonCompliant: boolean }>();
  
  for (const page of pages) {
    for (const criterion of page.criteria_results || []) {
      const entry = perCodeStatus.get(criterion.code) || { hasCompliant: false, hasNonCompliant: false };
      if (criterion.status === 'compliant') entry.hasCompliant = true;
      if (criterion.status === 'non-compliant') entry.hasNonCompliant = true;
      perCodeStatus.set(criterion.code, entry);
    }
  }
  
  // Count compliant and not-applicable criteria
  const compliantCodes = new Set<string>();
  const notApplicableCodes = new Set<string>();
  
  perCodeStatus.forEach((status, code) => {
    // Pessimistic aggregation: if non-compliant on at least one page, it's non-compliant overall
    if (status.hasNonCompliant) {
      // Not compliant overall
    } else if (status.hasCompliant) {
      compliantCodes.add(code);
    } else {
      // Never compliant, never non-compliant = not-applicable
      notApplicableCodes.add(code);
    }
  });
  
  // Calculate score: unique compliant / (totalCriteria - unique not-applicable) * 100
  const denominator = totalCriteria - notApplicableCodes.size;
  return denominator > 0 ? Math.round((compliantCodes.size / denominator) * 100) : 0;
};

const Site = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, lastScore: 0 });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reportId: string | null }>({
    open: false,
    reportId: null,
  });

  useEffect(() => {
    fetchSite();
    fetchReports();
  }, [siteId]);

  const fetchSite = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*, entities(*)')
        .eq('id', siteId)
        .single();

      if (error) throw error;
      setSite(data);
    } catch (error: any) {
      toast.error('Failed to fetch site');
    }
  };

  const fetchReports = async () => {
    try {
      // Fetch reports with their pages and criteria results for score calculation
      const { data, error } = await supabase
        .from('reports')
        .select('*, audit_pages(id, criteria_results(code, status))')
        .eq('site_id', siteId)
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Calculate scores for each report using pessimistic aggregation
      const reportsWithScores = (data || []).map(report => {
        const calculatedScore = calculatePessimisticScore(
          report.audit_pages || [],
          report.audit_type || 'website'
        );
        return {
          ...report,
          calculatedScore,
        };
      });

      const completedReports = reportsWithScores.filter(r => r.status === 'completed');
      // Get the calculated score from the most recent completed report
      const lastScore = completedReports.length > 0 ? completedReports[0].calculatedScore : 0;

      setReports(reportsWithScores);
      setStats({
        total: reportsWithScores.length,
        completed: completedReports.length,
        lastScore,
      });
    } catch (error: any) {
      toast.error('Failed to fetch reports');
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteDialog.reportId) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', deleteDialog.reportId);

      if (error) throw error;

      toast.success('Report deleted successfully');
      setDeleteDialog({ open: false, reportId: null });
      fetchReports();
    } catch (error: any) {
      toast.error('Failed to delete report');
    }
  };

  const getScoreProgression = () => {
    const completed = reports.filter((r) => r.status === 'completed' && r.calculatedScore !== undefined);
    if (completed.length < 2) return null;

    const latest = completed[0].calculatedScore || 0;
    const previous = completed[1].calculatedScore || 0;
    const diff = latest - previous;

    return { diff, isPositive: diff >= 0 };
  };

  const getChartData = () => {
    return reports
      .filter((r) => r.status === 'completed' && r.calculatedScore !== undefined)
      .reverse()
      .map((r) => ({
        date: new Date(r.start_date).toLocaleDateString(),
        score: r.calculatedScore || 0,
      }));
  };

  const handleCreateReport = () => {
    navigate(`/site/${siteId}/new-report`);
  };

  const progression = getScoreProgression();
  const chartData = getChartData();

  if (!site) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/entity/${site.entities.id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Entity
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{site.name}</h1>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          {site.url}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold">{Math.round(stats.lastScore)}%</p>
              {progression && (
                <div className={`flex items-center text-sm ${progression.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {progression.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>{Math.abs(Math.round(progression.diff))}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Score Evolution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Reports</h2>
        <Button onClick={handleCreateReport}>
          <Plus className="mr-2 h-4 w-4" />
          New Accessibility Report
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (report.status === 'completed') {
                navigate(`/results/${report.id}`);
              } else {
                navigate(`/audit/${report.id}`);
              }
            }}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle>{report.name}</CardTitle>
                  <CardDescription>
                    {new Date(report.start_date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className={`text-sm px-2 py-1 rounded ${
                      report.status === 'completed' ? 'bg-success/10 text-success' :
                      report.status === 'in-progress' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {report.status}
                    </span>
                    {report.calculatedScore !== undefined && report.status === 'completed' && (
                      <p className="text-2xl font-bold mt-2">{report.calculatedScore}%</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, reportId: report.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {reports.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No reports yet</p>
              <Button onClick={handleCreateReport}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, reportId: null })}
        onConfirm={handleDeleteReport}
        title="Delete Report?"
        description="This will permanently delete this report and all its audit data. This action cannot be undone."
      />
    </div>
  );
};

export default Site;
