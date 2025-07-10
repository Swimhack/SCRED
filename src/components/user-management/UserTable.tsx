import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActionsMenu } from "./UserActionsMenu";

interface Role {
  id: number;
  name: string;
}

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

interface UserTableProps {
  users: User[];
  roles: Role[];
  onRoleChange: (userId: string, newRoleId: number, currentRoleName: string) => void;
  onEdit: (user: User) => void;
  onSendWelcomeEmail: (userId: string) => void;
}

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

export const UserTable = ({ users, roles, onRoleChange, onEdit, onSendWelcomeEmail }: UserTableProps) => {
  return (
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
        {users.map((user) => (
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
              <UserActionsMenu
                user={user}
                roles={roles}
                onRoleChange={onRoleChange}
                onEdit={onEdit}
                onSendWelcomeEmail={onSendWelcomeEmail}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};