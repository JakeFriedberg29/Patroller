import { LandingNav } from "@/components/LandingNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

export default function Customers() {
  const testimonials = [
    {
      quote: "Mission has transformed how we coordinate search and rescue operations. Response times are down 40% since implementation.",
      author: "Sarah Chen",
      title: "Operations Chief",
      organization: "Mountain Rescue Association",
      type: "Search & Rescue",
    },
    {
      quote: "The reporting features have streamlined our incident documentation. What used to take hours now takes minutes.",
      author: "Mike Rodriguez",
      title: "Fire Chief",
      organization: "Valley Volunteer Fire Department",
      type: "Volunteer Fire",
    },
    {
      quote: "Mission's analytics helped us identify high-risk areas and improve our patrol coverage. Water rescue incidents are down 30%.",
      author: "Jennifer Walsh",
      title: "Head Lifeguard",
      organization: "Coastal Safety Services",
      type: "Lifeguard Service",
    },
    {
      quote: "The platform's reliability during critical incidents gives us confidence. It's never failed when we needed it most.",
      author: "David Park",
      title: "Emergency Coordinator",
      organization: "National Park Service",
      type: "Park Service",
    },
  ];

  const stats = [
    { number: "500+", label: "Organizations Served" },
    { number: "50K+", label: "Incidents Managed" },
    { number: "15", label: "Countries" },
    { number: "99.9%", label: "Uptime" },
  ];

  const organizationTypes = [
    "Search & Rescue Teams",
    "Volunteer Fire Departments",
    "Lifeguard Services",
    "Park Rangers",
    "Event Medical Teams",
    "Ski Patrol",
    "Harbor Masters",
    "Emergency Medical Services",
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              Trusted by Heroes Worldwide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From small volunteer teams to large-scale operations, Mission supports 
              emergency response professionals who keep our communities safe.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-4xl font-bold text-primary">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground text-center">
              What Our Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <Quote className="w-8 h-8 text-primary" />
                    <p className="text-muted-foreground italic text-lg">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.author}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.organization}
                        </div>
                      </div>
                      <Badge variant="secondary">{testimonial.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground text-center">
              Organizations We Serve
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {organizationTypes.map((type, index) => (
                <Card key={index} className="p-4 text-center hover:shadow-md transition-shadow">
                  <CardContent>
                    <div className="text-foreground font-medium">{type}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="bg-primary text-primary-foreground rounded-lg p-8 text-center space-y-6">
            <h2 className="text-3xl font-bold">
              Join Hundreds of Emergency Teams
            </h2>
            <p className="text-xl opacity-90">
              Ready to transform your operations? Let's discuss how Mission can help your team.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Contact Our Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}