import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AccessibilityStatementModal, AccessibilityStatementData } from '@/components/AccessibilityStatementModal';
import { format } from 'date-fns';

const Results = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReportById, getEntityById } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  
  const report = getReportById(reportId!);
  const entity = report ? getEntityById(report.entityId) : null;

  if (!report || !entity) {
    return null;
  }

  const totalCriteria = report.pages.reduce((sum, page) => 
    sum + page.criteria.filter(c => c.status !== 'not-applicable').length, 0);
  
  const compliantCriteria = report.pages.reduce((sum, page) => 
    sum + page.criteria.filter(c => c.status === 'compliant').length, 0);
  
  const nonCompliantCriteria = report.pages.reduce((sum, page) => 
    sum + page.criteria.filter(c => c.status === 'non-compliant').length, 0);

  const nonCompliantList = report.pages.flatMap(page =>
    page.criteria
      .filter(c => c.status === 'non-compliant')
      .map(c => ({ ...c, pageName: page.name }))
  );

  const handleExportPDF = () => {
    // Placeholder pour l'export PDF
    alert('Fonctionnalité d\'export PDF à venir');
  };

  const generateAccessibilityStatement = (data: AccessibilityStatementData) => {
    // Calculate statistics
    const allCriteria = report.pages.flatMap(page => page.criteria);
    
    // Level A statistics
    const aCompliant = allCriteria.filter(c => c.level === 'A' && c.status === 'compliant').length;
    const aNonCompliant = allCriteria.filter(c => c.level === 'A' && c.status === 'non-compliant').length;
    const aNotApplicable = allCriteria.filter(c => c.level === 'A' && c.status === 'not-applicable').length;
    const aTotal = 32;
    const aApplicable = aTotal - aNotApplicable;
    const aCompliancePercent = aApplicable > 0 ? Math.round((aCompliant / aApplicable) * 100) : 0;
    
    // Level AA statistics
    const aaCompliant = allCriteria.filter(c => c.level === 'AA' && c.status === 'compliant').length;
    const aaNonCompliant = allCriteria.filter(c => c.level === 'AA' && c.status === 'non-compliant').length;
    const aaNotApplicable = allCriteria.filter(c => c.level === 'AA' && c.status === 'not-applicable').length;
    const aaTotal = 24;
    const aaApplicable = aaTotal - aaNotApplicable;
    const aaCompliancePercent = aaApplicable > 0 ? Math.round((aaCompliant / aaApplicable) * 100) : 0;
    
    // Total statistics
    const totalCompliant = aCompliant + aaCompliant;
    const totalNonCompliant = aNonCompliant + aaNonCompliant;
    const totalNotApplicable = aNotApplicable + aaNotApplicable;
    const totalApplicable = (aTotal + aaTotal) - totalNotApplicable;
    const totalCompliancePercent = totalApplicable > 0 ? Math.round((totalCompliant / totalApplicable) * 100) : 0;

    // Generate non-compliant criteria list
    const nonCompliantCriteria = nonCompliantList.map(item => 
      `<li>${item.code} ${item.title}</li>`
    ).join('\n        ');

    // Generate page list
    const pagesList = report.pages.map(page => `<li>${page.name}</li>`).join('\n        ');

    // Generate page statistics rows
    const pageRows = report.pages.map(page => {
      const pageCriteria = page.criteria;
      const pageACompliant = pageCriteria.filter(c => c.level === 'A' && c.status === 'compliant').length;
      const pageAACompliant = pageCriteria.filter(c => c.level === 'AA' && c.status === 'compliant').length;
      const pageANonCompliant = pageCriteria.filter(c => c.level === 'A' && c.status === 'non-compliant').length;
      const pageAANonCompliant = pageCriteria.filter(c => c.level === 'AA' && c.status === 'non-compliant').length;
      const pageANotApplicable = pageCriteria.filter(c => c.level === 'A' && c.status === 'not-applicable').length;
      const pageAANotApplicable = pageCriteria.filter(c => c.level === 'AA' && c.status === 'not-applicable').length;
      const pageTotal = pageCriteria.filter(c => c.status !== 'not-applicable').length;
      const pageCompliant = pageCriteria.filter(c => c.status === 'compliant').length;
      const pageCompliancePercent = pageTotal > 0 ? Math.round((pageCompliant / pageTotal) * 100) : 0;

      return `      <tr>
        <th scope="row">${page.name}</th>
        <td>${pageACompliant}</td>
        <td>${pageAACompliant}</td>
        <td>${pageANonCompliant}</td>
        <td>${pageAANonCompliant}</td>
        <td>${pageANotApplicable}</td>
        <td>${pageAANotApplicable}</td>
        <td>${pageCompliancePercent}%</td>
      </tr>`;
    }).join('\n');

    // Generate HTML document
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

</style>
</head>
<body>
<header>
<h1>WCAG Accessibility Audit</h1>
<div class="meta">
<div class="card"><strong>Service :</strong> <span id="project-name">CANAL+</span></div>
<div class="card"><strong>Page / URL:</strong> <span id="page-url">${report.url}</span></div>
<div class="card"><strong>Auditor:</strong> <span id="tester">${data.auditorName}</span></div>
<div class="card"><strong>Date:</strong> <span id="date">${format(new Date(report.startDate), 'yyyy-MM-dd')}</span></div>
<div class="card"><strong>Target WCAG Level:</strong> <span id="level">A / AA </span></div>
</div>
</header>


<section class="card" aria-labelledby="scope-heading">
<h2 id="scope-heading">1. Scope and Context</h2>
<p class="small">Define the technical and functional scope of the tests.</p>
<ul>
<li><strong>Target pages and user flows:</strong>
    <ul>
        ${pagesList}
    </ul>
</li>
<li><strong>Browsers & devices tested:</strong> ${data.browsersDevices || 'N/A'}</li>
<li><strong>Technologies / CMS / libraries:</strong> ${data.technologies || 'N/A'}</li>
<li><strong>Assistive tech used:</strong> ${data.assistiveTech || 'N/A'}</li>
<li><strong>Automated tests:</strong> ${data.automatedTests || 'N/A'}</li>
</ul>
</section>



<section class="card" aria-labelledby="summary-heading">
<h2 id="summary-heading">2. Executive Summary</h2>
<p class="small">Brief overview of the results, overall compliance level, and critical issues.</p>
<p><strong>Estimated compliance level:</strong> ${report.score}% level A-AA</p>
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
        <td>24</td>
        <td>56</td>
      </tr>
      <tr>
        <th scope="row">Compliant</th>
        <td>${aCompliant}</td>
        <td>${aaCompliant}</td>
        <td>${totalCompliant}</td>
      </tr>
      <tr>
        <th scope="row">Non-compliant</th>
        <td>${aNonCompliant}</td>
        <td>${aaNonCompliant}</td>
        <td>${totalNonCompliant}</td>
      </tr>
      <tr>
        <th scope="row">Not applicable</th>
        <td>${aNotApplicable}</td>
        <td>${aaNotApplicable}</td>
        <td>${totalNotApplicable}</td>
      </tr>
      <tr>
        <th scope="row">Compliance rate</th>
        <td>${aCompliancePercent}%</td>
        <td>${aaCompliancePercent}%</td>
        <td>${totalCompliancePercent}%</td>
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
${nonCompliantCriteria || '        <li>No non-compliant criteria found</li>'}
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

    // Open in new tab
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/entity/${report.entityId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Résultats : {report.name}
            </h1>
            <p className="text-muted-foreground">Entité : {entity.name}</p>
            <p className="text-muted-foreground">{report.url}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setModalOpen(true)} variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Accessibility Statement
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Exporter en PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-primary mb-2">{report.score}%</p>
              <Progress value={report.score} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critères conformes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-3xl font-bold">{compliantCriteria}</p>
                <span className="text-muted-foreground">/ {totalCriteria}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Non-conformités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-3xl font-bold text-destructive">{nonCompliantCriteria}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Résumé par page</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.pages.map((page) => {
                const pageTotal = page.criteria.filter(c => c.status !== 'not-applicable').length;
                const pageCompliant = page.criteria.filter(c => c.status === 'compliant').length;
                const pageScore = pageTotal > 0 ? Math.round((pageCompliant / pageTotal) * 100) : 0;

                return (
                  <div key={page.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{page.name}</h3>
                      <Progress value={pageScore} className="h-2" />
                    </div>
                    <div className="ml-6 text-right">
                      <p className="text-2xl font-bold text-primary">{pageScore}%</p>
                      <p className="text-xs text-muted-foreground">
                        {pageCompliant} / {pageTotal}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {nonCompliantList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommandations et non-conformités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nonCompliantList.map((item, index) => (
                  <div key={index} className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-start gap-3 mb-2">
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{item.level}</Badge>
                          <span className="font-mono text-sm text-muted-foreground">
                            {item.code}
                          </span>
                          <span className="text-sm text-muted-foreground">• {item.pageName}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        {item.observation && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Observation :</strong> {item.observation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AccessibilityStatementModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onGenerate={generateAccessibilityStatement}
        />
      </div>
    </div>
  );
};

export default Results;
