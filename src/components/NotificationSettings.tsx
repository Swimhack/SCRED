import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, Bell, Mail } from 'lucide-react';

interface NotificationPreferences {
  email_notifications: boolean;
  email_frequency: string;
  browser_notifications: boolean;
  developer_messages_email: boolean;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    email_frequency: 'immediate',
    browser_notifications: true,
    developer_messages_email: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          email_frequency: data.email_frequency,
          browser_notifications: data.browser_notifications,
          developer_messages_email: data.developer_messages_email,
        });
      }
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your notification preferences have been updated'
      });
    } catch (error: any) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading notification settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about developer messages and system updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={preferences.email_notifications}
              onCheckedChange={(value) => updatePreference('email_notifications', value)}
            />
          </div>

          {preferences.email_notifications && (
            <div className="ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-frequency" className="text-sm">
                  Email Frequency
                </Label>
                <Select 
                  value={preferences.email_frequency}
                  onValueChange={(value) => updatePreference('email_frequency', value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Developer Messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Get emails for new developer messages
                  </p>
                </div>
                <Switch
                  checked={preferences.developer_messages_email}
                  onCheckedChange={(value) => updatePreference('developer_messages_email', value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Browser Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Browser Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Show browser notifications for real-time updates
            </p>
          </div>
          <Switch
            checked={preferences.browser_notifications}
            onCheckedChange={(value) => updatePreference('browser_notifications', value)}
          />
        </div>

        <Button onClick={savePreferences} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;