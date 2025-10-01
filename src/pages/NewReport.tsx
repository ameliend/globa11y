import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

const NewReport = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { addReport, getEntityById } = useApp();
  
  const [reportName, setReportName] = useState('');
  const [url, setUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const entity = getEntityById(entityId!);

  if (!entity) {
    return null;
  }

  const handleCreateReport = () => {
    if (!reportName.trim() || !url.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const reportId = addReport({
      entityId: entityId!,
      name: reportName,
      url,
      startDate: new Date(startDate),
    });

    toast.success('Rapport créé avec succès');
    navigate(`/audit/${reportId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/entity/${entityId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nouveau rapport d'accessibilité</CardTitle>
            <p className="text-muted-foreground">
              Entité : {entity.name}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report-name">Nom du rapport</Label>
              <Input
                id="report-name"
                placeholder="Ex: Audit Homepage Décembre 2024"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL du site à auditer</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/entity/${entityId}`)}
              >
                Annuler
              </Button>
              <Button className="flex-1" onClick={handleCreateReport}>
                Lancer l'audit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewReport;
