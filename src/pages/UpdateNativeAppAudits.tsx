import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { wcagCriteriaNativeApp } from '@/data/wcagCriteriaNativeApp';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const UpdateNativeAppAudits = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');

  const criteriaToRemove = ['2.4.1', '2.4.2', '2.4.5', '3.1.2', '3.2.3', '3.2.4', '3.2.6'];
  const criteriaToAdd = wcagCriteriaNativeApp.filter(c => 
    ['3.14', '3.15', '3.16', '3.17'].includes(c.ref_id)
  );

  const updateAudits = async () => {
    setLoading(true);
    try {
      setProgress('Récupération des audits Native App...');
      
      // Get all native-app reports
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('id, name, audit_type')
        .eq('audit_type', 'native-app');

      if (reportsError) throw reportsError;

      if (!reports || reports.length === 0) {
        toast.info('Aucun audit Native App trouvé');
        setLoading(false);
        return;
      }

      setProgress(`${reports.length} audits trouvés. Mise à jour en cours...`);

      for (const report of reports) {
        // Get all pages for this report
        const { data: pages, error: pagesError } = await supabase
          .from('audit_pages')
          .select('id')
          .eq('report_id', report.id);

        if (pagesError) throw pagesError;

        for (const page of pages || []) {
          // Remove old criteria
          const { error: deleteError } = await supabase
            .from('criteria_results')
            .delete()
            .eq('page_id', page.id)
            .in('code', criteriaToRemove);

          if (deleteError) throw deleteError;

          // Get existing criteria codes for this page
          const { data: existingCriteria, error: existingError } = await supabase
            .from('criteria_results')
            .select('code')
            .eq('page_id', page.id);

          if (existingError) throw existingError;

          const existingCodes = new Set(existingCriteria?.map(c => c.code) || []);

          // Add new criteria if they don't exist
          const criteriaToInsert = criteriaToAdd
            .filter(c => !existingCodes.has(c.ref_id))
            .map(criterion => ({
              page_id: page.id,
              code: criterion.ref_id,
              title: criterion.title,
              level: criterion.level,
              status: 'not-applicable',
              observation: '',
            }));

          if (criteriaToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('criteria_results')
              .insert(criteriaToInsert);

            if (insertError) throw insertError;
          }
        }

        setProgress(`Audit "${report.name}" mis à jour`);
      }

      toast.success(`${reports.length} audits Native App mis à jour avec succès`);
      setProgress('Terminé !');
    } catch (error: any) {
      console.error('Error updating audits:', error);
      toast.error('Erreur lors de la mise à jour des audits');
    } finally {
      setLoading(false);
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
          Retour
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Mise à jour des audits Native App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Cette page permet de mettre à jour tous les audits Native App existants avec les nouveaux critères WCAG :
              </p>
              
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold">Critères à supprimer :</p>
                <ul className="list-disc list-inside text-sm">
                  {criteriaToRemove.map(code => (
                    <li key={code}>{code}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold">Critères à ajouter :</p>
                <ul className="list-disc list-inside text-sm">
                  {criteriaToAdd.map(criterion => (
                    <li key={criterion.ref_id}>
                      {criterion.ref_id} - {criterion.title}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                Total de critères après mise à jour : <strong>41 critères</strong>
              </p>
            </div>

            {progress && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm">{progress}</p>
              </div>
            )}

            <Button 
              onClick={updateAudits} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                'Mettre à jour tous les audits Native App'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Cette opération est réversible. Les données existantes ne seront pas perdues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UpdateNativeAppAudits;
