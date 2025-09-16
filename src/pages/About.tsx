import { LandingNav } from "@/components/LandingNav";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Award, Globe } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Every feature is designed with the safety of responders and communities as our top priority.",
    },
    {
      icon: Users,
      title: "Built by Experts",
      description: "Our team includes former emergency responders who understand the real challenges you face.",
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Trusted by over 500 organizations with a 99.9% uptime record in critical situations.",
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Supporting emergency response teams across 15 countries and growing.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
              About Mission
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We're on a mission to revolutionize emergency response operations through 
              technology that saves lives and strengthens communities.
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Founded in 2018 by a team of former search and rescue professionals, Mission was born 
                from firsthand experience with the challenges facing emergency response teams. We witnessed 
                how outdated systems and inefficient processes could cost precious time in life-or-death situations.
              </p>
              <p>
                Today, Mission serves hundreds of organizations worldwide, from volunteer fire departments 
                to large-scale search and rescue operations. Our platform has facilitated over 50,000 
                incident reports and helped coordinate responses that have saved countless lives.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}