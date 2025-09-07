import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/BYLAWS.jpeg";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-background to-muted py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Check Your Building Bylaw
                <span className="bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  {" "}Compliance
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From days of manual work to minutes of AI-powered validation.
              </p>
            </div>
            
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/upload")}
              className="text-lg px-8 py-6 h-auto"
            >
              Check Your Building Compliance
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-hover/20 rounded-2xl blur-3xl"></div>
            <img 
              src={heroImage} 
              alt="BIM model with compliance overlay illustration"
              className="relative rounded-2xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
