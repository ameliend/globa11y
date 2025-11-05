import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { wcagCriteriaNativeApp } from '@/data/wcagCriteriaNativeApp';

const RecalculateScores = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const recalculateAllScores = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      // Fetch all reports with their pages and criteria results
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, name, score, audit_type, audit_pages(id, criteria_results(code, status))');

      if (reportsError) throw reportsError;

      const updates = [];

      for (const report of reports || []) {
        const totalCriteria = report.audit_type === 'native-app' ? 41 : 55;
        
        // Count unique compliant and not-applicable criteria codes across all pages
        const compliantCodes = new Set<string>();
        const notApplicableCodes = new Set<string>();
        
        if (report.audit_pages && Array.isArray(report.audit_pages)) {
          for (const page of report.audit_pages) {
            if (page.criteria_results && Array.isArray(page.criteria_results)) {
              for (const criterion of page.criteria_results) {
                if (criterion.status === 'compliant') {
                  compliantCodes.add(criterion.code);
                }
                if (criterion.status === 'not-applicable') {
                  notApplicableCodes.add(criterion.code);
                }
              }
            }
          }
        }
        
        // Calculate new score: unique compliant / (totalCriteria - unique not-applicable) * 100
        const denominator = totalCriteria - notApplicableCodes.size;
        const newScore = denominator > 0 ? Math.round((compliantCodes.size / denominator) * 100) : 0;
        
        // Update the report score
        const { error: updateError } = await supabase
          .from('reports')
          .update({ score: newScore })
          .eq('id', report.id);
        
        if (updateError) {
          console.error(`Error updating report ${report.id}:`, updateError);
        } else {
          updates.push({
            reportId: report.id,
            reportName: report.name,
            oldScore: report.score,
            newScore,
            compliant: compliantCodes.size,
            notApplicable: notApplicableCodes.size,
          });
        }
      }

      setResults(updates);
      toast.success(`${updates.length} audits recalculés avec succès`);
    } catch (error: any) {
      toast.error('Erreur lors du recalcul des scores');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Recalculer tous les scores d'audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cette page permet de recalculer tous les scores d'audit existants avec la nouvelle formule :
            <br />
            <strong>Score = Critères conformes uniques / (Total critères [55 Website ou 41 Native App] - Critères non applicables uniques) × 100</strong>
          </p>
          
          <Button 
            onClick={recalculateAllScores} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Recalcul en cours...' : 'Recalculer tous les scores'}
          </Button>

          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold">Résultats ({results.length} audits mis à jour)</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <Card key={result.reportId}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{result.reportName}</p>
                          <p className="text-sm text-muted-foreground">
                            Conformes: {result.compliant} | Non applicables: {result.notApplicable}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Ancien: {result.oldScore !== null ? `${result.oldScore}%` : 'N/A'}
                          </p>
                          <p className="font-bold text-success">
                            Nouveau: {result.newScore}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecalculateScores;
