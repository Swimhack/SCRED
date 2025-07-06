import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserPlus, Mail, Shield, Eye, Search, RefreshCw, Edit, Trash2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SEO from "@/components/SEO";

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

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState<string>("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get profiles with roles and emails from profiles table
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

  const sendUserInvitation = async () => {
    if (!inviteEmail || !inviteRoleId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setInviteLoading(true);
      
      // Generate invitation token
      const token = crypto.randomUUID();
      
      // Create invitation record
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: inviteEmail,
          token,
          role_id: parseInt(inviteRoleId),
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (inviteError) throw inviteError;

      // Send invitation email
      const roleName = roles.find(r => r.id === parseInt(inviteRoleId))?.name;
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'user-invitation',
          to: inviteEmail,
          roleName,
          invitationToken: token,
          inviteLink: `${window.location.origin}/auth?invite=${token}`
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Invitation Sent",
        description: "User invitation has been sent successfully",
      });

      setInviteEmail("");
      setInviteRoleId("");
      setIsInviteDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
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

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditFirstName(user.first_name || "");
    setEditLastName(user.last_name || "");
    setIsEditDialogOpen(true);
  };

  const updateUserProfile = async () => {
    if (!editingUser) return;

    try {
      setEditLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFirstName,
          last_name: editLastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      // Log the activity
      await logUserActivity(editingUser.id, 'profile_update', {
        old_first_name: editingUser.first_name,
        old_last_name: editingUser.last_name,
        new_first_name: editFirstName,
        new_last_name: editLastName
      });

      toast({
        title: "User Updated",
        description: "User profile has been successfully updated",
      });

      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Failed to update user profile",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
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

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'destructive';
      case 'admin_regional':
      case 'admin_manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <SEO 
        title="User Management - StreetCredRX Admin"
        description="Manage users, roles, and permissions in the StreetCredRX system"
        canonicalPath="/user-management"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <div className="flex gap-3">
          <Button
            onClick={syncUserEmails}
            variant="outline"
            disabled={syncLoading}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
            Sync Emails
          </Button>
          <Button
            onClick={fetchUsers}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={sendUserInvitation}
                  disabled={inviteLoading}
                  className="w-full"
                >
                  {inviteLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={updateUserProfile}
                    disabled={editLoading}
                    className="flex-1"
                  >
                    {editLoading ? "Updating..." : "Update User"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>Find users by name, email, or role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : 'N/A'
                        }
                      </div>
                    </TableCell>
                    <TableCell>{user.email || 'No email'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.roles.name)}>
                        {user.roles.name.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={user.role_id.toString()}
                          onValueChange={(value) => {
                            const newRoleId = parseInt(value);
                            if (newRoleId !== user.role_id) {
                              updateUserRole(user.id, newRoleId, user.roles.name);
                            }
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name.replace('_', ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWelcomeEmail(user.id)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;