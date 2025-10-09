import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, XCircle, MinusCircle, Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { wcagCriteria } from '@/data/wcagCriteria';
import wcagFullData from '@/data/wcag-full.json';
import { howToTest } from '@/data/howToTest';
import { Collapsible as CollapsiblePrimitive, CollapsibleContent as CollapsibleContentPrimitive, CollapsibleTrigger as CollapsibleTriggerPrimitive } from '@/components/ui/collapsible';
import { AccessibilityStatementModal, AccessibilityStatementData } from '@/components/AccessibilityStatementModal';

interface CriteriaStatus {
  id: string;
  code: string;
  title: string;
  description: string;
  level: string;
  status: 'compliant' | 'non-compliant' | 'not-applicable';
  observation: string;
  principle: string;
}

interface AuditPage {
  id: string;
  name: string;
  criteria: CriteriaStatus[];
}

const AuditNew = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [report, setReport] = useState<any>(null);
  const [pages, setPages] = useState<AuditPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageName, setPageName] = useState('');
  const [showDuplicateOption, setShowDuplicateOption] = useState(false);
  const [selectedPageToDuplicate, setSelectedPageToDuplicate] = useState<string>('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showAuditInfoModal, setShowAuditInfoModal] = useState(false);
  const [importResults, setImportResults] = useState<{
    compliant: string[];
    nonCompliant: string[];
  }>({ compliant: [], nonCompliant: [] });

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
        .order('created_at');

      if (pagesError) throw pagesError;

      if (pagesData && pagesData.length > 0) {
        const formattedPages = pagesData.map((page: any) => ({
          id: page.id,
          name: page.name,
          criteria: page.criteria_results.map((cr: any) => {
            const principle = getPrincipleForCriteria(cr.code);
            const description = getDescriptionForCriteria(cr.code);
            return {
              ...cr,
              principle,
              description,
            };
          }),
        }));
        setPages(formattedPages);
      }
    } catch (error: any) {
      toast.error('Failed to fetch report');
    }
  };

  const getPrincipleForCriteria = (code: string): string => {
    const principleNum = code.split('.')[0];
    const principles: any = {
      '1': 'Perceivable',
      '2': 'Operable',
      '3': 'Understandable',
      '4': 'Robust',
    };
    return principles[principleNum] || 'Other';
  };

  const getDescriptionForCriteria = (code: string): string => {
    for (const principle of wcagFullData as any[]) {
      for (const guideline of principle.guidelines) {
        const criterion = guideline.success_criteria?.find((sc: any) => sc.ref_id === code);
        if (criterion) {
          return criterion.description || guideline.description || '';
        }
      }
    }
    return '';
  };

  const initializePage = (duplicateFromPage?: AuditPage) => {
    const baseCriteria = wcagCriteria.map((c) => {
      const principle = getPrincipleForCriteria(c.code);
      const description = getDescriptionForCriteria(c.code);
      return {
        id: Math.random().toString(36).substr(2, 9),
        code: c.code,
        title: c.title,
        description,
        level: c.level,
        status: 'not-applicable' as const,
        observation: '',
        principle,
      };
    });

    if (duplicateFromPage) {
      return baseCriteria.map((bc) => {
        const existing = duplicateFromPage.criteria.find((c) => c.code === bc.code);
        return existing ? { ...bc, status: existing.status, observation: existing.observation } : bc;
      });
    }

    return baseCriteria;
  };

  const handleAddPage = async () => {
    if (!pageName.trim()) {
      toast.error('Please enter a page name');
      return;
    }

    try {
      const duplicateFrom = selectedPageToDuplicate 
        ? pages.find(p => p.id === selectedPageToDuplicate)
        : undefined;

      const criteria = initializePage(duplicateFrom);

      const { data: pageData, error: pageError } = await supabase
        .from('audit_pages')
        .insert([{ report_id: reportId, name: pageName }])
        .select()
        .single();

      if (pageError) throw pageError;

      const criteriaToInsert = criteria.map((c) => ({
        page_id: pageData.id,
        code: c.code,
        title: c.title,
        level: c.level,
        status: c.status,
        observation: c.observation,
      }));

      const { error: criteriaError } = await supabase
        .from('criteria_results')
        .insert(criteriaToInsert);

      if (criteriaError) throw criteriaError;

      toast.success('Page added successfully');
      setPageName('');
      setSelectedPageToDuplicate('');
      setShowDuplicateOption(false);
      await fetchReport();
      
      // Navigate to the newly created page
      const newPageIndex = pages.length;
      setCurrentPageIndex(newPageIndex);
    } catch (error: any) {
      toast.error('Failed to add page');
    }
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // List of criteria that can be automatically filled
      const autoFillCriteria = [
        '1.1.1', '1.3.1', '1.3.2', '1.3.3', '1.3.5', '1.4.1', '1.4.3', '1.4.4', '1.4.12',
        '2.1.1', '2.2.1', '2.2.2', '2.4.2', '2.4.3', '2.4.4', '2.4.7', '2.5.8',
        '3.1.1', '3.1.2', '4.1.2'
      ];

      const wcagTags: string[] = [];
      const findWcagTags = (obj: any) => {
        if (Array.isArray(obj)) {
          obj.forEach(findWcagTags);
        } else if (typeof obj === 'object' && obj !== null) {
          if (obj.tags && Array.isArray(obj.tags)) {
            obj.tags.forEach((tag: any) => {
              if (tag.id && tag.id.startsWith('WCAG-')) {
                const code = tag.id.replace('WCAG-', '');
                if (autoFillCriteria.includes(code)) {
                  wcagTags.push(code);
                }
              }
            });
          }
          Object.values(obj).forEach(findWcagTags);
        }
      };
      findWcagTags(data);

      if (pages.length === 0 || currentPageIndex >= pages.length) {
        toast.error('Please create a page first');
        return;
      }

      // Calculate compliant and non-compliant
      const nonCompliant = wcagTags.filter((code, index, self) => self.indexOf(code) === index); // unique
      const compliant = autoFillCriteria.filter(code => !nonCompliant.includes(code));

      setImportResults({ compliant, nonCompliant });
      setShowImportDialog(true);
    } catch (error: any) {
      toast.error('Failed to parse JSON file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    try {
      const currentPage = pages[currentPageIndex];
      if (!currentPage) {
        toast.error('No page selected');
        return;
      }

      // Map criteria code to IDs for this page
      const criteriaToUpdate = currentPage.criteria || [];
      const getIdByCode = (code: string) => criteriaToUpdate.find((c: any) => c.code === code)?.id;

      const nonCompliantIds = importResults.nonCompliant
        .map(getIdByCode)
        .filter((id): id is string => Boolean(id));

      const compliantIds = importResults.compliant
        .map(getIdByCode)
        .filter((id): id is string => Boolean(id));

      // Perform at most two bulk updates to avoid timeouts
      let errors: any[] = [];
      if (nonCompliantIds.length) {
        const { error } = await supabase
          .from('criteria_results')
          .update({ status: 'non-compliant' })
          .in('id', nonCompliantIds)
          .select();
        if (error) errors.push(error);
      }
      if (compliantIds.length) {
        const { error } = await supabase
          .from('criteria_results')
          .update({ status: 'compliant' })
          .in('id', compliantIds)
          .select();
        if (error) errors.push(error);
      }

      if (errors.length > 0) {
        console.error('Bulk update errors:', errors);
        throw new Error('Some updates failed');
      }

      toast.success(`Updated ${nonCompliantIds.length + compliantIds.length} criteria from JSON import`);
      setShowImportDialog(false);
      setImportResults({ compliant: [], nonCompliant: [] });
      await fetchReport();
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error('Failed to apply import');
    }
  };

  const handleUpdateCriteria = async (criteriaId: string, field: 'status' | 'observation', value: string) => {
    try {
      const { error } = await supabase
        .from('criteria_results')
        .update({ [field]: value })
        .eq('id', criteriaId);

      if (error) throw error;

      setPages((prev) =>
        prev.map((page, idx) =>
          idx === currentPageIndex
            ? {
                ...page,
                criteria: page.criteria.map((c) =>
                  c.id === criteriaId ? { ...c, [field]: value } : c
                ),
              }
            : page
        )
      );
    } catch (error: any) {
      toast.error('Failed to update criteria');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: 'draft' })
        .eq('id', reportId);

      if (error) throw error;
      toast.success('Report saved as draft');
    } catch (error: any) {
      toast.error('Failed to save draft');
    }
  };

  const handleValidateAudit = () => {
    if (pages.length === 0) {
      toast.error('Please add at least one page');
      return;
    }
    setShowAuditInfoModal(true);
  };

  const handleSaveAuditInfo = async (data: AccessibilityStatementData) => {
    try {
      const allCriteria = pages.flatMap((p) => p.criteria);
      const compliant = allCriteria.filter((c) => c.status === 'compliant').length;
      const total = allCriteria.filter((c) => c.status !== 'not-applicable').length;
      const score = total > 0 ? (compliant / total) * 100 : 0;

      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'completed', 
          score,
          auditor_name: data.auditorName,
          browsers_devices: data.browsersDevices,
          technologies: data.technologies,
          assistive_tech: data.assistiveTech,
          automated_tests: data.automatedTests
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Audit validated successfully');
      navigate(`/results/${reportId}`);
    } catch (error: any) {
      toast.error('Failed to validate audit');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'non-compliant':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const groupCriteriaByPrinciple = (criteria: CriteriaStatus[]) => {
    const grouped: Record<string, CriteriaStatus[]> = {};
    criteria.forEach((c) => {
      if (!grouped[c.principle]) {
        grouped[c.principle] = [];
      }
      grouped[c.principle].push(c);
    });
    return grouped;
  };

  const getPrincipleStats = (criteria: CriteriaStatus[]) => {
    const compliant = criteria.filter((c) => c.status === 'compliant').length;
    const nonCompliant = criteria.filter((c) => c.status === 'non-compliant').length;
    const notApplicable = criteria.filter((c) => c.status === 'not-applicable').length;
    return { compliant, nonCompliant, notApplicable };
  };

  if (!report) return null;

  const currentPage = pages[currentPageIndex];

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(`/site/${report.sites.id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Site
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{report.name}</h1>
        <p className="text-muted-foreground">{report.sites.url}</p>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Add First Page to Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-name">Page Name</Label>
              <Input
                id="page-name"
                placeholder="e.g. Homepage"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
              />
            </div>
            <Button onClick={handleAddPage}>Add Page</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select
              value={currentPageIndex.toString()}
              onValueChange={(value) => setCurrentPageIndex(parseInt(value))}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pages.map((page, idx) => (
                  <SelectItem key={page.id} value={idx.toString()}>
                    {page.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJson}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Import JSON
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>

          {currentPage && (
            <Accordion type="multiple" className="space-y-4">
              {Object.entries(groupCriteriaByPrinciple(currentPage.criteria)).map(([principle, criteria]) => {
                const stats = getPrincipleStats(criteria);
                return (
                  <AccordionItem key={principle} value={principle} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-semibold text-lg">{principle}</span>
                        <span className="text-sm text-muted-foreground">
                          ✓ {stats.compliant} / ✗ {stats.nonCompliant} / ○ {stats.notApplicable}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        {criteria.map((criterion) => (
                          <Card key={criterion.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-4">
                                {getStatusIcon(criterion.status)}
                                <div className="flex-1 space-y-3">
                                  <div>
                                    <h4 className="font-semibold">
                                      {criterion.code} - {criterion.title}
                                      <span className="ml-2 text-sm text-muted-foreground">
                                        Level {criterion.level}
                                      </span>
                                    </h4>
                                     {criterion.description && (
                                       <p className="text-sm text-muted-foreground mt-1">
                                         {criterion.description}
                                       </p>
                                     )}
                                     {howToTest[criterion.code] && (
                                       <CollapsiblePrimitive className="mt-2">
                                         <CollapsibleTriggerPrimitive className="flex items-center gap-2 text-sm font-medium text-primary underline">
                                           How to test
                                         </CollapsibleTriggerPrimitive>
                                         <CollapsibleContentPrimitive className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                           {howToTest[criterion.code]}
                                         </CollapsibleContentPrimitive>
                                       </CollapsiblePrimitive>
                                     )}
                                   </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Status</Label>
                                      <Select
                                        value={criterion.status}
                                        onValueChange={(value) =>
                                          handleUpdateCriteria(criterion.id, 'status', value)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="compliant">✓ Compliant</SelectItem>
                                          <SelectItem value="non-compliant">✗ Non-compliant</SelectItem>
                                          <SelectItem value="not-applicable">○ Not Applicable</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>Observation</Label>
                                      <Textarea
                                        placeholder="Add observation..."
                                        value={criterion.observation}
                                        onChange={(e) =>
                                          handleUpdateCriteria(criterion.id, 'observation', e.target.value)
                                        }
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add Another Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-page-name">Page Name</Label>
                <Input
                  id="new-page-name"
                  placeholder="e.g. Contact Page"
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="duplicate"
                  checked={showDuplicateOption}
                  onChange={(e) => setShowDuplicateOption(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="duplicate">Duplicate from existing page</Label>
              </div>
              {showDuplicateOption && (
                <Select value={selectedPageToDuplicate} onValueChange={setSelectedPageToDuplicate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page to duplicate" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button onClick={handleAddPage}>
                <Plus className="mr-2 h-4 w-4" />
                Add Page
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleValidateAudit} size="lg">
              Validate Audit
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import JSON Results</DialogTitle>
            <DialogDescription>
              Review the criteria detected from the JSON file before applying changes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Non-Compliant Criteria ({importResults.nonCompliant.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {importResults.nonCompliant.map((code) => (
                  <div key={code} className="text-sm bg-destructive/10 px-3 py-2 rounded border border-destructive/20">
                    {code}
                  </div>
                ))}
                {importResults.nonCompliant.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">No non-compliant criteria found</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-success mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Compliant Criteria ({importResults.compliant.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {importResults.compliant.map((code) => (
                  <div key={code} className="text-sm bg-success/10 px-3 py-2 rounded border border-success/20">
                    {code}
                  </div>
                ))}
                {importResults.compliant.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full">No compliant criteria found</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport}>
              Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AccessibilityStatementModal
        open={showAuditInfoModal}
        onOpenChange={setShowAuditInfoModal}
        onGenerate={handleSaveAuditInfo}
      />
    </div>
  );
};

export default AuditNew;
