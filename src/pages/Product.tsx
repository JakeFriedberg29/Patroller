import { LandingNav } from "@/components/LandingNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  MapPin, 
  Package, 
  BarChart3, 
  AlertTriangle,
  Clock,
  Shield
} from "lucide-react";

export default function Product() {
  const features = [
    {
      icon: FileText,
      title: "Incident Reporting",
      description: "Digital forms with voice-to-text, photo uploads, and automatic timestamps for accurate documentation.",
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Organize personnel, track certifications, and manage schedules across multiple locations.",
    },
    {
      icon: MapPin,
      title: "Location Tracking",
      description: "GPS integration for real-time location awareness and response coordination.",
    },
    {
      icon: Package,
      title: "Equipment Management",
      description: "Track inventory, maintenance schedules, and equipment deployment across your organization.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting and insights to improve response times and operational efficiency.",
    },
    {
      icon: AlertTriangle,
      title: "Real-time Alerts",
      description: "Instant notifications for critical incidents and automated escalation procedures.",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "75% Faster Reporting",
      description: "Reduce documentation time with streamlined digital workflows",
    },
    {
      icon: Shield,
      title: "99.9% Uptime",
      description: "Mission-critical reliability when you need it most",
    },
    {
      icon: BarChart3,
      title: "Actionable Insights",
      description: "Data-driven decisions to improve response outcomes",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Mission Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A comprehensive operations platform designed specifically for emergency response teams. 
              Streamline reporting, coordinate responses, and gain insights that save lives.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Proven Results
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to see Mission in action?
            </h2>
            <p className="text-xl text-muted-foreground">
              Schedule a personalized demo with our team
            </p>
            <Button size="lg" className="text-lg px-8 py-6">
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}