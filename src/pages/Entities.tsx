import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EntityCard } from '@/components/EntityCard';
import { useApp } from '@/contexts/AppContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Entities = () => {
  const { entities, addEntity, getReportsByEntity } = useApp();
  const [open, setOpen] = useState(false);
  const [entityName, setEntityName] = useState('');

  const handleCreateEntity = () => {
    if (entityName.trim()) {
      addEntity({ name: entityName });
      setEntityName('');
      setOpen(false);
    }
  };

  const getEntityStats = (entityId: string) => {
    const reports = getReportsByEntity(entityId);
    const completedReports = reports.filter(r => r.status === 'completed');
    const averageScore = completedReports.length > 0
      ? Math.round(completedReports.reduce((sum, r) => sum + (r.score || 0), 0) / completedReports.length)
      : undefined;
    
    return {
      reportCount: reports.length,
      averageScore,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mes Entités</h1>
            <p className="text-muted-foreground">
              Gérez vos produits et services à auditer
            </p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle entité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle entité</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau produit ou service à auditer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'entité</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Mon Application Web"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateEntity()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEntity}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {entities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Aucune entité</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Commencez par créer votre première entité pour gérer vos audits d'accessibilité
            </p>
            <Button size="lg" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer ma première entité
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => {
              const stats = getEntityStats(entity.id);
              return (
                <EntityCard
                  key={entity.id}
                  entity={entity}
                  reportCount={stats.reportCount}
                  averageScore={stats.averageScore}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Entities;
