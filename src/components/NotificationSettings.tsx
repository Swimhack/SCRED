import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  Clock, 
  Shield,
  Phone,
  PhoneCall,
  Vibrate
} from 'lucide-react';

interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  email_frequency: string;
  developer_messages_email: boolean;
  system_alerts_email: boolean;
  application_updates_email: boolean;
  sms_enabled: boolean;
  phone_number: string | null;
  phone_verified: boolean;
  sms_critical_only: boolean;
  browser_notifications: boolean;
  push_subscription: any;
  sound_enabled: boolean;
  haptic_enabled: boolean;
  notification_sound: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  critical_channels: string[];
  high_channels: string[];
  normal_channels: string[];
  low_channels: string[];
  escalation_enabled: boolean;
  escalation_delay_minutes: number;
  escalation_recipient_id: string | null;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
    'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'
  ];

  const notificationSounds = [
    'default', 'chime', 'bell', 'alert', 'notification', 'ping', 'none'
  ];

  const channelOptions = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: MessageSquare },
    { value: 'push', label: 'Push', icon: Bell },
    { value: 'dashboard', label: 'Dashboard', icon: Smartphone }
  ];

  useEffect(() => {
    loadPreferences();
    requestNotificationPermission();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

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
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          email_notifications: true,
          email_frequency: 'immediate',
          developer_messages_email: true,
          system_alerts_email: true,
          application_updates_email: true,
          sms_enabled: false,
          phone_number: null,
          phone_verified: false,
          sms_critical_only: true,
          browser_notifications: true,
          push_subscription: null,
          sound_enabled: true,
          haptic_enabled: true,
          notification_sound: 'default',
          quiet_hours_enabled: false,
          quiet_hours_start: '22:00',
          quiet_hours_end: '08:00',
          timezone: 'UTC',
          critical_channels: ['email', 'sms', 'push'],
          high_channels: ['email', 'push'],
          normal_channels: ['email'],
          low_channels: ['dashboard'],
          escalation_enabled: false,
          escalation_delay_minutes: 30,
          escalation_recipient_id: null
        };

        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (createError) throw createError;
        setPreferences(newPrefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Register service worker and get push subscription
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          // We'll implement push subscription later
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    }
  };

  const savePreferences = async () => {
    if (!preferences || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification preferences saved successfully'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const verifyPhoneNumber = async () => {
    if (!preferences?.phone_number) return;

    setPhoneVerifying(true);
    try {
      // Call edge function to send SMS verification
      const { error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phoneNumber: preferences.phone_number }
      });

      if (error) throw error;

      toast({
        title: 'Verification Sent',
        description: 'Please check your phone for a verification code'
      });
    } catch (error) {
      console.error('Error sending verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification SMS',
        variant: 'destructive'
      });
    } finally {
      setPhoneVerifying(false);
    }
  };

  const updateChannelPreference = (priority: string, channels: string[]) => {
    if (!preferences) return;
    
    setPreferences({
      ...preferences,
      [`${priority}_channels`]: channels
    });
  };

  const ChannelSelector = ({ priority, channels }: { priority: string; channels: string[] }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium capitalize">{priority} Priority</Label>
      <div className="flex flex-wrap gap-2">
        {channelOptions.map(option => {
          const Icon = option.icon;
          const isSelected = channels.includes(option.value);
          
          return (
            <Badge
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer flex items-center gap-1"
              onClick={() => {
                const newChannels = isSelected
                  ? channels.filter(c => c !== option.value)
                  : [...channels, option.value];
                updateChannelPreference(priority, newChannels);
              }}
            >
              <Icon className="w-3 h-3" />
              {option.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  if (loading) {
    return <div className="animate-pulse h-96 bg-muted rounded-lg" />;
  }

  if (!preferences) {
    return <div>Failed to load preferences</div>;
  }

  return (
    <div className="space-y-6">
      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Enable email notifications</Label>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, email_notifications: checked })
              }
            />
          </div>

          {preferences.email_notifications && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-frequency">Email frequency</Label>
                <Select
                  value={preferences.email_frequency}
                  onValueChange={(value) => 
                    setPreferences({ ...preferences, email_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly digest</SelectItem>
                    <SelectItem value="daily">Daily digest</SelectItem>
                    <SelectItem value="weekly">Weekly digest</SelectItem>
                    <SelectItem value="off">Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dev-messages">Developer messages</Label>
                  <Switch
                    id="dev-messages"
                    checked={preferences.developer_messages_email}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, developer_messages_email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="system-alerts">System alerts</Label>
                  <Switch
                    id="system-alerts"
                    checked={preferences.system_alerts_email}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, system_alerts_email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="app-updates">Application updates</Label>
                  <Switch
                    id="app-updates"
                    checked={preferences.application_updates_email}
                    onCheckedChange={(checked) => 
                      setPreferences({ ...preferences, application_updates_email: checked })
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive critical notifications via SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-enabled">Enable SMS notifications</Label>
            <Switch
              id="sms-enabled"
              checked={preferences.sms_enabled}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, sms_enabled: checked })
              }
            />
          </div>

          {preferences.sms_enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone-number"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={preferences.phone_number || ''}
                    onChange={(e) => 
                      setPreferences({ ...preferences, phone_number: e.target.value })
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={verifyPhoneNumber}
                    disabled={!preferences.phone_number || phoneVerifying}
                    className="flex items-center gap-2"
                  >
                    {phoneVerifying ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    Verify
                  </Button>
                </div>
                {preferences.phone_verified && (
                  <p className="text-sm text-green-600">✓ Phone number verified</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sms-critical">Critical notifications only</Label>
                <Switch
                  id="sms-critical"
                  checked={preferences.sms_critical_only}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, sms_critical_only: checked })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Browser & Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Real-time notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="browser-notifications">Enable browser notifications</Label>
            <Switch
              id="browser-notifications"
              checked={preferences.browser_notifications}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, browser_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sound notifications</Label>
            <Switch
              id="sound-enabled"
              checked={preferences.sound_enabled}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, sound_enabled: checked })
              }
            />
          </div>

          {preferences.sound_enabled && (
            <div className="space-y-2">
              <Label htmlFor="notification-sound">Notification sound</Label>
              <Select
                value={preferences.notification_sound}
                onValueChange={(value) => 
                  setPreferences({ ...preferences, notification_sound: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationSounds.map(sound => (
                    <SelectItem key={sound} value={sound}>
                      {sound.charAt(0).toUpperCase() + sound.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="haptic-enabled">Haptic feedback (mobile)</Label>
            <Switch
              id="haptic-enabled"
              checked={preferences.haptic_enabled}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, haptic_enabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause non-critical notifications during specified hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Enable quiet hours</Label>
            <Switch
              id="quiet-hours"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, quiet_hours_enabled: checked })
              }
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-start">Start time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => 
                      setPreferences({ ...preferences, quiet_hours_start: e.target.value })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiet-end">End time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => 
                      setPreferences({ ...preferences, quiet_hours_end: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => 
                    setPreferences({ ...preferences, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Priority-Based Channel Routing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Priority-Based Routing
          </CardTitle>
          <CardDescription>
            Configure which channels receive notifications based on priority
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChannelSelector 
            priority="critical" 
            channels={preferences.critical_channels || []} 
          />
          <ChannelSelector 
            priority="high" 
            channels={preferences.high_channels || []} 
          />
          <ChannelSelector 
            priority="normal" 
            channels={preferences.normal_channels || []} 
          />
          <ChannelSelector 
            priority="low" 
            channels={preferences.low_channels || []} 
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;