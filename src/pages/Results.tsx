import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Results = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReportById, getEntityById } = useApp();
  
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
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
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
      </div>
    </div>
  );
};

export default Results;
