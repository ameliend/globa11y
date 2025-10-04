import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NonCompliance {
  code: string;
  title: string;
  level: string;
  pages: string[];
  observations: string[];
}

const ResultsNew = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [nonCompliances, setNonCompliances] = useState<NonCompliance[]>([]);
  const [stats, setStats] = useState({ compliant: 0, nonCompliant: 0, notApplicable: 0 });

  useEffect(() => {
    fetchResults();
  }, [reportId]);

  const fetchResults = async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*, sites(*, entities(*))')
        .eq('id', reportId)
        .single();

      if (reportError) throw reportError;
      setReport(reportData);

      const { data: pagesData, error: pagesError } = await supabase
        .from('audit_pages')
        .select('*, criteria_results(*)')
        .eq('report_id', reportId);

      if (pagesError) throw pagesError;
      setPages(pagesData || []);

      // Calculate stats
      const allCriteria = pagesData?.flatMap((p: any) => p.criteria_results) || [];
      const compliant = allCriteria.filter((c: any) => c.status === 'compliant').length;
      const nonCompliant = allCriteria.filter((c: any) => c.status === 'non-compliant').length;
      const notApplicable = allCriteria.filter((c: any) => c.status === 'not-applicable').length;
      setStats({ compliant, nonCompliant, notApplicable });

      // Group non-compliances by criteria (count same criterion on multiple pages as one)
      const nonComplianceMap: Record<string, NonCompliance> = {};
      pagesData?.forEach((page: any) => {
        page.criteria_results
          .filter((c: any) => c.status === 'non-compliant')
          .forEach((c: any) => {
            if (!nonComplianceMap[c.code]) {
              nonComplianceMap[c.code] = {
                code: c.code,
                title: c.title,
                level: c.level,
                pages: [page.name],
                observations: c.observation ? [c.observation] : [],
              };
            } else {
              nonComplianceMap[c.code].pages.push(page.name);
              if (c.observation) {
                nonComplianceMap[c.code].observations.push(c.observation);
              }
            }
          });
      });
      setNonCompliances(Object.values(nonComplianceMap));
    } catch (error: any) {
      toast.error('Failed to fetch results');
    }
  };

  const handleEdit = () => {
    navigate(`/audit/${reportId}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report deleted successfully');
      navigate(`/site/${report.sites.id}`);
    } catch (error: any) {
      toast.error('Failed to delete report');
    }
  };

  if (!report) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/site/${report.sites.id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Site
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{report.name}</h1>
          <p className="text-muted-foreground">{report.sites.url}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-foreground">
              {Math.round(report.score || 0)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-success">{stats.compliant}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Non-Compliant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-destructive">{stats.nonCompliant}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Not Applicable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-muted-foreground">{stats.notApplicable}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Summary by Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.map((page) => {
              const pageCompliant = page.criteria_results.filter((c: any) => c.status === 'compliant').length;
              const pageNonCompliant = page.criteria_results.filter((c: any) => c.status === 'non-compliant').length;
              const pageTotal = page.criteria_results.filter((c: any) => c.status !== 'not-applicable').length;
              const pageScore = pageTotal > 0 ? (pageCompliant / pageTotal) * 100 : 0;

              return (
                <div key={page.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{page.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {pageCompliant} compliant / {pageNonCompliant} non-compliant
                    </p>
                  </div>
                  <p className="text-2xl font-bold">{Math.round(pageScore)}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Non-Compliances ({nonCompliances.length} unique criteria)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nonCompliances.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No non-compliances found - Great work!
            </p>
          ) : (
            <div className="space-y-4">
              {nonCompliances.map((nc) => (
                <div key={nc.code} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">
                        {nc.code} - {nc.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">Level {nc.level}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium">Found on pages:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {nc.pages.map((pageName, idx) => (
                        <li key={idx}>{pageName}</li>
                      ))}
                    </ul>
                  </div>
                  {nc.observations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Observations:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {nc.observations.map((obs, idx) => (
                          <li key={idx}>{obs}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsNew;
