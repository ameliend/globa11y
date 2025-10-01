import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

const EntityDashboard = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { getEntityById, getReportsByEntity } = useApp();

  const entity = getEntityById(entityId!);
  const reports = getReportsByEntity(entityId!);

  if (!entity) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Entité introuvable</h2>
          <Button onClick={() => navigate('/')}>
            Retour aux entités
          </Button>
        </div>
      </div>
    );
  }

  const completedReports = reports.filter(r => r.status === 'completed');
  const averageScore = completedReports.length > 0
    ? Math.round(completedReports.reduce((sum, r) => sum + (r.score || 0), 0) / completedReports.length)
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success">Terminé</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning">En cours</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux entités
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{entity.name}</h1>
          <p className="text-muted-foreground">
            Tableau de bord et rapports d'accessibilité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total rapports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{reports.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rapports complétés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{completedReports.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score moyen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{averageScore}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Rapports</h2>
          <Button onClick={() => navigate(`/entity/${entityId}/new-report`)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rapport
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun rapport</h3>
              <p className="text-muted-foreground mb-6">
                Créez votre premier rapport d'audit d'accessibilité
              </p>
              <Button onClick={() => navigate(`/entity/${entityId}/new-report`)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un rapport
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{report.name}</h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{report.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Créé le {new Date(report.startDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {report.score !== undefined && (
                      <div className="text-right ml-4">
                        <p className="text-3xl font-bold text-primary">{report.score}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="ml-4"
                      onClick={() => {
                        if (report.status === 'completed') {
                          navigate(`/results/${report.id}`);
                        } else {
                          navigate(`/audit/${report.id}`);
                        }
                      }}
                    >
                      {report.status === 'completed' ? 'Voir les résultats' : 'Continuer l\'audit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityDashboard;
