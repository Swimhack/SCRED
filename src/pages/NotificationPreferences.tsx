import React from 'react';
import NotificationSettings from '@/components/NotificationSettings';
import SEO from '@/components/SEO';

const NotificationPreferences = () => {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <SEO 
        title="Notification Preferences - StreetCredRX"
        description="Manage your notification preferences and communication settings"
        canonicalPath="/notification-preferences"
      />
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </div>

        <NotificationSettings />
      </div>
    </div>
  );
};

export default NotificationPreferences;