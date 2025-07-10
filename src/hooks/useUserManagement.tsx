import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  created_at: string;
  role_id: number;
  roles: {
    name: string;
  };
}

interface Role {
  id: number;
  name: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          created_at,
          role_id,
          roles (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setUsers(profilesData || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('id');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRoleId: number, currentRoleName: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: newRoleId })
        .eq('id', userId);

      if (error) throw error;

      // Log the activity
      await logUserActivity(userId, 'role_change', {
        from_role: currentRoleName,
        to_role: roles.find(r => r.id === newRoleId)?.name
      });

      // Send notification email
      await sendRoleChangeNotification(userId, newRoleId);

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated",
      });

      // Refresh users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const sendRoleChangeNotification = async (userId: string, newRoleId: number) => {
    try {
      const user = users.find(u => u.id === userId);
      const newRole = roles.find(r => r.id === newRoleId);
      
      if (user && newRole) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'role-change',
            to: user.email,
            firstName: user.first_name,
            newRole: newRole.name
          }
        });
      }
    } catch (error) {
      console.error('Error sending role change notification:', error);
    }
  };

  const logUserActivity = async (userId: string, action: string, details: any) => {
    try {
      await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action,
          details,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const sendWelcomeEmail = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'welcome',
            to: user.email,
            firstName: user.first_name
          }
        });

        toast({
          title: "Welcome Email Sent",
          description: "Welcome email has been sent to the user",
        });
      }
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      toast({
        title: "Error",
        description: "Failed to send welcome email",
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (userId: string, firstName: string, lastName: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Log the activity
      await logUserActivity(userId, 'profile_update', {
        old_first_name: user.first_name,
        old_last_name: user.last_name,
        new_first_name: firstName,
        new_last_name: lastName
      });

      toast({
        title: "User Updated",
        description: "User profile has been successfully updated",
      });

      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive",
      });
    }
  };

  const syncUserEmails = async () => {
    try {
      setSyncLoading(true);
      
      const { data, error } = await supabase.functions.invoke('sync-user-emails');
      
      if (error) throw error;
      
      toast({
        title: "Emails Synced",
        description: data.message || "User emails have been synchronized",
      });
      
      // Refresh users list to show updated emails
      fetchUsers();
    } catch (error: any) {
      console.error('Error syncing emails:', error);
      toast({
        title: "Error",
        description: "Failed to sync user emails",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return {
    users,
    roles,
    loading,
    syncLoading,
    fetchUsers,
    updateUserRole,
    sendWelcomeEmail,
    updateUserProfile,
    syncUserEmails,
  };
};