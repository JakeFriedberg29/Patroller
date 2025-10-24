import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Info, AlertTriangle, ChevronDown, User, Settings, LogOut, HelpCircle, Calendar, Shield, MoreHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarProvider } from "@/components/ui/sidebar";
import { Home, FileText, BarChart3, Users as UsersIcon, Mail, Phone } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Copy, Check } from "lucide-react";
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterSelect, FilterBadge } from "@/components/filters/FilterSelect";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import { DualListBox, DualListBoxItem } from "@/components/ui/dual-list-box";

export default function Styleguide() {
  const [copied, setCopied] = useState(false);
  
  // Filter demo state
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const filterConfigs = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ]
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]
    }
  ];
  
  const handleClearAllFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
  };

  // Dual List Box demo state
  const allUsers: DualListBoxItem[] = [
    { value: "1", label: "John Doe" },
    { value: "2", label: "Jane Smith" },
    { value: "3", label: "Bob Johnson" },
    { value: "4", label: "Alice Brown" },
    { value: "5", label: "Charlie Wilson" },
    { value: "6", label: "Eva Martinez" },
    { value: "7", label: "David Lee" },
    { value: "8", label: "Sarah Taylor" },
  ];

  const [selectedUsers, setSelectedUsers] = useState<DualListBoxItem[]>([
    { value: "1", label: "John Doe" },
    { value: "4", label: "Alice Brown" },
  ]);

  const availableUsers = allUsers.filter(
    user => !selectedUsers.find(selected => selected.value === user.value)
  );

  const handleCopyExport = async () => {
    const exportText = `# Design System Export - Patroller Console

## 1. Install Required Dependencies

\`\`\`bash
npm install lucide-react sonner @radix-ui/react-separator @radix-ui/react-tooltip @radix-ui/react-progress
\`\`\`

## 2. Install shadcn/ui Components

\`\`\`bash
npx shadcn@latest add button input label card badge switch checkbox radio-group select separator alert dialog dropdown-menu popover tabs tooltip textarea skeleton progress avatar accordion sidebar table toast
\`\`\`

## 3. Add Design Tokens to src/index.css

\`\`\`css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Patroller Console Design System - Emergency Response Platform
   All colors MUST be HSL for proper theming
*/

@layer base {
  :root {
    /* Core Backgrounds */
    --background: 250 50% 98%;
    --foreground: 215 25% 15%;

    /* Card System */
    --card: 0 0% 100%;
    --card-foreground: 215 25% 15%;

    /* Interactive Elements */
    --popover: 0 0% 100%;
    --popover-foreground: 215 25% 15%;

    /* Patroller Console Brand Colors */
    --primary: 217 91% 45%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 217 91% 55%;

    /* Status & Alert System */
    --critical: 0 84% 60%;
    --critical-foreground: 0 0% 100%;
    --critical-bg: 0 84% 97%;

    --warning: 35 91% 65%;
    --warning-foreground: 0 0% 100%;
    --warning-bg: 35 91% 97%;

    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;
    --success-bg: 142 76% 97%;

    --info: 217 91% 60%;
    --info-foreground: 0 0% 100%;
    --info-bg: 217 91% 97%;

    /* Neutral System */
    --secondary: 215 15% 95%;
    --secondary-foreground: 215 25% 25%;

    --muted: 215 15% 96%;
    --muted-foreground: 215 13% 45%;

    --accent: 217 91% 97%;
    --accent-foreground: 217 91% 35%;

    /* Semantic Colors */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Form Elements */
    --border: 215 20% 90%;
    --input: 215 20% 95%;
    --ring: 217 91% 60%;

    --radius: 0.5rem;

    /* Sidebar System */
    --sidebar-background: 215 30% 7%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 217 91% 60%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 215 30% 12%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 215 30% 15%;
    --sidebar-ring: 217 91% 60%;

    /* Typography Scale */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;

    /* Spacing Scale */
    --space-tight: 0.25rem;
    --space-normal: 0.5rem;
    --space-comfortable: 1rem;
    --space-spacious: 1.5rem;

    /* Shadows */
    --shadow-subtle: 0 1px 2px 0 hsl(215 25% 15% / 0.05);
    --shadow-soft: 0 1px 3px 0 hsl(215 25% 15% / 0.1), 0 1px 2px -1px hsl(215 25% 15% / 0.1);
    --shadow-medium: 0 4px 6px -1px hsl(215 25% 15% / 0.1), 0 2px 4px -2px hsl(215 25% 15% / 0.1);
    --shadow-strong: 0 10px 15px -3px hsl(215 25% 15% / 0.1), 0 4px 6px -4px hsl(215 25% 15% / 0.1);

    /* Animation Timing */
    --duration-fast: 0.15s;
    --duration-normal: 0.2s;
    --duration-slow: 0.3s;
  }

  .dark {
    /* Core Backgrounds */
    --background: 215 30% 7%;
    --foreground: 215 15% 95%;

    /* Card System */
    --card: 215 30% 9%;
    --card-foreground: 215 15% 95%;

    /* Interactive Elements */
    --popover: 215 30% 9%;
    --popover-foreground: 215 15% 95%;

    /* Patroller Console Brand Colors */
    --primary: 217 91% 65%;
    --primary-foreground: 0 0% 100%;
    --primary-hover: 217 91% 60%;

    /* Status & Alert System - Dark Mode */
    --critical: 0 84% 65%;
    --critical-foreground: 0 0% 100%;
    --critical-bg: 0 84% 10%;

    --warning: 35 91% 70%;
    --warning-foreground: 0 0% 100%;
    --warning-bg: 35 91% 10%;

    --success: 142 76% 45%;
    --success-foreground: 0 0% 100%;
    --success-bg: 142 76% 10%;

    --info: 217 91% 65%;
    --info-foreground: 0 0% 100%;
    --info-bg: 217 91% 10%;

    /* Neutral System */
    --secondary: 215 30% 15%;
    --secondary-foreground: 215 15% 85%;

    --muted: 215 30% 12%;
    --muted-foreground: 215 15% 60%;

    --accent: 215 30% 15%;
    --accent-foreground: 217 91% 70%;

    /* Semantic Colors */
    --destructive: 0 84% 65%;
    --destructive-foreground: 0 0% 100%;

    /* Form Elements */
    --border: 215 30% 20%;
    --input: 215 30% 15%;
    --ring: 217 91% 65%;

    /* Sidebar System - Dark Mode */
    --sidebar-background: 215 35% 5%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 217 91% 65%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 215 35% 8%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 215 35% 12%;
    --sidebar-ring: 217 91% 65%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
\`\`\`

## 4. Update tailwind.config.ts

\`\`\`typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        critical: {
          DEFAULT: "hsl(var(--critical))",
          foreground: "hsl(var(--critical-foreground))",
          bg: "hsl(var(--critical-bg))"
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          bg: "hsl(var(--warning-bg))"
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          bg: "hsl(var(--success-bg))"
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          bg: "hsl(var(--info-bg))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
\`\`\`

## 5. Component Usage Examples

### Buttons
\`\`\`tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
\`\`\`

### Badges
\`\`\`tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
\`\`\`

### Alerts
\`\`\`tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

// Info Alert
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Info</AlertTitle>
  <AlertDescription>This is an informational alert message.</AlertDescription>
</Alert>

// Success Alert
<Alert className="border-success text-success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Your changes have been saved.</AlertDescription>
</Alert>

// Warning Alert
<Alert className="border-warning text-warning">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Warning</AlertTitle>
  <AlertDescription>Please review carefully.</AlertDescription>
</Alert>

// Error Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
\`\`\`

### Cards
\`\`\`tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>

// With variants
<Card className="border-primary">...</Card>
<Card className="bg-muted">...</Card>
\`\`\`

### Form Elements
\`\`\`tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="email@example.com" />
</div>

// Textarea
<div className="space-y-2">
  <Label htmlFor="message">Message</Label>
  <Textarea id="message" placeholder="Enter text..." />
</div>

// Select
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>

// Switch
<div className="flex items-center space-x-2">
  <Switch id="switch" />
  <Label htmlFor="switch">Enable feature</Label>
</div>

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox id="check" />
  <Label htmlFor="check">Accept terms</Label>
</div>

// Radio Group
<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>
\`\`\`

### Dialog / Modal
\`\`\`tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
\`\`\`

### Dropdown Menu
\`\`\`tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>
      <User className="mr-2 h-4 w-4" />
      Profile
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive">
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
\`\`\`

### Popover
\`\`\`tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-2">
      <h4 className="font-medium">Dimensions</h4>
      <div className="grid gap-2">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="width">Width</Label>
          <Input id="width" defaultValue="100%" className="col-span-2" />
        </div>
      </div>
    </div>
  </PopoverContent>
</Popover>
\`\`\`

### Tooltip
\`\`\`tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Helpful tooltip text</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
\`\`\`

### Toast Notifications
\`\`\`tsx
import { toast } from "sonner";

// Success
toast.success("Success!", { description: "Changes saved." });

// Error
toast.error("Error!", { description: "Something went wrong." });

// Info
toast.info("Info", { description: "Informational message." });
\`\`\`

### Tabs
\`\`\`tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Account</TabsTrigger>
    <TabsTrigger value="tab2">Password</TabsTrigger>
    <TabsTrigger value="tab3">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Account content</TabsContent>
  <TabsContent value="tab2">Password content</TabsContent>
  <TabsContent value="tab3">Settings content</TabsContent>
</Tabs>
\`\`\`

### Accordion
\`\`\`tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles.
    </AccordionContent>
  </AccordionItem>
</Accordion>
\`\`\`

### Sidebar Navigation
\`\`\`tsx
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, SidebarProvider } from "@/components/ui/sidebar";
import { Home, FileText, Settings } from "lucide-react";

<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarHeader className="border-b border-sidebar-border p-4">
      <h2 className="text-lg font-bold">App Name</h2>
    </SidebarHeader>

    <SidebarContent className="px-3 py-4">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200">
                  <Home className="mr-3 h-4 w-4" />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#" className="bg-primary/20 text-primary font-semibold border-r-2 border-primary shadow-sm">
                  <FileText className="mr-3 h-4 w-4" />
                  <span>Reports (Active)</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter className="border-t p-3">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</SidebarProvider>

// Active state: bg-primary/20 text-primary font-semibold border-r-2 border-primary shadow-sm
// Hover state: hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1
\`\`\`

### Data Display Components
\`\`\`tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Skeleton
<div className="space-y-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
</div>

// Avatar
<Avatar>
  <AvatarImage src="url" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Progress
<Progress value={66} />
\`\`\`

### Status Colors
- \`critical\` - Error states (hsl(var(--critical)))
- \`warning\` - Warning states (hsl(var(--warning)))
- \`success\` - Success states (hsl(var(--success)))
- \`info\` - Informational states (hsl(var(--info)))

All components use semantic color tokens and support dark mode automatically.

## 6. DataTable Component

### Create src/components/ui/data-table.tsx
\`\`\`tsx
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface ColumnDef<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

export interface DataTableProps<T> {
  title?: string;
  data: T[];
  columns: ColumnDef<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterConfig[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange?: (rows: number) => void;
  totalRecords: number;
  loading?: boolean;
  emptyMessage?: string;
  actions?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  activeFilters = {},
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalRecords,
  loading = false,
  emptyMessage = "No data available",
  actions,
}: DataTableProps<T>) {
  const startRecord = (currentPage - 1) * rowsPerPage + 1;
  const endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      {(title || actions) && (
        <div className="flex items-center justify-between">
          {title && <h2 className="text-2xl font-bold">{title}</h2>}
          {actions && <div>{actions}</div>}
        </div>
      )}

      {/* Search and Filters */}
      {(searchable || filters.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || "all"}
              onValueChange={(value) => onFilterChange?.(filter.key, value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.cell ? column.cell(row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => onRowsPerPageChange?.(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {startRecord}-{endRecord} of {totalRecords}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
\`\`\`

### Create src/hooks/useDataTable.tsx
\`\`\`tsx
import { useState, useMemo } from "react";

interface FilterConfig {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

interface UseDataTableProps<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  filterConfigs?: FilterConfig[];
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchKeys = [],
  filterConfigs = [],
}: UseDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Apply search and filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value?.toString().toLowerCase().includes(lowerSearch);
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => item[key] === value);
      }
    });

    return result;
  }, [data, searchTerm, searchKeys, activeFilters]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const totalRecords = filteredData.length;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page
  };

  const handleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows);
    setCurrentPage(1); // Reset to first page
  };

  return {
    searchTerm,
    activeFilters,
    currentPage,
    rowsPerPage,
    totalPages,
    totalRecords,
    filteredData,
    paginatedData,
    handleSearch,
    handleFilter,
    handlePageChange,
    handleRowsPerPageChange,
  };
}
\`\`\`

### DataTable Usage Example
\`\`\`tsx
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useDataTable } from "@/hooks/useDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Plus } from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function TeamMembersTable() {
  const members: TeamMember[] = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
  ];

  const {
    searchTerm,
    activeFilters,
    currentPage,
    rowsPerPage,
    totalPages,
    totalRecords,
    paginatedData,
    handleSearch,
    handleFilter,
    handlePageChange,
    handleRowsPerPageChange,
  } = useDataTable({
    data: members,
    searchKeys: ["name", "email"],
    filterConfigs: [
      {
        key: "role",
        label: "Role",
        options: [
          { label: "Admin", value: "Admin" },
          { label: "User", value: "User" },
        ],
      },
      {
        key: "status",
        label: "Status",
        options: [
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "Inactive" },
        ],
      },
    ],
  });

  const columns: ColumnDef<TeamMember>[] = [
    { key: "name", header: "Name" },
    {
      key: "email",
      header: "Email",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{row.email}</span>
        </div>
      ),
    },
    { key: "role", header: "Role" },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.status === "Active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      title="Team Members"
      data={paginatedData}
      columns={columns}
      searchable={true}
      searchPlaceholder="Search members..."
      searchValue={searchTerm}
      onSearchChange={handleSearch}
      filters={[
        {
          key: "role",
          label: "Role",
          options: [
            { label: "Admin", value: "Admin" },
            { label: "User", value: "User" },
          ],
        },
        {
          key: "status",
          label: "Status",
          options: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ]}
      activeFilters={activeFilters}
      onFilterChange={handleFilter}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={handleRowsPerPageChange}
      totalRecords={totalRecords}
      actions={
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      }
    />
  );
}
\`\`\`

## 7. Filter Components

### Create src/components/filters/SearchBar.tsx
\`\`\`tsx
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...",
  className = ""
}: SearchBarProps) {
  return (
    <div className={\`relative \${className}\`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
\`\`\`

### Create src/components/filters/FilterSelect.tsx
\`\`\`tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  showClearButton?: boolean;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "All",
  showClearButton = true
}: FilterSelectProps) {
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        {label}:
      </span>
      <div className="flex items-center gap-1">
        <Select value={value || "all"} onValueChange={(val) => onChange(val === "all" ? "" : val)}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder={placeholder}>
              {selectedOption?.label || placeholder}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {showClearButton && value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filter</span>
          </Button>
        )}
      </div>
    </div>
  );
}

interface FilterBadgeProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterBadge({ label, value, onRemove }: FilterBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      <span className="text-xs">
        {label}: {value}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-transparent"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove filter</span>
      </Button>
    </Badge>
  );
}
\`\`\`

### Create src/components/filters/ActiveFilters.tsx
\`\`\`tsx
import { FilterBadge } from "./FilterSelect";

interface FilterConfig {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

interface ActiveFiltersProps {
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterRemove: (key: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  filters,
  filterConfigs,
  onFilterRemove,
  onClearAll
}: ActiveFiltersProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map(([key, value]) => {
        const config = filterConfigs.find(c => c.key === key);
        const option = config?.options.find(opt => opt.value === value);
        
        return (
          <FilterBadge
            key={key}
            label={config?.label || key}
            value={option?.label || value}
            onRemove={() => onFilterRemove(key)}
          />
        );
      })}
      <button
        onClick={onClearAll}
        className="text-sm text-muted-foreground hover:text-foreground underline"
      >
        Clear all
      </button>
    </div>
  );
}
\`\`\`

### Filter Components Usage
\`\`\`tsx
import { SearchBar } from "@/components/filters/SearchBar";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ActiveFilters } from "@/components/filters/ActiveFilters";

function MyPage() {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filterConfigs = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ]
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search..."
      />

      {/* Filter Selects */}
      <div className="flex gap-4">
        <FilterSelect
          label="Role"
          value={roleFilter}
          options={filterConfigs[0].options}
          onChange={setRoleFilter}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={filterConfigs[1].options}
          onChange={setStatusFilter}
        />
      </div>

      {/* Active Filters Display */}
      <ActiveFilters
        filters={{ role: roleFilter, status: statusFilter }}
        filterConfigs={filterConfigs}
        onFilterRemove={(key) => {
          if (key === "role") setRoleFilter("");
          if (key === "status") setStatusFilter("");
        }}
        onClearAll={() => {
          setRoleFilter("");
          setStatusFilter("");
        }}
      />
    </div>
  );
}
\`\`\`

## 8. Dual List Box Component

### Create src/components/ui/dual-list-box.tsx
\`\`\`tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface DualListBoxItem {
  value: string;
  label: string;
}

interface DualListBoxProps {
  availableItems: DualListBoxItem[];
  selectedItems: DualListBoxItem[];
  onItemsChange: (selected: DualListBoxItem[]) => void;
  availableLabel?: string;
  selectedLabel?: string;
  emptyAvailableMessage?: string;
  emptySelectedMessage?: string;
  className?: string;
}

export function DualListBox({
  availableItems,
  selectedItems,
  onItemsChange,
  availableLabel = "Available",
  selectedLabel = "Selected",
  emptyAvailableMessage = "No items available",
  emptySelectedMessage = "No items selected",
  className = "",
}: DualListBoxProps) {
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);

  const moveRight = () => {
    const itemsToMove = availableItems.filter(item => 
      leftSelected.includes(item.value)
    );
    onItemsChange([...selectedItems, ...itemsToMove]);
    setLeftSelected([]);
  };

  const moveLeft = () => {
    const itemsToRemove = rightSelected;
    onItemsChange(selectedItems.filter(item => 
      !itemsToRemove.includes(item.value)
    ));
    setRightSelected([]);
  };

  const handleLeftToggle = (value: string, checked: boolean) => {
    setLeftSelected(prev => 
      checked ? [...prev, value] : prev.filter(v => v !== value)
    );
  };

  const handleRightToggle = (value: string, checked: boolean) => {
    setRightSelected(prev => 
      checked ? [...prev, value] : prev.filter(v => v !== value)
    );
  };

  return (
    <div className={\`grid grid-cols-1 md:grid-cols-3 gap-3 \${className}\`}>
      {/* Available Items */}
      <div className="border rounded-md p-3">
        <div className="font-medium mb-2 text-sm">{availableLabel}</div>
        <div className="space-y-1 max-h-60 overflow-auto">
          {availableItems.length === 0 ? (
            <div className="text-xs text-muted-foreground">{emptyAvailableMessage}</div>
          ) : (
            availableItems.map(item => (
              <label 
                key={item.value} 
                className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer"
              >
                <Checkbox
                  checked={leftSelected.includes(item.value)}
                  onCheckedChange={(checked) => 
                    handleLeftToggle(item.value, checked as boolean)
                  }
                />
                <span>{item.label}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Move Buttons */}
      <div className="flex flex-col items-center justify-center gap-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={moveRight}
          disabled={leftSelected.length === 0}
          className="w-32 gap-2"
        >
          <span>Add</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={moveLeft}
          disabled={rightSelected.length === 0}
          className="w-32 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Remove</span>
        </Button>
      </div>

      {/* Selected Items */}
      <div className="border rounded-md p-3">
        <div className="font-medium mb-2 text-sm">{selectedLabel}</div>
        <div className="space-y-1 max-h-60 overflow-auto">
          {selectedItems.length === 0 ? (
            <div className="text-xs text-muted-foreground">{emptySelectedMessage}</div>
          ) : (
            selectedItems.map(item => (
              <label 
                key={item.value} 
                className="flex items-center gap-2 text-sm hover:bg-muted/50 p-1 rounded cursor-pointer"
              >
                <Checkbox
                  checked={rightSelected.includes(item.value)}
                  onCheckedChange={(checked) => 
                    handleRightToggle(item.value, checked as boolean)
                  }
                />
                <span>{item.label}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
\`\`\`

### Dual List Box Usage
\`\`\`tsx
import { DualListBox, DualListBoxItem } from "@/components/ui/dual-list-box";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function AssignmentDialog() {
  // Define all possible items
  const allUsers: DualListBoxItem[] = [
    { value: "1", label: "John Doe" },
    { value: "2", label: "Jane Smith" },
    { value: "3", label: "Bob Johnson" },
  ];

  // Track selected items
  const [selectedUsers, setSelectedUsers] = useState<DualListBoxItem[]>([]);

  // Calculate available items (those not selected)
  const availableUsers = allUsers.filter(
    user => !selectedUsers.find(selected => selected.value === user.value)
  );

  const handleSave = () => {
    // Save assignments
    console.log('Selected users:', selectedUsers);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Team Members</DialogTitle>
          <DialogDescription>
            Select team members to assign to this project
          </DialogDescription>
        </DialogHeader>
        <DualListBox
          availableItems={availableUsers}
          selectedItems={selectedUsers}
          onItemsChange={setSelectedUsers}
          availableLabel="Available Members"
          selectedLabel="Assigned Members"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
\`\`\`

Common use cases for Dual List Box:
- Assignment Management (reports, templates, resources)
- Permission Management (roles, capabilities)
- Team Building (selecting team members)
- Category Selection (tags, labels)
\`\`\`
`;

    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      toast.success("Design system exported!", { description: "All configuration copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy", { description: "Please try again" });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Design System Styleguide</h1>
          <p className="text-muted-foreground">Patroller Console - Emergency Response Platform</p>
        </div>
        <Button onClick={handleCopyExport} className="gap-2">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Export Design System
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Color Palette */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Color Palette</h2>
          <p className="text-muted-foreground">All colors use HSL format for proper theming</p>
        </div>

        <div className="space-y-8">
          {/* Brand Colors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Brand Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorSwatch name="Primary" cssVar="--primary" foreground="--primary-foreground" />
              <ColorSwatch name="Primary Hover" cssVar="--primary-hover" foreground="--primary-foreground" />
            </div>
          </div>

          {/* Status Colors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Status & Alert System</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorSwatch name="Critical" cssVar="--critical" foreground="--critical-foreground" />
              <ColorSwatch name="Warning" cssVar="--warning" foreground="--warning-foreground" />
              <ColorSwatch name="Success" cssVar="--success" foreground="--success-foreground" />
              <ColorSwatch name="Info" cssVar="--info" foreground="--info-foreground" />
            </div>
          </div>

          {/* Neutral Colors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Neutral System</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorSwatch name="Background" cssVar="--background" foreground="--foreground" />
              <ColorSwatch name="Foreground" cssVar="--foreground" foreground="--background" />
              <ColorSwatch name="Card" cssVar="--card" foreground="--card-foreground" />
              <ColorSwatch name="Secondary" cssVar="--secondary" foreground="--secondary-foreground" />
              <ColorSwatch name="Muted" cssVar="--muted" foreground="--muted-foreground" />
              <ColorSwatch name="Accent" cssVar="--accent" foreground="--accent-foreground" />
            </div>
          </div>

          {/* Form Colors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Form Elements</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorSwatch name="Border" cssVar="--border" foreground="--foreground" />
              <ColorSwatch name="Input" cssVar="--input" foreground="--foreground" />
              <ColorSwatch name="Ring" cssVar="--ring" foreground="--primary-foreground" />
            </div>
          </div>

          {/* Sidebar Colors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Sidebar System</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ColorSwatch name="Sidebar" cssVar="--sidebar-background" foreground="--sidebar-foreground" />
              <ColorSwatch name="Sidebar Primary" cssVar="--sidebar-primary" foreground="--sidebar-primary-foreground" />
              <ColorSwatch name="Sidebar Accent" cssVar="--sidebar-accent" foreground="--sidebar-accent-foreground" />
              <ColorSwatch name="Sidebar Border" cssVar="--sidebar-border" foreground="--sidebar-foreground" />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Typography</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-xs (0.75rem)</p>
            <p className="text-xs">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-sm (0.875rem)</p>
            <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-base (1rem)</p>
            <p className="text-base">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-lg (1.125rem)</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-xl (1.25rem)</p>
            <p className="text-xl">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-2xl (1.5rem)</p>
            <p className="text-2xl">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">text-3xl (1.875rem)</p>
            <p className="text-3xl">The quick brown fox jumps over the lazy dog</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Spacing */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Spacing Scale</h2>
        <div className="space-y-4">
          <SpacingDemo size="0.25rem" name="Tight" />
          <SpacingDemo size="0.5rem" name="Normal" />
          <SpacingDemo size="1rem" name="Comfortable" />
          <SpacingDemo size="1.5rem" name="Spacious" />
        </div>
      </section>

      <Separator />

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Buttons</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <CheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Badges */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Separator />

      {/* Alerts */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Alerts</h2>
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>This is an informational alert message.</AlertDescription>
          </Alert>
          <Alert className="border-success text-success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your changes have been saved successfully.</AlertDescription>
          </Alert>
          <Alert className="border-warning text-warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>Please review this information carefully.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>There was an error processing your request.</AlertDescription>
          </Alert>
        </div>
      </section>

      <Separator />

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Cards</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This is the card content area.</p>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Primary Card</CardTitle>
              <CardDescription>With primary border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Highlighted card variant.</p>
            </CardContent>
          </Card>
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Muted Card</CardTitle>
              <CardDescription>With muted background</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Alternative styling option.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Form Elements */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Form Elements</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Input Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Text Input</Label>
                <Input id="text" placeholder="Enter text..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Input</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" placeholder="Disabled" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="textarea">Textarea</Label>
                <Textarea id="textarea" placeholder="Enter longer text..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selection Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Dropdown</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="switch" />
                <Label htmlFor="switch">Toggle Switch</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="checkbox" />
                <Label htmlFor="checkbox">Checkbox</Label>
              </div>

              <RadioGroup defaultValue="option1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option1" id="radio1" />
                  <Label htmlFor="radio1">Radio Option 1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="option2" id="radio2" />
                  <Label htmlFor="radio2">Radio Option 2</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Shadows */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Shadow System</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ShadowDemo name="Subtle" shadow="0 1px 2px 0 hsl(215 25% 15% / 0.05)" />
          <ShadowDemo name="Soft" shadow="0 1px 3px 0 hsl(215 25% 15% / 0.1), 0 1px 2px -1px hsl(215 25% 15% / 0.1)" />
          <ShadowDemo name="Medium" shadow="0 4px 6px -1px hsl(215 25% 15% / 0.1), 0 2px 4px -2px hsl(215 25% 15% / 0.1)" />
          <ShadowDemo name="Strong" shadow="0 10px 15px -3px hsl(215 25% 15% / 0.1), 0 4px 6px -4px hsl(215 25% 15% / 0.1)" />
        </div>
      </section>

      <Separator />

      {/* Interactive Components */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Interactive Components</h2>
        
        <div className="space-y-8">
          {/* Dialog */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Dialog / Modal</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dropdown Menu */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Dropdown Menu</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Popover */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Popover</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Dimensions</h4>
                  <p className="text-sm text-muted-foreground">
                    Set the dimensions for the layer.
                  </p>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="width">Width</Label>
                      <Input id="width" defaultValue="100%" className="col-span-2" />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor="height">Height</Label>
                      <Input id="height" defaultValue="25px" className="col-span-2" />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Tooltip */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Tooltip</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is a helpful tooltip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Toast */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Toast Notifications</h3>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline"
                onClick={() => toast.success("Success!", { description: "Your changes have been saved." })}
              >
                Show Success
              </Button>
              <Button 
                variant="outline"
                onClick={() => toast.error("Error!", { description: "Something went wrong." })}
              >
                Show Error
              </Button>
              <Button 
                variant="outline"
                onClick={() => toast.info("Info", { description: "This is an informational message." })}
              >
                Show Info
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Navigation Components */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Navigation Components</h2>
        
        <div className="space-y-8">
          {/* Tabs */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Tabs</h3>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab1">Account</TabsTrigger>
                <TabsTrigger value="tab2">Password</TabsTrigger>
                <TabsTrigger value="tab3">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="space-y-4">
                <p className="text-sm text-muted-foreground">Make changes to your account here.</p>
              </TabsContent>
              <TabsContent value="tab2" className="space-y-4">
                <p className="text-sm text-muted-foreground">Change your password here.</p>
              </TabsContent>
              <TabsContent value="tab3" className="space-y-4">
                <p className="text-sm text-muted-foreground">Update your preferences here.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Accordion */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Accordion</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that match the design system.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It's animated by default with smooth transitions.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Sidebar */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Sidebar Navigation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Collapsible sidebar with grouped navigation items. Active states use primary color with border accent and shadow.
            </p>
            
            <div className="border rounded-lg overflow-hidden">
              <SidebarProvider defaultOpen={true}>
                <div className="flex h-[500px] w-full bg-background">
                  <Sidebar collapsible="icon">
                    <SidebarHeader className="border-b border-sidebar-border p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                          <Shield className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-sidebar-foreground">Patroller Console</h2>
                          <p className="text-xs text-sidebar-foreground/70">Platform View</p>
                        </div>
                      </div>
                    </SidebarHeader>

                    <SidebarContent className="px-3 py-4">
                      <SidebarGroup>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild>
                                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1">
                                  <Home className="mr-3 h-4 w-4" />
                                  <span>Dashboard</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild>
                                <a href="#" className="bg-primary/20 text-primary font-semibold border-r-2 border-primary shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-primary/30">
                                  <FileText className="mr-3 h-4 w-4" />
                                  <span>Reports</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild>
                                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1">
                                  <BarChart3 className="mr-3 h-4 w-4" />
                                  <span>Analytics</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild>
                                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1">
                                  <UsersIcon className="mr-3 h-4 w-4" />
                                  <span>Team</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>

                      <SidebarGroup>
                        <SidebarGroupLabel>Settings</SidebarGroupLabel>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <SidebarMenuButton asChild>
                                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all duration-200 hover:translate-x-1">
                                  <Settings className="mr-3 h-4 w-4" />
                                  <span>Preferences</span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-sidebar-border p-3">
                      <SidebarGroup>
                        <SidebarGroupContent>
                          <SidebarMenu>
                            <SidebarMenuItem>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <SidebarMenuButton className="w-full justify-start gap-2 bg-sidebar-accent/50 hover:bg-sidebar-accent">
                                    <User className="h-4 w-4" />
                                    <span className="flex-1 text-left">John Doe</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </SidebarMenuItem>
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </SidebarGroup>
                    </SidebarFooter>
                  </Sidebar>

                  <div className="flex-1 p-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sidebar Features</CardTitle>
                        <CardDescription>Key characteristics matching the app's sidebar</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <p className="text-sm">Active state: bg-primary/20 with border-r-2 and shadow</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <p className="text-sm">Hover effect: translate-x-1 animation on inactive items</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <p className="text-sm">Icon-only collapsed state support</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <p className="text-sm">User dropdown menu in footer</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                          <p className="text-sm">Smooth transitions with duration-200</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </SidebarProvider>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Data Display Components */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Data Display Components</h2>
        
        <div className="space-y-8">
          {/* Skeleton */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Skeleton Loaders</h3>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>

          {/* Avatar */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Avatar</h3>
            <div className="flex flex-wrap gap-4 items-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">AB</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Progress */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Progress Bar</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="text-muted-foreground">33%</span>
                </div>
                <Progress value={33} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Loading</span>
                  <span className="text-muted-foreground">66%</span>
                </div>
                <Progress value={66} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Complete</span>
                  <span className="text-muted-foreground">100%</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </div>

          {/* DataTable */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Data Table</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive table with search, filters, pagination, and custom cell rendering.
            </p>
            <DataTable
              title="Team Members"
              data={[
                { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
                { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Active" },
                { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "User", status: "Inactive" },
                { id: 4, name: "Alice Brown", email: "alice@example.com", role: "Admin", status: "Active" },
                { id: 5, name: "Charlie Wilson", email: "charlie@example.com", role: "User", status: "Active" },
              ]}
              columns={[
                { key: "name", header: "Name" },
                { 
                  key: "email", 
                  header: "Email",
                  cell: (row) => (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{row.email}</span>
                    </div>
                  )
                },
                { key: "role", header: "Role" },
                { 
                  key: "status", 
                  header: "Status",
                  cell: (row) => (
                    <Badge variant={row.status === "Active" ? "default" : "secondary"}>
                      {row.status}
                    </Badge>
                  )
                },
              ]}
              searchable={true}
              searchPlaceholder="Search members..."
              filters={[
                {
                  key: "role",
                  label: "Role",
                  options: [
                    { label: "Admin", value: "Admin" },
                    { label: "User", value: "User" },
                  ]
                },
                {
                  key: "status",
                  label: "Status",
                  options: [
                    { label: "Active", value: "Active" },
                    { label: "Inactive", value: "Inactive" },
                  ]
                }
              ]}
              currentPage={1}
              totalPages={1}
              rowsPerPage={10}
              totalRecords={5}
              actions={
                <Button size="sm">
                  <UsersIcon className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Filters */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Filter Components</h2>
        <p className="text-muted-foreground">
          Reusable filter components for search and data filtering with consistent styling and behavior.
        </p>
        
        <div className="space-y-8">
          {/* SearchBar */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Search Bar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Standalone search input component with icon. Used for text-based filtering across pages.
            </p>
            <Card>
              <CardContent className="pt-6">
                <SearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search members, reports, etc..."
                  className="max-w-md"
                />
                {searchValue && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Search value: <code className="bg-muted px-2 py-1 rounded">{searchValue}</code>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FilterSelect */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Filter Select</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Dropdown filter component with label and optional clear button. Used for single-value filtering.
            </p>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <FilterSelect
                    label="Role"
                    value={roleFilter}
                    options={[
                      { label: "Admin", value: "admin" },
                      { label: "User", value: "user" },
                      { label: "Moderator", value: "moderator" },
                    ]}
                    onChange={setRoleFilter}
                    placeholder="All Roles"
                  />
                  <FilterSelect
                    label="Status"
                    value={statusFilter}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                      { label: "Pending", value: "pending" },
                    ]}
                    onChange={setStatusFilter}
                    placeholder="All Statuses"
                  />
                </div>
                {(roleFilter || statusFilter) && (
                  <div className="text-sm text-muted-foreground">
                    <p>Selected filters:</p>
                    <ul className="list-disc list-inside mt-2">
                      {roleFilter && <li>Role: <code className="bg-muted px-2 py-1 rounded">{roleFilter}</code></li>}
                      {statusFilter && <li>Status: <code className="bg-muted px-2 py-1 rounded">{statusFilter}</code></li>}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* FilterBadge */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Filter Badge</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Badge component showing an active filter with a remove button. Used to display applied filters.
            </p>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <FilterBadge
                    label="Role"
                    value="Admin"
                    onRemove={() => toast.info("Filter removed", { description: "Role filter cleared" })}
                  />
                  <FilterBadge
                    label="Status"
                    value="Active"
                    onRemove={() => toast.info("Filter removed", { description: "Status filter cleared" })}
                  />
                  <FilterBadge
                    label="Department"
                    value="Engineering"
                    onRemove={() => toast.info("Filter removed", { description: "Department filter cleared" })}
                  />
                  <FilterBadge
                    label="Location"
                    value="New York"
                    onRemove={() => toast.info("Filter removed", { description: "Location filter cleared" })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ActiveFilters */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Active Filters</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Component to display all active filters with badges and a "Clear all" button. Auto-hides when no filters are active.
            </p>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <ActiveFilters
                  filters={{ role: roleFilter, status: statusFilter }}
                  filterConfigs={filterConfigs}
                  onFilterRemove={(key) => {
                    if (key === "role") setRoleFilter("");
                    if (key === "status") setStatusFilter("");
                    toast.success("Filter cleared");
                  }}
                  onClearAll={() => {
                    handleClearAllFilters();
                    toast.success("All filters cleared");
                  }}
                />
                {!roleFilter && !statusFilter && (
                  <p className="text-sm text-muted-foreground">
                    No active filters. Use the Filter Select components above to see active filters here.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Complete Example */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Complete Filter Example</h3>
            <p className="text-sm text-muted-foreground mb-4">
              All filter components working together in a typical page layout.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Search and filter team members by various criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search Bar */}
                <SearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search by name or email..."
                />
                
                {/* Filter Selects */}
                <div className="flex flex-wrap gap-4">
                  <FilterSelect
                    label="Role"
                    value={roleFilter}
                    options={[
                      { label: "Admin", value: "admin" },
                      { label: "User", value: "user" },
                    ]}
                    onChange={setRoleFilter}
                  />
                  <FilterSelect
                    label="Status"
                    value={statusFilter}
                    options={[
                      { label: "Active", value: "active" },
                      { label: "Inactive", value: "inactive" },
                    ]}
                    onChange={setStatusFilter}
                  />
                </div>

                {/* Active Filters Display */}
                <ActiveFilters
                  filters={{ role: roleFilter, status: statusFilter }}
                  filterConfigs={filterConfigs}
                  onFilterRemove={(key) => {
                    if (key === "role") setRoleFilter("");
                    if (key === "status") setStatusFilter("");
                  }}
                  onClearAll={handleClearAllFilters}
                />

                <Separator />

                {/* Mock Results */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Filtered Results: <span className="text-muted-foreground">3 members found</span>
                  </p>
                  <div className="grid gap-2">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">john@example.com</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <p className="font-medium">Jane Smith</p>
                      <p className="text-sm text-muted-foreground">jane@example.com</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <p className="font-medium">Bob Johnson</p>
                      <p className="text-sm text-muted-foreground">bob@example.com</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Code */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Usage Code</h3>
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`import { SearchBar } from "@/components/filters/SearchBar";
import { FilterSelect } from "@/components/filters/FilterSelect";
import { ActiveFilters } from "@/components/filters/ActiveFilters";

function MyPage() {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filterConfigs = [
    {
      key: "role",
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ]
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]
    }
  ];

  return (
    <div>
      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        placeholder="Search..."
      />

      <div className="flex gap-4">
        <FilterSelect
          label="Role"
          value={roleFilter}
          options={filterConfigs[0].options}
          onChange={setRoleFilter}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={filterConfigs[1].options}
          onChange={setStatusFilter}
        />
      </div>

      <ActiveFilters
        filters={{ role: roleFilter, status: statusFilter }}
        filterConfigs={filterConfigs}
        onFilterRemove={(key) => {
          if (key === "role") setRoleFilter("");
          if (key === "status") setStatusFilter("");
        }}
        onClearAll={() => {
          setRoleFilter("");
          setStatusFilter("");
        }}
      />
    </div>
  );
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Dual List Box */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Dual List Box</h2>
        <p className="text-muted-foreground">
          A dual list box component for moving items between available and selected lists. Commonly used for assignment management and permissions.
        </p>

        <div className="space-y-8">
          {/* Basic Example */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Basic Usage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select items from the left list and click "Add" to move them to the right. Select items from the right list and click "Remove" to move them back.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Assign Team Members</CardTitle>
                <CardDescription>Select which team members should have access to this project</CardDescription>
              </CardHeader>
              <CardContent>
                <DualListBox
                  availableItems={availableUsers}
                  selectedItems={selectedUsers}
                  onItemsChange={setSelectedUsers}
                  availableLabel="Available Members"
                  selectedLabel="Assigned Members"
                />
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Selected:</strong> {selectedUsers.length === 0 
                      ? "None" 
                      : selectedUsers.map(u => u.label).join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Features</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Multi-Select</p>
                      <p className="text-xs text-muted-foreground">Use checkboxes to select multiple items at once</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Scrollable Lists</p>
                      <p className="text-xs text-muted-foreground">Lists scroll when content exceeds max height</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Disabled States</p>
                      <p className="text-xs text-muted-foreground">Buttons disable when no items are selected</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Customizable Labels</p>
                      <p className="text-xs text-muted-foreground">Configure labels for both lists and empty states</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Hover Effects</p>
                      <p className="text-xs text-muted-foreground">Items highlight on hover for better UX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Responsive Layout</p>
                      <p className="text-xs text-muted-foreground">Adapts to mobile and desktop screens</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Code */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Usage Code</h3>
            <Card>
              <CardContent className="pt-6">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`import { DualListBox, DualListBoxItem } from "@/components/ui/dual-list-box";

function MyComponent() {
  // Define all possible items
  const allUsers: DualListBoxItem[] = [
    { value: "1", label: "John Doe" },
    { value: "2", label: "Jane Smith" },
    { value: "3", label: "Bob Johnson" },
  ];

  // Track selected items
  const [selectedUsers, setSelectedUsers] = useState<DualListBoxItem[]>([]);

  // Calculate available items (those not selected)
  const availableUsers = allUsers.filter(
    user => !selectedUsers.find(selected => selected.value === user.value)
  );

  return (
    <DualListBox
      availableItems={availableUsers}
      selectedItems={selectedUsers}
      onItemsChange={setSelectedUsers}
      availableLabel="Available Members"
      selectedLabel="Assigned Members"
      emptyAvailableMessage="All members assigned"
      emptySelectedMessage="No members assigned"
    />
  );
}

// Use in a Dialog for assignment workflows
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Assign Team Members</DialogTitle>
      <DialogDescription>
        Select team members to assign to this project
      </DialogDescription>
    </DialogHeader>
    <DualListBox
      availableItems={availableUsers}
      selectedItems={selectedUsers}
      onItemsChange={setSelectedUsers}
    />
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save Assignments
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Props Reference */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Props Reference</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">availableItems</code>
                      <span className="text-muted-foreground ml-2">DualListBoxItem[]</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Array of items available for selection</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">selectedItems</code>
                      <span className="text-muted-foreground ml-2">DualListBoxItem[]</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Array of currently selected items</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">onItemsChange</code>
                      <span className="text-muted-foreground ml-2">(items: DualListBoxItem[]) =&gt; void</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Callback when selected items change</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">availableLabel</code>
                      <span className="text-muted-foreground ml-2">string (optional)</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Label for the available items list. Default: "Available"</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">selectedLabel</code>
                      <span className="text-muted-foreground ml-2">string (optional)</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Label for the selected items list. Default: "Selected"</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">emptyAvailableMessage</code>
                      <span className="text-muted-foreground ml-2">string (optional)</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Message when no items available. Default: "No items available"</p>
                  </div>
                  <div className="border-b pb-3">
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">emptySelectedMessage</code>
                      <span className="text-muted-foreground ml-2">string (optional)</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Message when no items selected. Default: "No items selected"</p>
                  </div>
                  <div>
                    <p className="text-sm font-mono">
                      <code className="bg-muted px-2 py-1 rounded">className</code>
                      <span className="text-muted-foreground ml-2">string (optional)</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Additional CSS classes for the container</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Use Cases */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Common Use Cases</h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Use Case</Badge>
                    <div>
                      <p className="text-sm font-medium">Assignment Management</p>
                      <p className="text-xs text-muted-foreground">
                        Assigning reports, templates, or resources to organization subtypes or users
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Use Case</Badge>
                    <div>
                      <p className="text-sm font-medium">Permission Management</p>
                      <p className="text-xs text-muted-foreground">
                        Selecting which permissions or roles to grant to a user or group
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Use Case</Badge>
                    <div>
                      <p className="text-sm font-medium">Team Building</p>
                      <p className="text-xs text-muted-foreground">
                        Creating teams by selecting members from an available pool
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Use Case</Badge>
                    <div>
                      <p className="text-sm font-medium">Category Selection</p>
                      <p className="text-xs text-muted-foreground">
                        Choosing categories, tags, or labels from a predefined list
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator />

      {/* Design Tokens Reference */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Design Tokens Reference</h2>
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables</CardTitle>
            <CardDescription>Copy these tokens to your project's index.css</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`/* Animation Timing */
--duration-fast: 0.15s;
--duration-normal: 0.2s;
--duration-slow: 0.3s;

/* Border Radius */
--radius: 0.5rem;

/* Typography Scale */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;

/* Spacing Scale */
--space-tight: 0.25rem;
--space-normal: 0.5rem;
--space-comfortable: 1rem;
--space-spacious: 1.5rem;`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ColorSwatch({ name, cssVar, foreground }: { name: string; cssVar: string; foreground: string }) {
  return (
    <div className="space-y-2">
      <div 
        className="h-24 rounded-lg flex items-center justify-center text-sm font-medium border"
        style={{ 
          backgroundColor: `hsl(var(${cssVar}))`,
          color: `hsl(var(${foreground}))`
        }}
      >
        {name}
      </div>
      <p className="text-xs text-muted-foreground font-mono">{cssVar}</p>
    </div>
  );
}

function SpacingDemo({ size, name }: { size: string; name: string }) {
  return (
    <div className="flex items-center gap-4">
      <div 
        className="bg-primary h-8"
        style={{ width: size }}
      />
      <div className="text-sm">
        <p className="font-medium">{name}</p>
        <p className="text-muted-foreground">{size}</p>
      </div>
    </div>
  );
}

function ShadowDemo({ name, shadow }: { name: string; shadow: string }) {
  return (
    <Card style={{ boxShadow: shadow }}>
      <CardContent className="p-6">
        <p className="font-medium mb-1">{name}</p>
        <p className="text-xs text-muted-foreground">Shadow effect</p>
      </CardContent>
    </Card>
  );
}
