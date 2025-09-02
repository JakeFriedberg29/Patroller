import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Filter,
  Send,
  Calendar,
  Building2,
  Users
} from "lucide-react";

const mockNotifications = [
  {
    id: "notif-001",
    title: "System Maintenance Scheduled",
    message: "Routine maintenance will be performed on January 20th from 2:00 AM to 4:00 AM EST.",
    type: "info",
    priority: "Medium",
    status: "Active",
    organization: "All Organizations",
    createdBy: "Platform Admin",
    createdDate: "2024-01-15T09:00:00Z",
    expiryDate: "2024-01-20T06:00:00Z",
    readCount: 234,
    totalRecipients: 2847
  },
  {
    id: "notif-002",
    title: "Security Alert: Failed Login Attempts",
    message: "Multiple failed login attempts detected from MegaCorp Energy division. Please review security protocols.",
    type: "warning",
    priority: "High", 
    status: "Active",
    organization: "MegaCorp Energy",
    createdBy: "Security System",
    createdDate: "2024-01-15T11:30:00Z",
    expiryDate: "2024-01-16T11:30:00Z",
    readCount: 45,
    totalRecipients: 334
  },
  {
    id: "notif-003",
    title: "Incident Response Training Reminder",
    message: "Annual incident response training is due for all personnel. Please complete before January 31st.",
    type: "info",
    priority: "Low",
    status: "Active",
    organization: "All Organizations",
    createdBy: "Training Department",
    createdDate: "2024-01-14T08:00:00Z",
    expiryDate: "2024-01-31T23:59:00Z",
    readCount: 156,
    totalRecipients: 2847
  },
  {
    id: "notif-004",
    title: "Emergency Response Protocol Updated",
    message: "New emergency response protocols have been implemented. Please review the updated procedures in your dashboard.",
    type: "success",
    priority: "High",
    status: "Delivered",
    organization: "MegaCorp Manufacturing",
    createdBy: "Safety Coordinator",
    createdDate: "2024-01-13T14:20:00Z",
    expiryDate: "2024-01-20T14:20:00Z",
    readCount: 456,
    totalRecipients: 456
  },
  {
    id: "notif-005",
    title: "Network Connectivity Issues",
    message: "Intermittent network connectivity issues reported in Houston facility. IT team is investigating.",
    type: "error",
    priority: "High",
    status: "Active",
    organization: "MegaCorp Energy",
    createdBy: "IT Operations",
    createdDate: "2024-01-15T13:45:00Z",
    expiryDate: "2024-01-16T13:45:00Z",
    readCount: 78,
    totalRecipients: 334
  }
];

const mockTemplates = [
  {
    id: "template-001",
    name: "Incident Alert",
    description: "Template for incident notifications",
    category: "Emergency",
    lastUsed: "2024-01-15T10:00:00Z",
    usageCount: 45
  },
  {
    id: "template-002", 
    name: "System Maintenance",
    description: "Template for maintenance notifications",
    category: "System",
    lastUsed: "2024-01-14T09:30:00Z",
    usageCount: 23
  },
  {
    id: "template-003",
    name: "Training Reminder",
    description: "Template for training reminders",
    category: "Training",
    lastUsed: "2024-01-13T14:15:00Z",
    usageCount: 67
  }
];

export default function EnterpriseNotificationCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState("10");

  const filteredNotifications = mockNotifications.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || notif.type === typeFilter;
    const matchesStatus = statusFilter === "all" || notif.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === "all" || notif.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'success': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'destructive';
      case 'success': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getReadPercentage = (readCount: number, totalRecipients: number) => {
    return Math.round((readCount / totalRecipients) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notification Center
          </h1>
          <p className="text-muted-foreground">Manage enterprise-wide notifications and alerts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Notification
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Notifications</CardTitle>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
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
                        <div className={`p-2 rounded-lg ${
                          notif.type === 'error' ? 'bg-destructive/10 text-destructive' :
                          notif.type === 'warning' ? 'bg-destructive/10 text-destructive' :
                          notif.type === 'success' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getTypeIcon(notif.type)}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{notif.title}</h3>
                            <Badge variant={getTypeVariant(notif.type)}>
                              {notif.type}
                            </Badge>
                            <Badge variant={getPriorityVariant(notif.priority)}>
                              {notif.priority} Priority
                            </Badge>
                            <Badge variant={notif.status === 'Active' ? 'default' : 'secondary'}>
                              {notif.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {notif.organization}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {notif.readCount}/{notif.totalRecipients} read ({getReadPercentage(notif.readCount, notif.totalRecipients)}%)
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(notif.createdDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          Resend
                        </Button>
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${getReadPercentage(notif.readCount, notif.totalRecipients)}%` }}
                      />
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

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notification Templates</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Used {template.usageCount} times</span>
                          <span>Last used: {new Date(template.lastUsed).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Edit
                          </Button>
                          <Button size="sm" className="flex-1">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Default Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Auto-expire notifications</div>
                        <div className="text-sm text-muted-foreground">Automatically expire notifications after 7 days</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Read receipts</div>
                        <div className="text-sm text-muted-foreground">Track when notifications are read</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Email notifications</div>
                        <div className="text-sm text-muted-foreground">Send notifications via email</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">SMS notifications</div>
                        <div className="text-sm text-muted-foreground">Send critical notifications via SMS</div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}