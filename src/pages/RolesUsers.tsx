import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Pencil } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

interface UserRole {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'reader' | string;
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
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: UserRole | null;
  }>({ open: false, user: null });
  const [editRole, setEditRole] = useState<'owner' | 'editor' | 'reader'>('reader');
  const [editEntities, setEditEntities] = useState<string[]>([]);

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
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Create a map of user roles
      const rolesMap: Record<string, string> = {};
      rolesData?.forEach((role: any) => {
        rolesMap[role.user_id] = role.role;
      });

      // Combine profiles with roles
      const formattedUsers = profilesData?.map((profile: any) => ({
        id: profile.id,
        user_id: profile.id,
        role: rolesMap[profile.id] || 'No role assigned',
        email: profile.email,
      })) || [];

      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
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

      toast.success(data.message || 'User created successfully. Password reset email sent.');
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

  const toggleEditEntitySelection = (entityId: string) => {
    setEditEntities((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  };

  const handleOpenEditDialog = async (user: UserRole) => {
    try {
      // Fetch user's current role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user_id)
        .single();

      // Fetch user's entity permissions
      const { data: permissionsData } = await supabase
        .from('user_entity_permissions')
        .select('entity_id')
        .eq('user_id', user.user_id);

      setEditRole(roleData?.role || 'reader');
      setEditEntities(permissionsData?.map((p: any) => p.entity_id) || []);
      setEditDialog({ open: true, user });
    } catch (error: any) {
      toast.error('Failed to load user data');
    }
  };

  const handleUpdateUser = async () => {
    if (!editDialog.user) return;

    try {
      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: editRole })
        .eq('user_id', editDialog.user.user_id);

      if (roleError) throw roleError;

      // Delete existing permissions
      await supabase
        .from('user_entity_permissions')
        .delete()
        .eq('user_id', editDialog.user.user_id);

      // Insert new permissions
      if (editEntities.length > 0) {
        const { error: permError } = await supabase
          .from('user_entity_permissions')
          .insert(
            editEntities.map((entityId) => ({
              user_id: editDialog.user!.user_id,
              entity_id: entityId,
            }))
          );

        if (permError) throw permError;
      }

      toast.success('User updated successfully');
      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to update user');
    }
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
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditDialog(usr)}
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialog({ open: true, userId: usr.id })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
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
          <p className="text-sm font-medium">Password Setup</p>
          <p className="text-sm text-muted-foreground">New users will receive a password reset email to set up their own secure password.</p>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, userId: null })}
        onConfirm={handleDeleteUser}
        title="Delete User?"
        description="This will remove the user and all their permissions. This action cannot be undone."
      />

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, user: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the role and entity permissions for {editDialog.user?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(value: any) => setEditRole(value)}>
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

            <div className="space-y-2">
              <Label>Entity Permissions</Label>
              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                {entities.map((entity) => (
                  <div key={entity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${entity.id}`}
                      checked={editEntities.includes(entity.id)}
                      onCheckedChange={() => toggleEditEntitySelection(entity.id)}
                    />
                    <label
                      htmlFor={`edit-${entity.id}`}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RolesUsers;
