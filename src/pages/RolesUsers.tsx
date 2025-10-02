import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Trash2 } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'reader';
  email: string;
}

const RolesUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'editor' | 'reader'>('reader');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

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
      // This is a simplified version - in production, you'd need a backend function
      // to invite users and assign roles properly
      toast.info('User invitation feature requires backend implementation');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast.success('User removed successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error('Failed to remove user');
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
                    onClick={() => handleDeleteUser(usr.id)}
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
      </div>
    </div>
  );
};

export default RolesUsers;
