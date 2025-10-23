import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, XCircle, MinusCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp, AuditPage, CriteriaResult } from '@/contexts/AppContext';
import { wcagCriteria } from '@/data/wcagCriteria';
import { toast } from 'sonner';
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

const Audit = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { getReportById, updateReport } = useApp();
  
  const report = getReportById(reportId!);
  const [currentPages, setCurrentPages] = useState<AuditPage[]>(report?.pages || []);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageName, setPageName] = useState('');

  useEffect(() => {
    if (report) {
      setCurrentPages(report.pages);
      if (report.pages.length > 0 && !pageName) {
        setPageName(report.pages[currentPageIndex]?.name || '');
      }
    }
  }, [report, currentPageIndex]);

  if (!report) {
    return null;
  }

  const currentPage = currentPages[currentPageIndex];

  const initializePage = () => {
    if (!pageName.trim()) {
      toast.error('Veuillez nommer la page');
      return;
    }

    const newPage: AuditPage = {
      id: Math.random().toString(36).substr(2, 9),
      name: pageName,
      criteria: wcagCriteria.map(criterion => ({
        id: criterion.ref_id,
        code: criterion.ref_id,
        title: criterion.title,
        level: criterion.level,
        status: 'not-applicable' as const,
        observation: '',
      })),
    };

    const updatedPages = [...currentPages, newPage];
    setCurrentPages(updatedPages);
    setCurrentPageIndex(updatedPages.length - 1);
    setPageName('');
    toast.success('Page ajoutée');
  };

  const updateCriteriaStatus = (criteriaId: string, status: CriteriaResult['status']) => {
    const updatedPages = [...currentPages];
    const criterion = updatedPages[currentPageIndex].criteria.find(c => c.id === criteriaId);
    if (criterion) {
      criterion.status = status;
      setCurrentPages(updatedPages);
    }
  };

  const updateCriteriaObservation = (criteriaId: string, observation: string) => {
    const updatedPages = [...currentPages];
    const criterion = updatedPages[currentPageIndex].criteria.find(c => c.id === criteriaId);
    if (criterion) {
      criterion.observation = observation;
      setCurrentPages(updatedPages);
    }
  };

  const addNewPage = () => {
    updateReport(reportId!, { pages: currentPages, status: 'in-progress' });
    setPageName('');
    setCurrentPageIndex(currentPages.length);
  };

  const validateAudit = () => {
    // Count unique criteria codes across all pages
    const compliantCodes = new Set<string>();
    const notApplicableCodes = new Set<string>();
    
    currentPages.forEach(page => {
      page.criteria.forEach(c => {
        if (c.status === 'compliant') compliantCodes.add(c.code);
        if (c.status === 'not-applicable') notApplicableCodes.add(c.code);
      });
    });
    
    const score = Math.round(((compliantCodes.size + notApplicableCodes.size) / 55) * 100);

    updateReport(reportId!, { 
      pages: currentPages, 
      status: 'completed',
      score 
    });

    toast.success('Audit validé avec succès');
    navigate(`/results/${reportId}`);
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Audit : {report.name}</h1>
          <p className="text-muted-foreground">{report.url}</p>
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
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="current-page-name" className="text-sm mb-2">Nom de la page</Label>
                  <Input
                    id="current-page-name"
                    value={currentPage.name}
                    onChange={(e) => {
                      const updatedPages = [...currentPages];
                      updatedPages[currentPageIndex].name = e.target.value;
                      setCurrentPages(updatedPages);
                    }}
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
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {currentPage.criteria.map((criterion) => {
                const wcagInfo = wcagCriteria.find(w => w.ref_id === criterion.code);
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
                                updateCriteriaStatus(criterion.id, value as CriteriaResult['status'])
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
                                updateCriteriaObservation(criterion.id, e.target.value)
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
              <Button variant="outline" size="lg" onClick={addNewPage}>
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
