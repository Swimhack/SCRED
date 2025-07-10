import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, RefreshCw, RotateCcw } from "lucide-react";
import SEO from "@/components/SEO";
import { UserInviteModal } from "@/components/user-management/UserInviteModal";
import { UserEditModal } from "@/components/user-management/UserEditModal";
import { UserSearchCard } from "@/components/user-management/UserSearchCard";
import { UserTable } from "@/components/user-management/UserTable";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useUserInvitation } from "@/hooks/useUserInvitation";

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

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const {
    users,
    roles,
    loading,
    syncLoading,
    fetchUsers,
    updateUserRole,
    sendWelcomeEmail,
    updateUserProfile,
    syncUserEmails,
  } = useUserManagement();

  const { inviteLoading, sendUserInvitation } = useUserInvitation(roles);

  const handleInviteUser = async (email: string, roleId: string) => {
    const success = await sendUserInvitation(email, roleId);
    if (success) {
      setIsInviteDialogOpen(false);
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (firstName: string, lastName: string) => {
    if (!editingUser) return;

    setEditLoading(true);
    try {
      await updateUserProfile(editingUser.id, firstName, lastName);
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } finally {
      setEditLoading(false);
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
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      <UserSearchCard 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <UserTable
              users={filteredUsers}
              roles={roles}
              onRoleChange={updateUserRole}
              onEdit={openEditDialog}
              onSendWelcomeEmail={sendWelcomeEmail}
            />
          )}
        </CardContent>
      </Card>

      <UserInviteModal
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        roles={roles}
        onInvite={handleInviteUser}
        loading={inviteLoading}
      />

      <UserEditModal
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={editingUser}
        onUpdate={handleUpdateUser}
        loading={editLoading}
      />
    </div>
  );
};

export default UserManagement;