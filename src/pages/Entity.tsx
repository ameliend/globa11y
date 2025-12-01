import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { wcagCriteriaNativeApp } from '@/data/wcagCriteriaNativeApp';

interface Site {
  id: string;
  name: string;
  url: string;
  latest_score?: number;
}

// Calculate score using pessimistic aggregation logic
const calculatePessimisticScore = (
  pages: { criteria_results: { code: string; status: string }[] }[],
  auditType: string
): number => {
  const isNative = auditType === 'native-app';
  const totalCriteria = isNative ? 41 : 55;
  const allowedSet = isNative ? new Set(wcagCriteriaNativeApp.map(c => c.ref_id)) : null;
  
  // Track criteria status across all pages (pessimistic aggregation)
  const perCodeStatus = new Map<string, { hasCompliant: boolean; hasNonCompliant: boolean }>();
  
  for (const page of pages) {
    for (const criterion of page.criteria_results || []) {
      // Filter to only allowed criteria for native-app
      if (isNative && !allowedSet!.has(criterion.code)) continue;
      
      const entry = perCodeStatus.get(criterion.code) || { hasCompliant: false, hasNonCompliant: false };
      if (criterion.status === 'compliant') entry.hasCompliant = true;
      if (criterion.status === 'non-compliant') entry.hasNonCompliant = true;
      perCodeStatus.set(criterion.code, entry);
    }
  }
  
  // Count compliant and not-applicable criteria
  const compliantCodes = new Set<string>();
  const notApplicableCodes = new Set<string>();
  
  perCodeStatus.forEach((status, code) => {
    // Pessimistic aggregation: if non-compliant on at least one page, it's non-compliant overall
    if (status.hasNonCompliant) {
      // Not compliant overall
    } else if (status.hasCompliant) {
      compliantCodes.add(code);
    } else {
      // Never compliant, never non-compliant = not-applicable
      notApplicableCodes.add(code);
    }
  });
  
  // Calculate score: unique compliant / (totalCriteria - unique not-applicable) * 100
  const denominator = totalCriteria - notApplicableCodes.size;
  return denominator > 0 ? Math.round((compliantCodes.size / denominator) * 100) : 0;
};

const Entity = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const [entity, setEntity] = useState<any>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [open, setOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteEntityDialog, setDeleteEntityDialog] = useState(false);
  const [deleteSiteDialog, setDeleteSiteDialog] = useState<{ open: boolean; siteId: string | null }>({
    open: false,
    siteId: null,
  });

  useEffect(() => {
    fetchEntity();
    fetchSites();
  }, [entityId]);

  const fetchEntity = async () => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('id', entityId)
        .single();

      if (error) throw error;
      setEntity(data);
    } catch (error: any) {
      toast.error('Failed to fetch entity');
    }
  };

  const fetchSites = async () => {
    try {
      const { data: sitesData, error } = await supabase
        .from('sites')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For each site, fetch the latest completed report and calculate score pessimistically
      const sitesWithScores = await Promise.all(
        (sitesData || []).map(async (site) => {
          const { data: reportData } = await supabase
            .from('reports')
            .select('*, audit_pages(id, criteria_results(code, status))')
            .eq('site_id', site.id)
            .eq('status', 'completed')
            .order('start_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          let latest_score: number | undefined;
          if (reportData) {
            latest_score = calculatePessimisticScore(
              reportData.audit_pages || [],
              reportData.audit_type || 'website'
            );
          }

          return {
            ...site,
            latest_score,
          };
        })
      );

      setSites(sitesWithScores);
    } catch (error: any) {
      toast.error('Failed to fetch sites');
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      toast.error('Please enter a site name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sites')
        .insert([{ name: siteName, url: siteUrl, entity_id: entityId }]);

      if (error) throw error;

      toast.success('Site added successfully');
      setSiteName('');
      setSiteUrl('');
      setOpen(false);
      fetchSites();
    } catch (error: any) {
      toast.error('Failed to add site');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntity = async () => {
    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', entityId);

      if (error) throw error;

      toast.success('Entity deleted successfully');
      setDeleteEntityDialog(false);
      navigate('/');
    } catch (error: any) {
      toast.error('Failed to delete entity');
    }
  };

  const handleDeleteSite = async () => {
    if (!deleteSiteDialog.siteId) return;

    try {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', deleteSiteDialog.siteId);

      if (error) throw error;

      toast.success('Site deleted successfully');
      setDeleteSiteDialog({ open: false, siteId: null });
      fetchSites();
    } catch (error: any) {
      toast.error('Failed to delete site');
    }
  };

  if (!entity) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Entities
      </Button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{entity.name}</h1>
          <p className="text-muted-foreground">Audited Sites: {sites.length}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setDeleteEntityDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Site to Audit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Site to Audit</DialogTitle>
                <DialogDescription>
                  Add a new website to audit for this entity
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    placeholder="Homepage"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url">Site URL</Label>
                  <Input
                    id="site-url"
                    type="url"
                    placeholder="https://example.com"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    Add Site
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Sites Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Add your first site to start creating accessibility audits
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl cursor-pointer" onClick={() => navigate(`/site/${site.id}`)}>
                    {site.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteSiteDialog({ open: true, siteId: site.id });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="cursor-pointer" onClick={() => navigate(`/site/${site.id}`)}>
                <p className="text-sm text-muted-foreground mb-2">{site.url}</p>
                {site.latest_score !== undefined ? (
                  <p className="text-sm font-medium text-foreground">
                    Score: {Math.round(site.latest_score)}%
                  </p>
                ) : (
                  <p className="text-sm font-medium text-muted-foreground">
                    To audit
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteEntityDialog}
        onOpenChange={setDeleteEntityDialog}
        onConfirm={handleDeleteEntity}
        title="Delete Entity?"
        description="This will permanently delete this entity and all associated sites and reports. This action cannot be undone."
      />

      <DeleteConfirmDialog
        open={deleteSiteDialog.open}
        onOpenChange={(open) => setDeleteSiteDialog({ open, siteId: null })}
        onConfirm={handleDeleteSite}
        title="Delete Site?"
        description="This will permanently delete this site and all its reports. This action cannot be undone."
      />
    </div>
  );
};

export default Entity;
