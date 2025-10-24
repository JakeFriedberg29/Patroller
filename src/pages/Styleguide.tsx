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
import { AlertCircle, CheckCircle, Info, AlertTriangle, ChevronDown, User, Settings, LogOut, HelpCircle, Calendar } from "lucide-react";
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

export default function Styleguide() {
  return (
    <div className="container mx-auto py-8 space-y-12">
      <div>
        <h1 className="text-4xl font-bold mb-2">Design System Styleguide</h1>
        <p className="text-muted-foreground">Patroller Console - Emergency Response Platform</p>
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
