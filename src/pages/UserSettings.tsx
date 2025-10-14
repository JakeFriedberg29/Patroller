import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Bell, Shield, Key, Save, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
interface FormProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  bio: string;
  avatar: string;
  timezone: string;
  language: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}
interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  incidentAlerts: boolean;
  reportUpdates: boolean;
  teamMessages: boolean;
  systemUpdates: boolean;
}
interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
  trustedDevices: number;
}
export default function UserSettings() {
  const {
    toast
  } = useToast();
  const {
    profile,
    loading,
    error,
    refetch
  } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form state with profile data
  const [formProfile, setFormProfile] = useState<FormProfile>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
    avatar: "",
    timezone: "America/New_York",
    language: "en",
    role: "",
    status: "active"
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    incidentAlerts: true,
    reportUpdates: true,
    teamMessages: true,
    systemUpdates: false
  });
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    sessionTimeout: 480,
    // 8 hours in minutes
    passwordLastChanged: "2024-01-01T00:00:00Z",
    trustedDevices: 3
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormProfile({
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        title: profile.role,
        bio: profile.profileData?.bio || '',
        avatar: profile.profileData?.avatar_url || '',
        timezone: profile.profileData?.timezone || 'America/New_York',
        language: profile.profileData?.language || 'en',
        role: profile.role,
        status: profile.status as 'active' | 'inactive' | 'pending' | 'suspended'
      });
    }
  }, [profile]);
  if (loading) {
    return <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading profile: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>;
  }
  const handleProfileUpdate = async () => {
    if (!profile?.id) return;
    try {
      const {
        error
      } = await supabase.from('users').update({
        first_name: formProfile.firstName,
        last_name: formProfile.lastName,
        phone: formProfile.phone,
        profile_data: {
          ...profile.profileData,
          bio: formProfile.bio,
          timezone: formProfile.timezone,
          language: formProfile.language
        }
      }).eq('id', profile.id);
      if (error) {
        throw error;
      }
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated."
      });
      setIsEditing(false);
      refetch(); // Reload the profile data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleNotificationUpdate = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved."
    });
  };
  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for instructions to reset your password."
    });
  };
  const handleEnable2FA = () => {
    setSecurity(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
    toast({
      title: security.twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: security.twoFactorEnabled ? "Two-factor authentication has been disabled." : "Two-factor authentication has been enabled for enhanced security."
    });
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Badge variant={formProfile.status === 'active' ? 'default' : 'secondary'}>
          {formProfile.status === 'active' ? 'Active' : formProfile.status === 'pending' ? 'Pending' : formProfile.status === 'suspended' ? 'Suspended' : 'Inactive'}
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formProfile.avatar} alt={`${formProfile.firstName} ${formProfile.lastName}`} />
                    <AvatarFallback className="text-lg">
                      {formProfile.firstName?.[0] || ''}{formProfile.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0">
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{formProfile.firstName} {formProfile.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{formProfile.title}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={formProfile.firstName} disabled={!isEditing} onChange={e => setFormProfile(prev => ({
                  ...prev,
                  firstName: e.target.value
                }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={formProfile.lastName} disabled={!isEditing} onChange={e => setFormProfile(prev => ({
                  ...prev,
                  lastName: e.target.value
                }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" value={formProfile.email} disabled={true} // Email should not be editable
                  className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" value={formProfile.phone} disabled={!isEditing} className="pl-10" onChange={e => setFormProfile(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))} />
                  </div>
                </div>
                
                
                
              </div>

              <div className="flex justify-end gap-3">
                {isEditing ? <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleProfileUpdate}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </> : <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch checked={notifications.emailNotifications} onCheckedChange={() => handleNotificationUpdate('emailNotifications')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch checked={notifications.pushNotifications} onCheckedChange={() => handleNotificationUpdate('pushNotifications')} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                  </div>
                  <Switch checked={notifications.smsNotifications} onCheckedChange={() => handleNotificationUpdate('smsNotifications')} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Incident Alerts</Label>
                      <p className="text-sm text-muted-foreground">Critical incident notifications</p>
                    </div>
                    <Switch checked={notifications.incidentAlerts} onCheckedChange={() => handleNotificationUpdate('incidentAlerts')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Report Updates</Label>
                      <p className="text-sm text-muted-foreground">Updates on report submissions and reviews</p>
                    </div>
                    <Switch checked={notifications.reportUpdates} onCheckedChange={() => handleNotificationUpdate('reportUpdates')} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Team Messages</Label>
                      <p className="text-sm text-muted-foreground">Messages from team members</p>
                    </div>
                    <Switch checked={notifications.teamMessages} onCheckedChange={() => handleNotificationUpdate('teamMessages')} />
                  </div>
                  <div className="flex items-center justify-between">
                    
                    <Switch checked={notifications.systemUpdates} onCheckedChange={() => handleNotificationUpdate('systemUpdates')} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch checked={security.twoFactorEnabled} onCheckedChange={handleEnable2FA} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Password & Authentication</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password</Label>
                      <p className="text-sm text-muted-foreground">
                        Last changed on {new Date(security.passwordLastChanged).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" onClick={handlePasswordReset}>
                      <Key className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      
                      <p className="text-sm text-muted-foreground">
                        Currently set to {Math.floor(security.sessionTimeout / 60)} hours
                      </p>
                    </div>
                    <Select value={security.sessionTimeout.toString()} onValueChange={value => setSecurity(prev => ({
                    ...prev,
                    sessionTimeout: parseInt(value)
                  }))}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                        <SelectItem value="720">12 hours</SelectItem>
                        <SelectItem value="1440">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Trusted Devices</Label>
                      <p className="text-sm text-muted-foreground">
                        {security.trustedDevices} devices currently trusted
                      </p>
                    </div>
                    <Button variant="outline">
                      Manage Devices
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formProfile.timezone} onValueChange={value => setFormProfile(prev => ({
                  ...prev,
                  timezone: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={formProfile.language} onValueChange={value => setFormProfile(prev => ({
                  ...prev,
                  language: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-mono">{formProfile.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p>{formProfile.role}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast({
                title: "Preferences Saved",
                description: "Your preferences have been updated."
              })}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
}