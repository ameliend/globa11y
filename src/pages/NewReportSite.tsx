import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const NewReportSite = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [reportName, setReportName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'website' | 'native-app' | null>(null);

  useEffect(() => {
    fetchSite();
  }, [siteId]);

  const fetchSite = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*, entities(*)')
        .eq('id', siteId)
        .single();

      if (error) throw error;
      setSite(data);
    } catch (error: any) {
      toast.error('Failed to fetch site');
    }
  };

  const handleStartAudit = () => {
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    setShowTypeModal(true);
  };

  const handleTypeSelect = async (type: 'website' | 'native-app') => {
    setSelectedType(type);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          site_id: siteId,
          name: reportName,
          start_date: startDate,
          audit_type: type,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Report created successfully');
      navigate(`/audit/${data.id}`);
    } catch (error: any) {
      toast.error('Failed to create report');
    } finally {
      setLoading(false);
      setShowTypeModal(false);
    }
  };

  if (!site) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(`/site/${siteId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Site
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">New Accessibility Report</CardTitle>
            <p className="text-muted-foreground">
              Site: {site.name} ({site.url})
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                placeholder="e.g. Homepage Audit December 2024"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
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
                onClick={() => navigate(`/site/${siteId}`)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleStartAudit} disabled={loading}>
                Start Audit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTypeModal} onOpenChange={setShowTypeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Audit Type</DialogTitle>
            <DialogDescription>
              Choose the type of accessibility audit you want to perform
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => handleTypeSelect('website')}
              disabled={loading}
            >
              <Globe className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Website</div>
                <div className="text-xs text-muted-foreground">55 criteria</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2"
              onClick={() => handleTypeSelect('native-app')}
              disabled={loading}
            >
              <Smartphone className="h-8 w-8" />
              <div className="text-center">
                <div className="font-semibold">Native App</div>
                <div className="text-xs text-muted-foreground">41 criteria</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewReportSite;
