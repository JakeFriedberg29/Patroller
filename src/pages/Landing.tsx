import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingNav } from "@/components/LandingNav";
import { Shield, Clock, FileText, Users, TrendingUp, AlertTriangle } from "lucide-react";
import heroImage from "@/assets/hero-search-rescue.jpg";
import lifeguardsImage from "@/assets/lifeguards-action.jpg";
import parkRangersImage from "@/assets/park-rangers.jpg";
import eventMedicsImage from "@/assets/event-medics.jpg";
import volunteerFireImage from "@/assets/volunteer-fire.jpg";

export default function Landing() {
  const personas = [
    {
      title: "Search & Rescue",
      description: "Mountain rescue, wilderness response, and emergency coordination teams",
      image: heroImage,
    },
    {
      title: "Lifeguard Services",
      description: "Beach and aquatic safety professionals protecting lives every day",
      image: lifeguardsImage,
    },
    {
      title: "Park Rangers",
      description: "National and state park emergency response and visitor safety",
      image: parkRangersImage,
    },
    {
      title: "Event Medical",
      description: "Large-scale event medical coverage and emergency response",
      image: eventMedicsImage,
    },
    {
      title: "Volunteer Fire Services",
      description: "Community firefighters and emergency medical responders",
      image: volunteerFireImage,
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Enhanced Safety",
      description: "Real-time incident tracking and response coordination for better outcomes",
    },
    {
      icon: TrendingUp,
      title: "Actionable Insights",
      description: "Data-driven analytics to improve operations and resource allocation",
    },
    {
      icon: Clock,
      title: "Time-Saving Reporting",
      description: "Streamlined incident documentation reduces paperwork by 75%",
    },
    {
      icon: FileText,
      title: "Legal & Insurance Support",
      description: "Comprehensive documentation for claims, legal proceedings, and compliance",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted/20 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Mission-Critical
                <br />
                <span className="text-primary">Operations Platform</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Empowering emergency response teams with comprehensive incident management, 
                real-time reporting, and data-driven insights to save lives and protect communities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6">
                  Contact Sales
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  View Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Search and rescue team in action" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Trusted by Emergency Response Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From mountain peaks to ocean shores, Mission supports the heroes who keep our communities safe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personas.map((persona, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={persona.image} 
                    alt={persona.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {persona.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {persona.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Emergency Teams Choose Mission
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Purpose-built for the unique challenges of emergency response operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl opacity-90">
              Join hundreds of emergency response teams who trust Mission to manage their 
              most critical operations. Get started with a personalized demo today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Contact Sales Team
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">Mission</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 Mission. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}