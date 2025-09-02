import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Bell, 
  Search, 
  Plus, 
  Eye,
  Settings,
  Mail,
  Filter,
  Calendar,
  Building2,
  Users,
  Shield,
  Edit
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const mockActivationNotifications = [
  {
    id: "activation-001",
    title: "New Platform Admin Account Activation",
    type: "activation_email",
    recipientType: "Platform Admin",
    recipient: "john.doe@platform.com",
    accountType: "Platform Admin",
    organizationName: "Platform Administration",
    isEnabled: true,
    status: "Active",
    createdDate: "2024-01-15T09:00:00Z",
    lastSent: "2024-01-15T09:05:00Z",
    emailTemplate: `Dear [RECIPIENT_NAME],

Welcome to MissionLog Platform Administration!

Your Platform Administrator account has been created and is ready for activation.

Account Details:
- Email: [RECIPIENT_EMAIL]
- Role: Platform Administrator
- Access Level: Full Platform Access

To activate your account, please click the link below:
[ACTIVATION_LINK]

This link will expire in 24 hours for security purposes.

As a Platform Administrator, you will have access to:
- All account management functions
- System-wide settings and configurations
- User management across all organizations
- Platform analytics and reporting
- Security and compliance monitoring

If you have any questions or need assistance, please contact our support team.

Best regards,
MissionLog Platform Team

---
This is an automated message. Please do not reply to this email.`
  },
  {
    id: "activation-002", 
    title: "Enterprise Admin Account Activation",
    type: "activation_email",
    recipientType: "Enterprise Admin",
    recipient: "sarah.wilson@megacorp.com",
    accountType: "Enterprise Admin",
    organizationName: "MegaCorp Industries",
    isEnabled: true,
    status: "Sent",
    createdDate: "2024-01-14T14:30:00Z",
    lastSent: "2024-01-14T14:35:00Z",
    emailTemplate: `Dear [RECIPIENT_NAME],

Welcome to MissionLog!

Your Enterprise Administrator account for [ORGANIZATION_NAME] has been created and is ready for activation.

Account Details:
- Email: [RECIPIENT_EMAIL]
- Role: Enterprise Administrator
- Organization: [ORGANIZATION_NAME]
- Access Level: Enterprise Management

To activate your account, please click the link below:
[ACTIVATION_LINK]

This link will expire in 24 hours for security purposes.

As an Enterprise Administrator, you will have access to:
- Management of all organizations within your enterprise
- User management for your enterprise
- Enterprise-wide analytics and reporting
- Organization settings and configurations
- Incident management and coordination

If you have any questions or need assistance, please contact our support team.

Best regards,
MissionLog Platform Team

---
This is an automated message. Please do not reply to this email.`
  },
  {
    id: "activation-003",
    title: "Organization Admin Account Activation", 
    type: "activation_email",
    recipientType: "Organization Admin",
    recipient: "mike.johnson@cityrescue.org",
    accountType: "Organization Admin",
    organizationName: "City Emergency Services",
    isEnabled: false,
    status: "Disabled",
    createdDate: "2024-01-13T11:20:00Z",
    lastSent: null,
    emailTemplate: `Dear [RECIPIENT_NAME],

Welcome to MissionLog!

Your Organization Administrator account for [ORGANIZATION_NAME] has been created and is ready for activation.

Account Details:
- Email: [RECIPIENT_EMAIL]
- Role: Organization Administrator
- Organization: [ORGANIZATION_NAME]
- Access Level: Organization Management

To activate your account, please click the link below:
[ACTIVATION_LINK]

This link will expire in 24 hours for security purposes.

As an Organization Administrator, you will have access to:
- Team and user management for your organization
- Incident reporting and management
- Equipment and location tracking
- Organization analytics and reporting
- Settings and configuration management

If you have any questions or need assistance, please contact our support team.

Best regards,
MissionLog Platform Team

---
This is an automated message. Please do not reply to this email.`
  }
];

export default function PlatformNotificationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [recipientTypeFilter, setRecipientTypeFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [notifications, setNotifications] = useState(mockActivationNotifications);
  const [selectedNotification, setSelectedNotification] = useState<typeof mockActivationNotifications[0] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || notif.status.toLowerCase() === statusFilter;
    const matchesRecipientType = recipientTypeFilter === "all" || notif.recipientType.toLowerCase() === recipientTypeFilter.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesRecipientType;
  });

  const handleToggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id 
        ? { 
            ...notif, 
            isEnabled: !notif.isEnabled,
            status: !notif.isEnabled ? 'Active' : 'Disabled'
          }
        : notif
    ));
    
    const notification = notifications.find(n => n.id === id);
    toast({
      title: `Notification ${!notification?.isEnabled ? 'Enabled' : 'Disabled'}`,
      description: `Activation email notifications have been ${!notification?.isEnabled ? 'enabled' : 'disabled'} for ${notification?.recipientType}s.`,
    });
  };

  const handleViewNotification = (notification: typeof mockActivationNotifications[0]) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'sent': return 'secondary';
      case 'disabled': return 'destructive';
      default: return 'outline';
    }
  };

  const getRecipientTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'platform admin': return <Shield className="h-4 w-4" />;
      case 'enterprise admin': return <Building2 className="h-4 w-4" />;
      case 'organization admin': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Platform Notification Center
          </h1>
          <p className="text-muted-foreground">Manage platform-wide notification settings and activation emails</p>
        </div>
      </div>

      <Tabs defaultValue="activation-emails" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activation-emails">Activation Emails</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="activation-emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Account Activation Email Notifications
              </CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by recipient, organization, or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={recipientTypeFilter} onValueChange={setRecipientTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Recipient Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="platform admin">Platform Admin</SelectItem>
                      <SelectItem value="enterprise admin">Enterprise Admin</SelectItem>
                      <SelectItem value="organization admin">Organization Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.slice(0, parseInt(rowsPerPage)).map((notif) => (
                  <div key={notif.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notif.title}</h3>
                            <Badge variant={getStatusVariant(notif.status)}>
                              {notif.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getRecipientTypeIcon(notif.recipientType)}
                              <Badge variant="outline">
                                {notif.recipientType}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {notif.recipient}
                            </div>
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {notif.organizationName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created: {formatDate(notif.createdDate)}
                            </div>
                            {notif.lastSent && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last sent: {formatDate(notif.lastSent)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`toggle-${notif.id}`} className="text-sm">
                            {notif.isEnabled ? 'Enabled' : 'Disabled'}
                          </Label>
                          <Switch
                            id={`toggle-${notif.id}`}
                            checked={notif.isEnabled}
                            onCheckedChange={() => handleToggleNotification(notif.id)}
                          />
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewNotification(notif)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Email
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select value={rowsPerPage} onValueChange={setRowsPerPage}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">
                    of {filteredNotifications.length} notifications
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Showing {Math.min(parseInt(rowsPerPage), filteredNotifications.length)} of {filteredNotifications.length} results
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Global Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-4">Activation Email Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Auto-send activation emails</div>
                        <div className="text-sm text-muted-foreground">Automatically send activation emails when accounts are created</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Email expiration time</div>
                        <div className="text-sm text-muted-foreground">Time before activation links expire (24 hours)</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Resend reminder emails</div>
                        <div className="text-sm text-muted-foreground">Send reminder emails for unactivated accounts after 48 hours</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">Email Delivery Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Delivery tracking</div>
                        <div className="text-sm text-muted-foreground">Track email delivery status and opens</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Failed delivery alerts</div>
                        <div className="text-sm text-muted-foreground">Alert admins when activation emails fail to deliver</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Security Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Require email verification</div>
                        <div className="text-sm text-muted-foreground">Require users to verify their email before account activation</div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Rate limiting</div>
                        <div className="text-sm text-muted-foreground">Limit activation email requests per user (3 per hour)</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Email Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Template - {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-sm">
                <div>
                  <span className="font-medium">Recipient Type:</span> {selectedNotification.recipientType}
                </div>
                <div>
                  <span className="font-medium">Organization:</span> {selectedNotification.organizationName}
                </div>
                <div>
                  <span className="font-medium">Status:</span> 
                  <Badge variant={getStatusVariant(selectedNotification.status)} className="ml-2">
                    {selectedNotification.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Enabled:</span> {selectedNotification.isEnabled ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <Label htmlFor="email-content">Email Content</Label>
                <Textarea
                  id="email-content"
                  value={selectedNotification.emailTemplate}
                  readOnly
                  className="min-h-96 mt-2 font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  // Handle edit functionality
                  toast({
                    title: "Edit Feature",
                    description: "Email template editing will be available in a future update.",
                  });
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}