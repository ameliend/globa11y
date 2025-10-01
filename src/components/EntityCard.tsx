import { Building2, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Entity } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

interface EntityCardProps {
  entity: Entity;
  reportCount: number;
  averageScore?: number;
}

export function EntityCard({ entity, reportCount, averageScore }: EntityCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/entity/${entity.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              {entity.logo ? (
                <img src={entity.logo} alt={entity.name} className="h-8 w-8 rounded" />
              ) : (
                <Building2 className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-xl">{entity.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-semibold">{reportCount}</p>
              <p className="text-xs text-muted-foreground">Rapports</p>
            </div>
          </div>
          {averageScore !== undefined && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold">{averageScore}%</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </div>
          )}
        </div>
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          navigate(`/entity/${entity.id}/new-report`);
        }}>
          Créer un rapport
        </Button>
      </CardContent>
    </Card>
  );
}
