import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, XCircle, MinusCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { wcagCriteria } from '@/data/wcagCriteria';
import { wcagCriteriaNativeApp } from '@/data/wcagCriteriaNativeApp';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface CriteriaResult {
  id?: string;
  code: string;
  title: string;
  level: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  observation: string;
}

interface AuditPage {
  id: string;
  name: string;
  criteria: CriteriaResult[];
}

const Audit = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<any>(null);
  const [currentPages, setCurrentPages] = useState<AuditPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageName, setPageName] = useState('');
  const [loading, setLoading] = useState(true);

  const totalCriteria = report?.audit_type === 'native-app' ? 48 : 55;
  const criteriaList = report?.audit_type === 'native-app' ? wcagCriteriaNativeApp : wcagCriteria;

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
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
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (pagesError) throw pagesError;

      if (pagesData && pagesData.length > 0) {
        const pages = pagesData.map((page: any) => ({
          id: page.id,
          name: page.name,
          criteria: page.criteria_results.map((c: any) => ({
            id: c.id,
            code: c.code,
            title: c.title,
            level: c.level,
            status: c.status,
            observation: c.observation || '',
          })),
        }));
        setCurrentPages(pages);
      }
    } catch (error: any) {
      toast.error('Failed to fetch audit');
    } finally {
      setLoading(false);
    }
  };

  const initializePage = async () => {
    if (!pageName.trim()) {
      toast.error('Veuillez nommer la page');
      return;
    }

    try {
      // Create audit page
      const { data: pageData, error: pageError } = await supabase
        .from('audit_pages')
        .insert([{
          report_id: reportId,
          name: pageName,
        }])
        .select()
        .single();

      if (pageError) throw pageError;

      // Create all criteria results for this page
      const criteriaToInsert = criteriaList.map(criterion => ({
        page_id: pageData.id,
        code: criterion.ref_id,
        title: criterion.title,
        level: criterion.level,
        status: 'not-applicable',
        observation: '',
      }));

      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria_results')
        .insert(criteriaToInsert)
        .select();

      if (criteriaError) throw criteriaError;

      const newPage: AuditPage = {
        id: pageData.id,
        name: pageName,
        criteria: criteriaData.map((c: any) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          level: c.level,
          status: c.status,
          observation: c.observation || '',
        })),
      };

      const updatedPages = [...currentPages, newPage];
      setCurrentPages(updatedPages);
      setCurrentPageIndex(updatedPages.length - 1);
      setPageName('');
      
      // Update report status
      await supabase
        .from('reports')
        .update({ status: 'in-progress' })
        .eq('id', reportId);

      toast.success('Page ajoutée');
    } catch (error: any) {
      toast.error('Failed to add page');
    }
  };

  const updateCriteriaStatus = async (criteriaDbId: string, status: CriteriaResult['status']) => {
    try {
      const { error } = await supabase
        .from('criteria_results')
        .update({ status })
        .eq('id', criteriaDbId);

      if (error) throw error;

      // Update local state
      const updatedPages = [...currentPages];
      const criterion = updatedPages[currentPageIndex].criteria.find(c => c.id === criteriaDbId);
      if (criterion) {
        criterion.status = status;
        setCurrentPages(updatedPages);
      }
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const updateCriteriaObservation = async (criteriaDbId: string, observation: string) => {
    try {
      const { error } = await supabase
        .from('criteria_results')
        .update({ observation })
        .eq('id', criteriaDbId);

      if (error) throw error;

      // Update local state
      const updatedPages = [...currentPages];
      const criterion = updatedPages[currentPageIndex].criteria.find(c => c.id === criteriaDbId);
      if (criterion) {
        criterion.observation = observation;
        setCurrentPages(updatedPages);
      }
    } catch (error: any) {
      toast.error('Failed to update observation');
    }
  };

  const updatePageName = async (newName: string) => {
    try {
      const currentPage = currentPages[currentPageIndex];
      const { error } = await supabase
        .from('audit_pages')
        .update({ name: newName })
        .eq('id', currentPage.id);

      if (error) throw error;

      const updatedPages = [...currentPages];
      updatedPages[currentPageIndex].name = newName;
      setCurrentPages(updatedPages);
    } catch (error: any) {
      toast.error('Failed to update page name');
    }
  };

  const deletePage = async (pageIndex: number) => {
    if (currentPages.length === 1) {
      toast.error('Impossible de supprimer la dernière page');
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      return;
    }

    try {
      const pageToDelete = currentPages[pageIndex];
      const { error } = await supabase
        .from('audit_pages')
        .delete()
        .eq('id', pageToDelete.id);

      if (error) throw error;

      const updatedPages = currentPages.filter((_, index) => index !== pageIndex);
      setCurrentPages(updatedPages);
      
      if (currentPageIndex >= updatedPages.length) {
        setCurrentPageIndex(Math.max(0, updatedPages.length - 1));
      }
      
      toast.success('Page supprimée');
    } catch (error: any) {
      toast.error('Failed to delete page');
    }
  };

  const calculatePageScore = (page: AuditPage) => {
    const filteredCriteria = report?.audit_type === 'native-app'
      ? page.criteria.filter(c => criteriaList.some(w => w.ref_id === c.code))
      : page.criteria;

    const compliantCount = filteredCriteria.filter(c => c.status === 'compliant').length;
    const notApplicableCount = filteredCriteria.filter(c => c.status === 'not-applicable').length;
    const denominator = totalCriteria - notApplicableCount;
    return denominator > 0 ? Math.round((compliantCount / denominator) * 100) : 0;
  };

  const calculateOverallScore = () => {
    const compliantCodes = new Set<string>();
    const notApplicableCodes = new Set<string>();
    const isNative = report?.audit_type === 'native-app';
    const allowedSet = isNative ? new Set(criteriaList.map(c => c.ref_id)) : null;
    
    currentPages.forEach(page => {
      page.criteria.forEach(c => {
        if (isNative && !(allowedSet as Set<string>).has(c.code)) return;
        if (c.status === 'compliant') compliantCodes.add(c.code);
        if (c.status === 'not-applicable') notApplicableCodes.add(c.code);
      });
    });
    
    const denominator = totalCriteria - notApplicableCodes.size;
    return denominator > 0 ? Math.round((compliantCodes.size / denominator) * 100) : 0;
  };

  const validateAudit = async () => {
    try {
      const compliantCodes = new Set<string>();
      const notApplicableCodes = new Set<string>();
      
      currentPages.forEach(page => {
        page.criteria.forEach(c => {
          if (c.status === 'compliant') compliantCodes.add(c.code);
          if (c.status === 'not-applicable') notApplicableCodes.add(c.code);
        });
      });
      
      const denominator = totalCriteria - notApplicableCodes.size;
      const score = denominator > 0 ? Math.round((compliantCodes.size / denominator) * 100) : 0;

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'completed',
          score 
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Audit validé avec succès');
      navigate(`/results/${reportId}`);
    } catch (error: any) {
      toast.error('Failed to validate audit');
    }
  };

  const getStatusIcon = (status: CriteriaResult['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'non-compliant':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'not-applicable':
        return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading || !report) {
    return null;
  }

  const currentPage = currentPages[currentPageIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/site/${report.sites.id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au site
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit : {report.name}</h1>
          <p className="text-muted-foreground">{report.sites.url}</p>
          <Badge variant="outline" className="mt-2">
            {report.audit_type === 'native-app' ? 'Native App (48 critères)' : 'Website (55 critères)'}
          </Badge>
        </div>

        {currentPages.length === 0 || currentPageIndex >= currentPages.length ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {currentPages.length === 0 ? 'Ajouter la première page' : 'Ajouter une nouvelle page'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page-name">Nom de la page</Label>
                <Input
                  id="page-name"
                  placeholder="Ex: Page d'accueil"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && initializePage()}
                />
              </div>
              <Button onClick={initializePage} className="w-full">
                Commencer l'audit de cette page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Score de la page</p>
                      <p className="text-3xl font-bold">{calculatePageScore(currentPage)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
                      <p className="text-3xl font-bold">{calculateOverallScore()}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Pages auditées</p>
                      <p className="text-3xl font-bold">{currentPages.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="current-page-name" className="text-sm mb-2">Nom de la page</Label>
                  <Input
                    id="current-page-name"
                    value={currentPage.name}
                    onChange={(e) => updatePageName(e.target.value)}
                    className="text-lg font-semibold"
                  />
                </div>
                {currentPages.length > 1 && (
                  <div>
                    <Label htmlFor="page-selector" className="text-sm mb-2">Changer de page</Label>
                    <Select
                      value={currentPageIndex.toString()}
                      onValueChange={(value) => setCurrentPageIndex(parseInt(value))}
                    >
                      <SelectTrigger id="page-selector" className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentPages.map((page, index) => (
                          <SelectItem key={page.id} value={index.toString()}>
                            {page.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label className="text-sm mb-2 opacity-0">Actions</Label>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deletePage(currentPageIndex)}
                    disabled={currentPages.length === 1}
                    title="Supprimer la page"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {(report.audit_type === 'native-app' 
                ? currentPage.criteria.filter(c => criteriaList.some(w => w.ref_id === c.code))
                : currentPage.criteria
              ).map((criterion) => {
                const wcagInfo = criteriaList.find(w => w.ref_id === criterion.code);
                return (
                  <Card key={criterion.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{criterion.level}</Badge>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {criterion.code}
                                </span>
                              </div>
                              <h3 className="font-semibold text-lg mb-2">{criterion.title}</h3>
                            </div>
                            {getStatusIcon(criterion.status)}
                          </div>

                          <div className="space-y-2">
                            <Label>Statut de conformité</Label>
                            <Select
                              value={criterion.status}
                              onValueChange={(value) => 
                                updateCriteriaStatus(criterion.id!, value as CriteriaResult['status'])
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compliant">✅ Conforme</SelectItem>
                                <SelectItem value="non-compliant">❌ Non conforme</SelectItem>
                                <SelectItem value="not-applicable">⚪ Non applicable</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Observations</Label>
                            <Textarea
                              placeholder="Ajoutez vos observations..."
                              value={criterion.observation}
                              onChange={(e) => 
                                updateCriteriaObservation(criterion.id!, e.target.value)
                              }
                              rows={2}
                            />
                          </div>

                          {wcagInfo && wcagInfo.special_cases && wcagInfo.special_cases.length > 0 && (
                            <Collapsible>
                              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
                                <Info className="h-4 w-4" />
                                Cas spéciaux
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 p-4 bg-muted rounded-lg">
                                <div className="space-y-3">
                                  {wcagInfo.special_cases.map((specialCase, idx) => (
                                    <div key={idx}>
                                      <p className="text-sm font-semibold">{specialCase.title}</p>
                                      {specialCase.description && (
                                        <p className="text-sm mt-1">{specialCase.description}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-3 sticky bottom-6">
              <Button variant="outline" size="lg" onClick={() => setCurrentPageIndex(currentPages.length)}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une page
              </Button>
              <Button size="lg" className="flex-1" onClick={validateAudit}>
                Valider l'audit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Audit;
