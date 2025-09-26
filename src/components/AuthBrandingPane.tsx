import { Card } from "@/components/ui/card";
interface AuthBrandingPaneProps {
  image?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}
export const AuthBrandingPane = ({
  image = "/src/assets/auth-hero.jpg",
  title = "Your Mission Portal",
  subtitle = "Secure access to mission-critical operations and emergency response coordination.",
  className = ""
}: AuthBrandingPaneProps) => {
  return <div className={`relative flex flex-col justify-center items-center text-white overflow-hidden ${className}`}>
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url("${image}")`
    }} />
      
      {/* Subtle Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-8 py-12 max-w-md">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        {/* Mission Badge */}
        
      </div>
    </div>;
};