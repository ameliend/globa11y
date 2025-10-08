import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const MyAccount = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordResetMessage, setShowPasswordResetMessage] = useState(false);

  useEffect(() => {
    // Check if coming from password reset link
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'recovery') {
      setShowPasswordResetMessage(true);
    }
  }, [location]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password strength
      const validatedPassword = passwordSchema.parse(newPassword);
      
      const { error } = await supabase.auth.updateUser({
        password: validatedPassword,
      });

      if (error) throw error;
      
      toast.success('Password updated successfully');
      setNewPassword('');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      {showPasswordResetMessage && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Update your password
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 border-t pt-6">
            <h3 className="font-semibold">Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={12}
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>At least 12 characters</li>
                  <li>One uppercase and one lowercase letter</li>
                  <li>One number and one special character</li>
                </ul>
              </div>
            </div>
            <Button type="submit" disabled={loading || !newPassword}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAccount;
