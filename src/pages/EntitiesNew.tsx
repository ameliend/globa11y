import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Entity {
  id: string;
  name: string;
  logo?: string;
  created_at: string;
  sites_count?: number;
  average_score?: number;
}

const EntitiesNew = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [open, setOpen] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*, sites(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const entitiesWithCount = data?.map((entity: any) => ({
        ...entity,
        sites_count: entity.sites?.length || 0,
      })) || [];

      setEntities(entitiesWithCount);
    } catch (error: any) {
      toast.error('Failed to fetch entities');
    }
  };

  const handleCreateEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim()) {
      toast.error('Please enter an entity name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entities')
        .insert([{ name: entityName, owner_id: user?.id }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Entity created successfully');
      setEntityName('');
      setOpen(false);
      fetchEntities();
    } catch (error: any) {
      toast.error('Failed to create entity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Entities</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Entity</DialogTitle>
              <DialogDescription>
                Add a new product or service to audit
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEntity} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entity-name">Entity Name</Label>
                <Input
                  id="entity-name"
                  placeholder="My Product"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  Create
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entities.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Entities Yet</CardTitle>
            <CardDescription>
              Create your first entity to start auditing accessibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Entity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <Card
              key={entity.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/entity/${entity.id}`)}
            >
              <CardHeader>
                <CardTitle>{entity.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Audited Sites: {entity.sites_count || 0}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntitiesNew;
