import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Role {
  id: number;
  name: string;
}

export const useUserInvitation = (roles: Role[]) => {
  const [inviteLoading, setInviteLoading] = useState(false);

  const sendUserInvitation = async (email: string, roleId: string) => {
    if (!email || !roleId) {
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
          email,
          token,
          role_id: parseInt(roleId),
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (inviteError) throw inviteError;

      // Send invitation email
      const roleName = roles.find(r => r.id === parseInt(roleId))?.name;
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'user-invitation',
          to: email,
          roleName,
          invitationToken: token,
          inviteLink: `${window.location.protocol}//${window.location.host}/auth?invite=${token}`
        }
      });

      if (emailError) throw emailError;

      toast({
        title: "Invitation Sent",
        description: "User invitation has been sent successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
      return false;
    } finally {
      setInviteLoading(false);
    }
  };

  return {
    inviteLoading,
    sendUserInvitation,
  };
};