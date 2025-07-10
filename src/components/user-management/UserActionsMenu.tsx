import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Mail } from "lucide-react";

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

interface UserActionsMenuProps {
  user: User;
  roles: Role[];
  onRoleChange: (userId: string, newRoleId: number, currentRoleName: string) => void;
  onEdit: (user: User) => void;
  onSendWelcomeEmail: (userId: string) => void;
}

export const UserActionsMenu = ({ 
  user, 
  roles, 
  onRoleChange, 
  onEdit, 
  onSendWelcomeEmail 
}: UserActionsMenuProps) => {
  return (
    <div className="flex gap-2">
      <Select
        value={user.role_id.toString()}
        onValueChange={(value) => {
          const newRoleId = parseInt(value);
          if (newRoleId !== user.role_id) {
            onRoleChange(user.id, newRoleId, user.roles.name);
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
        onClick={() => onEdit(user)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSendWelcomeEmail(user.id)}
      >
        <Mail className="w-4 h-4" />
      </Button>
    </div>
  );
};