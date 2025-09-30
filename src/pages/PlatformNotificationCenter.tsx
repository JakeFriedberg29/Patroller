import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Search, Eye, Mail, Filter, Calendar, Building2, Users, Shield, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
const mockActivationNotifications = [{
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

Welcome to Patroller Console Administration!

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
Patroller Console Team

---
This is an automated message. Please do not reply to this email.`
}];
export default function PlatformNotificationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Removed type filter (always show all)
  const [rowsPerPage, setRowsPerPage] = useState("10");
  const [notifications, setNotifications] = useState(mockActivationNotifications);
  const [selectedNotification, setSelectedNotification] = useState<typeof mockActivationNotifications[0] | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || notif.recipient.toLowerCase().includes(searchTerm.toLowerCase()) || notif.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || notif.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleToggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? {
      ...notif,
      isEnabled: !notif.isEnabled,
      status: !notif.isEnabled ? 'Active' : 'Disabled'
    } : notif));
    const notification = notifications.find(n => n.id === id);
    toast({
      title: `Notification ${!notification?.isEnabled ? 'Enabled' : 'Disabled'}`,
      description: `Activation email notifications have been ${!notification?.isEnabled ? 'enabled' : 'disabled'} for ${notification?.recipientType}s.`
    });
  };
  const handleViewNotification = (notification: typeof mockActivationNotifications[0]) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
  };
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'disabled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  const getRecipientTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'platform admin':
        return <Shield className="h-4 w-4" />;
      case 'enterprise admin':
        return <Building2 className="h-4 w-4" />;
      case 'organization admin':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Platform Notification Center
          </h1>
          <p className="text-muted-foreground">Manage platform-level notifications</p>
        </div>
        
      </div>
      <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by recipient, organization, or title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
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
            </div>
          </div>

          {/* Table */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/40 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Notification</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Last Sent</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.length > 0 ? filteredNotifications.slice(0, parseInt(rowsPerPage)).map(notif => <TableRow key={notif.id} className="even:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-primary/10 text-primary">
                              {getRecipientTypeIcon(notif.recipientType)}
                            </div>
                            <div>
                              <div className="font-medium">{notif.title}</div>
                              <div className="text-xs text-muted-foreground">{notif.recipientType}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch checked={notif.isEnabled} onCheckedChange={() => handleToggleNotification(notif.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(notif.lastSent)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewNotification(notif)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Email
                          </Button>
                        </TableCell>
                      </TableRow>) : <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No notifications found matching your search criteria.
                      </TableCell>
                    </TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
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
              <span className="text-sm text-muted-foreground">entries</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(parseInt(rowsPerPage), filteredNotifications.length)} of {filteredNotifications.length} results
            </div>
          </div>
      </div>

      {/* View Email Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Template - {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedNotification && <div className="space-y-4">
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
                <Textarea id="email-content" value={selectedNotification.emailTemplate} readOnly className="min-h-96 mt-2 font-mono text-sm" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
              // Handle edit functionality
              toast({
                title: "Edit Feature",
                description: "Email template editing will be available in a future update."
              });
            }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Template
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}