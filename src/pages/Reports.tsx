import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Reports = () => {
  const { reports, getEntityById } = useApp();
  const navigate = useNavigate();

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tous les rapports</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de tous vos audits d'accessibilité
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun rapport</h3>
              <p className="text-muted-foreground mb-6">
                Créez une entité pour commencer vos audits
              </p>
              <Button onClick={() => navigate('/')}>
                Aller aux entités
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const entity = getEntityById(report.entityId);
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{report.name}</h3>
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{report.url}</p>
                        <p className="text-xs text-muted-foreground">
                          Entité : {entity?.name} • Créé le {new Date(report.startDate).toLocaleDateString('fr-FR')}
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
                        {report.status === 'completed' ? 'Voir résultats' : 'Continuer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
