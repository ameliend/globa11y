import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AccessibilityStatementModal, AccessibilityStatementData } from '@/components/AccessibilityStatementModal';

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
  const [showStatementModal, setShowStatementModal] = useState(false);

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

  const generateAccessibilityStatement = (data: AccessibilityStatementData) => {
    // Calculate detailed statistics by level
    const allCriteria = pages.flatMap(p => p.criteria_results);
    
    const compliantA = allCriteria.filter((c: any) => c.status === 'compliant' && c.level === 'A').length;
    const compliantAA = allCriteria.filter((c: any) => c.status === 'compliant' && c.level === 'AA').length;
    const totalCompliant = stats.compliant;
    
    const nonCompliantA = allCriteria.filter((c: any) => c.status === 'non-compliant' && c.level === 'A').length;
    const nonCompliantAA = allCriteria.filter((c: any) => c.status === 'non-compliant' && c.level === 'AA').length;
    const totalNonCompliant = stats.nonCompliant;
    
    const notApplicableA = allCriteria.filter((c: any) => c.status === 'not-applicable' && c.level === 'A').length;
    const notApplicableAA = allCriteria.filter((c: any) => c.status === 'not-applicable' && c.level === 'AA').length;
    const totalNotApplicable = stats.notApplicable;
    
    const totalCriteria = allCriteria.filter((c: any) => c.status !== 'not-applicable').length;
    const percentCompliantA = totalCriteria > 0 ? Math.round((compliantA / totalCriteria) * 100) : 0;
    const percentCompliantAA = totalCriteria > 0 ? Math.round((compliantAA / totalCriteria) * 100) : 0;
    const percentCompliant = Math.round(report.score || 0);
    
    // Generate page list
    const pageList = pages.map(p => `<li>${p.name}</li>`).join('\n      ');
    
    // Generate non-compliant criteria list
    const nonCompliantList = nonCompliances.map(nc => 
      `<li>${nc.code} ${nc.title}</li>`
    ).join('\n        ');
    
    // Generate page statistics table rows
    const pageRows = pages.map(page => {
      const pageCriteria = page.criteria_results;
      const pageCompliantA = pageCriteria.filter((c: any) => c.status === 'compliant' && c.level === 'A').length;
      const pageCompliantAA = pageCriteria.filter((c: any) => c.status === 'compliant' && c.level === 'AA').length;
      const pageNonCompliantA = pageCriteria.filter((c: any) => c.status === 'non-compliant' && c.level === 'A').length;
      const pageNonCompliantAA = pageCriteria.filter((c: any) => c.status === 'non-compliant' && c.level === 'AA').length;
      const pageNotApplicableA = pageCriteria.filter((c: any) => c.status === 'not-applicable' && c.level === 'A').length;
      const pageNotApplicableAA = pageCriteria.filter((c: any) => c.status === 'not-applicable' && c.level === 'AA').length;
      const pageTotal = pageCriteria.filter((c: any) => c.status !== 'not-applicable').length;
      const pageCompliantCount = pageCriteria.filter((c: any) => c.status === 'compliant').length;
      const pagePercent = pageTotal > 0 ? Math.round((pageCompliantCount / pageTotal) * 100) : 0;
      
      return `      <tr>
        <th scope="row">${page.name}</th>
        <td>${pageCompliantA}</td>
        <td>${pageCompliantAA}</td>
        <td>${pageNonCompliantA}</td>
        <td>${pageNonCompliantAA}</td>
        <td>${pageNotApplicableA}</td>
        <td>${pageNotApplicableAA}</td>
        <td>${pagePercent}%</td>
      </tr>`;
    }).join('\n');
    
    const today = new Date().toISOString().split('T')[0];
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Statement - ${report.sites.url}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        ul { margin: 10px 0; padding-left: 30px; }
        .score { font-size: 2em; font-weight: bold; color: #2563eb; }
    </style>
</head>
<body>
    <h1>Accessibility Statement</h1>
    
    <h2>Scope</h2>
    <p><strong>Tested URL:</strong> ${report.sites.url}</p>
    <p><strong>Auditor:</strong> ${data.auditorName}</p>
    <p><strong>Audit Date:</strong> ${today}</p>
    
    <h2>Summary</h2>
    <p class="score">Score: ${percentCompliant}%</p>
    
    <h3>Pages Audited</h3>
    <ul>
      ${pageList}
    </ul>
    
    <h3>Testing Environment</h3>
    <p><strong>Browsers & Devices:</strong> ${data.browsersDevices || 'Not specified'}</p>
    <p><strong>Technologies/CMS/Libraries:</strong> ${data.technologies || 'Not specified'}</p>
    <p><strong>Assistive Technologies:</strong> ${data.assistiveTech || 'Not specified'}</p>
    <p><strong>Automated Tests:</strong> ${data.automatedTests || 'Not specified'}</p>
    
    <h2>Non-Compliant Criteria</h2>
    <ul>
        ${nonCompliantList}
    </ul>
    
    <h2>Overall Statistics</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">Status</th>
          <th scope="col">Level A</th>
          <th scope="col">Level AA</th>
          <th scope="col">Total</th>
          <th scope="col">Percentage</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Compliant</th>
          <td>${compliantA}</td>
          <td>${compliantAA}</td>
          <td>${totalCompliant}</td>
          <td>${percentCompliant}%</td>
        </tr>
        <tr>
          <th scope="row">Non-Compliant</th>
          <td>${nonCompliantA}</td>
          <td>${nonCompliantAA}</td>
          <td>${totalNonCompliant}</td>
          <td>-</td>
        </tr>
        <tr>
          <th scope="row">Not Applicable</th>
          <td>${notApplicableA}</td>
          <td>${notApplicableAA}</td>
          <td>${totalNotApplicable}</td>
          <td>-</td>
        </tr>
      </tbody>
    </table>
    
    <h2>Statistics by Page</h2>
    <table>
      <thead>
        <tr>
          <th scope="col">Page</th>
          <th scope="col">Compliant A</th>
          <th scope="col">Compliant AA</th>
          <th scope="col">Non-Compliant A</th>
          <th scope="col">Non-Compliant AA</th>
          <th scope="col">Not Applicable A</th>
          <th scope="col">Not Applicable AA</th>
          <th scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
${pageRows}
      </tbody>
    </table>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    toast.success('Accessibility statement generated');
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
          <Button variant="outline" onClick={() => setShowStatementModal(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Accessibility Statement
          </Button>
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

      <AccessibilityStatementModal
        open={showStatementModal}
        onOpenChange={setShowStatementModal}
        onGenerate={generateAccessibilityStatement}
      />
    </div>
  );
};

export default ResultsNew;
