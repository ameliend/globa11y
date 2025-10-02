import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const NewReportSite = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState<any>(null);
  const [reportName, setReportName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

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

  const handleCreateReport = async () => {
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .insert([{
          site_id: siteId,
          name: reportName,
          start_date: startDate,
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
              <Button className="flex-1" onClick={handleCreateReport} disabled={loading}>
                {loading ? 'Creating...' : 'Start Audit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewReportSite;
