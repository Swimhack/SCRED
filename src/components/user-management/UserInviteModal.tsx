import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

interface Role {
  id: number;
  name: string;
}

interface UserInviteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  onInvite: (email: string, roleId: string) => Promise<void>;
  loading: boolean;
}

export const UserInviteModal = ({ isOpen, onOpenChange, roles, onInvite, loading }: UserInviteModalProps) => {
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");

  const handleSubmit = async () => {
    await onInvite(email, roleId);
    setEmail("");
    setRoleId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteRole">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
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
            onClick={handleSubmit}
            disabled={loading || !email || !roleId}
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};