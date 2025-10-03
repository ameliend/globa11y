import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

interface UserRole {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'reader';
  email: string;
}

interface Entity {
  id: string;
  name: string;
}

const RolesUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'editor' | 'reader'>('reader');
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });

  useEffect(() => {
    fetchUsers();
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setEntities(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch entities');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          profiles!inner(email)
        `);

      if (error) throw error;

      const formattedUsers = data?.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        role: item.role,
        email: item.profiles?.email || 'Unknown',
      })) || [];

      setUsers(formattedUsers);
    } catch (error: any) {
      toast.error('Failed to fetch users');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserEmail,
          role: newUserRole,
          entityIds: selectedEntities,
        },
      });

      if (error) throw error;

      toast.success('User created successfully with default password: intracanal+');
      setNewUserEmail('');
      setNewUserRole('reader');
      setSelectedEntities([]);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.userId) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', deleteDialog.userId);

      if (error) throw error;

      toast.success('User removed successfully');
      setDeleteDialog({ open: false, userId: null });
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to remove user');
    }
  };

  const toggleEntitySelection = (entityId: string) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Roles & Users</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role">Role</Label>
                <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reader">Reader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Entity Permissions</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {entities.map((entity) => (
                  <div key={entity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={entity.id}
                      checked={selectedEntities.includes(entity.id)}
                      onCheckedChange={() => toggleEntitySelection(entity.id)}
                    />
                    <label
                      htmlFor={entity.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {entity.name}
                    </label>
                  </div>
                ))}
                {entities.length === 0 && (
                  <p className="text-sm text-muted-foreground">No entities available</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((usr) => (
              <div
                key={usr.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{usr.email}</p>
                  <p className="text-sm text-muted-foreground capitalize">{usr.role}</p>
                </div>
                {usr.user_id !== user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, userId: usr.id })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Role Descriptions:</h3>
        <ul className="space-y-2 text-sm">
          <li><strong>Owner:</strong> Full access - can add/remove users, manage all entities and reports</li>
          <li><strong>Editor:</strong> Can edit site information and reports, but cannot manage users</li>
          <li><strong>Reader:</strong> Read-only access to view reports and results</li>
        </ul>
        <div className="mt-4 p-3 bg-background border border-border rounded">
          <p className="text-sm font-medium">Default Password</p>
          <p className="text-sm text-muted-foreground">All new users are created with password: <code className="font-mono bg-muted px-1">intracanal+</code></p>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, userId: null })}
        onConfirm={handleDeleteUser}
        title="Delete User?"
        description="This will remove the user and all their permissions. This action cannot be undone."
      />
    </div>
  );
};

export default RolesUsers;
