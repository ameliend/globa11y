import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AccessibilityStatementData } from '@/components/AccessibilityStatementModal';

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

      // Calculate stats - count unique criteria codes across all pages
      const uniqueCriteriaCodes = new Set<string>();
      const compliantCodes = new Set<string>();
      const nonCompliantCodes = new Set<string>();
      const notApplicableCodes = new Set<string>();
      
      pagesData?.forEach((page: any) => {
        page.criteria_results.forEach((c: any) => {
          uniqueCriteriaCodes.add(c.code);
          if (c.status === 'compliant') compliantCodes.add(c.code);
          if (c.status === 'non-compliant') nonCompliantCodes.add(c.code);
          if (c.status === 'not-applicable') notApplicableCodes.add(c.code);
        });
      });
      
      const compliant = compliantCodes.size;
      const nonCompliant = nonCompliantCodes.size;
      const notApplicable = notApplicableCodes.size;
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
    // Calculate detailed statistics by level - count unique criteria codes
    const compliantCodesA = new Set<string>();
    const compliantCodesAA = new Set<string>();
    const nonCompliantCodesA = new Set<string>();
    const nonCompliantCodesAA = new Set<string>();
    const notApplicableCodesA = new Set<string>();
    const notApplicableCodesAA = new Set<string>();
    
    pages.forEach(page => {
      page.criteria_results.forEach((c: any) => {
        if (c.status === 'compliant') {
          if (c.level === 'A') compliantCodesA.add(c.code);
          if (c.level === 'AA') compliantCodesAA.add(c.code);
        }
        if (c.status === 'non-compliant') {
          if (c.level === 'A') nonCompliantCodesA.add(c.code);
          if (c.level === 'AA') nonCompliantCodesAA.add(c.code);
        }
        if (c.status === 'not-applicable') {
          if (c.level === 'A') notApplicableCodesA.add(c.code);
          if (c.level === 'AA') notApplicableCodesAA.add(c.code);
        }
      });
    });
    
    const compliantA = compliantCodesA.size;
    const compliantAA = compliantCodesAA.size;
    const totalCompliant = stats.compliant;
    
    const nonCompliantA = nonCompliantCodesA.size;
    const nonCompliantAA = nonCompliantCodesAA.size;
    const totalNonCompliant = stats.nonCompliant;
    
    const notApplicableA = notApplicableCodesA.size;
    const notApplicableAA = notApplicableCodesAA.size;
    const totalNotApplicable = stats.notApplicable;
    
    // Calculate percentages by level (only for applicable criteria)
    const totalApplicableA = compliantA + nonCompliantA;
    const totalApplicableAA = compliantAA + nonCompliantAA;
    
    const percentCompliantA = totalApplicableA > 0 ? Math.round((compliantA / totalApplicableA) * 100) : 0;
    const percentCompliantAA = totalApplicableAA > 0 ? Math.round((compliantAA / totalApplicableAA) * 100) : 0;
    const percentCompliant = Math.round(((stats.compliant + stats.notApplicable) / 55) * 100);
    
    // Generate page list
    const pageList = pages.map(p => `<li>${p.name}</li>`).join('\n');
    
    // Generate non-compliant criteria list
    const nonCompliantList = nonCompliances.map(nc => 
      `<li>${nc.code} ${nc.title}</li>`
    ).join('\n');
    
    // Generate page statistics table rows
    const pageRows = pages.map(page => {
      const pageCriteria = page.criteria_results;
      const pageCompliantA = pageCriteria.filter((c: any) => c.status === 'compliant' && c.level === 'A').length;
      const pageCompliantAA = pageCriteria.filter((c: any) => c.status === 'compliant' && c.level === 'AA').length;
      const pageNonCompliantA = pageCriteria.filter((c: any) => c.status === 'non-compliant' && c.level === 'A').length;
      const pageNonCompliantAA = pageCriteria.filter((c: any) => c.status === 'non-compliant' && c.level === 'AA').length;
      const pageNotApplicableA = pageCriteria.filter((c: any) => c.status === 'not-applicable' && c.level === 'A').length;
      const pageNotApplicableAA = pageCriteria.filter((c: any) => c.status === 'not-applicable' && c.level === 'AA').length;
      const pageCompliantCount = pageCriteria.filter((c: any) => c.status === 'compliant').length;
      const pageNotApplicableCount = pageCriteria.filter((c: any) => c.status === 'not-applicable').length;
      const pagePercent = Math.round(((pageCompliantCount + pageNotApplicableCount) / 55) * 100);
      
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
    
    const htmlContent = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>WCAG Accessibility Audit Template</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.45;color:#111;padding:24px;background:#f7f7f8}
header{background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
h1{margin:0 0 6px;font-size:20px}
.meta{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px}
.card{background:#fff;padding:12px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.05)}
section{margin-top:16px}
a {  text-decoration: underline;  color: #DC324E;}
table{width:100%;border-collapse:collapse}
th,td{padding:8px;border:1px solid #e6e6e9;text-align:left;font-size:14px}
th{background:#fbfbfc}
.small{font-size:13px;color:#555}
.status-conformant{color:green}
.status-fail{color:#d9534f}
.status-partial{color:#f0ad4e}
footer{margin-top:18px;font-size:13px;color:#666}
.note{background:#fff3cd;border-left:4px solid #ffe08a;padding:10px;border-radius:6px}
.actions{display:flex;gap:8px;margin-top:12px}
.muted{color:#777}
.summary-table { margin-bottom: 2rem;}
.page-table {margin-top: 0;}
.download-section{position:fixed;top:20px;right:20px;z-index:1000}
.download-btn{background:#DC324E;color:#fff;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;margin-left:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);transition:background 0.2s}
.download-btn:hover{background:#c42943}
</style>
<script>
function downloadHTML() {
  const content = document.documentElement.outerHTML;
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'accessibility-statement-' + new Date().toISOString().split('T')[0] + '.html';
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF() {
  window.print();
}
</script>
</head>
<body>
<div class="download-section">
  <button class="download-btn" onclick="downloadHTML()">Download HTML</button>
  <button class="download-btn" onclick="downloadPDF()">Download PDF</button>
</div>
<header>
<h1>WCAG Accessibility Audit</h1>
<div class="meta">
<div class="card"><strong>Service :</strong> <span id="project-name">CANAL+</span></div>
<div class="card"><strong>Page / URL:</strong> <span id="page-url">${report.sites.url}</span></div>
<div class="card"><strong>Auditor:</strong> <span id="tester">${data.auditorName}</span></div>
<div class="card"><strong>Date:</strong> <span id="date">${today}</span></div>
<div class="card"><strong>Target WCAG Level:</strong> <span id="level">A / AA </span></div>
</div>
</header>


<section class="card" aria-labelledby="scope-heading">
<h2 id="scope-heading">1. Scope and Context</h2>
<p class="small">Define the technical and functional scope of the tests.</p>
<ul>
<li><strong>Target pages and user flows:</strong> <ul>${pageList}</ul></li>
<li><strong>Browsers & devices tested:</strong> ${data.browsersDevices || 'Not specified'}</li>
<li><strong>Technologies / CMS / libraries:</strong> ${data.technologies || 'Not specified'}</li>
<li><strong>Assistive tech used:</strong> ${data.assistiveTech || 'Not specified'}</li>
<li><strong>Automated tests:</strong> ${data.automatedTests || 'Not specified'}</li>
</ul>
</section>



<section class="card" aria-labelledby="summary-heading">
<h2 id="summary-heading">2. Executive Summary</h2>
<p class="small">Brief overview of the results, overall compliance level, and critical issues.</p>
<p><strong>Estimated compliance level:</strong> ${percentCompliant}% level A-AA</p>
<table class="summary-table">
    <caption>Synthesis by WCAG conformance levels</caption>
    <thead>
      <tr>
        <th scope="col">Level</th>
        <th scope="col">A</th>
        <th scope="col">AA</th>
        <th scope="col">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Number of criteria</th>
        <td>32</td>
        <td>23</td>
        <td>55</td>
      </tr>
      <tr>
        <th scope="row">Compliant</th>
        <td>${compliantA}</td>
        <td>${compliantAA}</td>
        <td>${totalCompliant}</td>
      </tr>
      <tr>
        <th scope="row">Non-compliant</th>
        <td>${nonCompliantA}</td>
        <td>${nonCompliantAA}</td>
        <td>${totalNonCompliant}</td>
      </tr>
      <tr>
        <th scope="row">Not applicable</th>
        <td>${notApplicableA}</td>
        <td>${notApplicableAA}</td>
        <td>${totalNotApplicable}</td>
      </tr>
      <tr>
        <th scope="row">Compliance rate</th>
        <td>${percentCompliantA}%</td>
        <td>${percentCompliantAA}%</td>
        <td>${percentCompliant}%</td>
      </tr>
    </tbody>
  </table>

   <table class="page-table">
    <caption>Criteria results by page and WCAG level</caption>
    <thead>
      <tr>
        <th scope="col">Page</th>
        <th scope="col">Compliant / A</th>
        <th scope="col">Compliant / AA</th>
        <th scope="col">Non-compliant / A</th>
        <th scope="col">Non-compliant / AA</th>
        <th scope="col">Not applicable / A</th>
        <th scope="col">Not applicable / AA</th>
        <th scope="col">Compliance rate</th>
      </tr>
    </thead>
    <tbody>
${pageRows}
    </tbody>
  </table>
</section>



<section class="card" aria-labelledby="ux-heading">
<h2 id="ux-heading">3. Inaccessible content</h2>
<p>All non-conformities are identified and taken into account by the teams concerned. Here is the list of non-compliant WCAG criteria:</p>
<ul>
${nonCompliantList}
</ul>
</section>


<section class="card" aria-labelledby="recommendations-heading">
<h2 id="recommendations-heading">4. Annual action plan</h2>
<p> For a long-term perspective and strategic roadmap, please refer to the <a href="https://bran-media.canalplus.pro/file/68e61b5c64e83/uploads/media/Multi_Year_Accessibility_.pdf">Multi-year Action Plan </a></p>
</section>


<section class="card" aria-labelledby="tracking-heading">
<h2 id="tracking-heading">5. Contact us for help with accessibility features</h2>
<p> To request an accessibility improvement, share your experience using Apple product accessibility features, or provide other accessibility feedback, please email the Accessibility Feedback team (accessibility@canal-plus.com).</p>
</section>


</body>

</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Automatically download the HTML file
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `accessibility-statement-CANAL+-${today}.html`;
    downloadLink.click();
    
    toast.success('Accessibility statement generated and downloaded');
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
          <Button variant="outline" onClick={() => {
            if (report.auditor_name) {
              // If audit info exists, directly generate statement
              generateAccessibilityStatement({
                auditorName: report.auditor_name || '',
                browsersDevices: report.browsers_devices || '',
                technologies: report.technologies || '',
                assistiveTech: report.assistive_tech || '',
                automatedTests: report.automated_tests || 'Evinced',
              });
            } else {
              toast.error('No audit information found. Please validate the audit first.');
            }
          }}>
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
              {Math.round(((stats.compliant + stats.notApplicable) / 55) * 100)}%
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
