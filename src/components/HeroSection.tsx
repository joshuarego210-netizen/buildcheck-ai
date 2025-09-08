import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/BYLAWS.jpeg";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/30 to-background py-24 px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto max-w-7xl relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-card rounded-full border border-border/50 shadow-sm">
              <div className="w-2 h-2 bg-bim-blue rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-bim-dark">AI-Powered BIM Compliance</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                <span className="text-bim-dark">Instant</span>
                <br />
                <span className="bg-gradient-to-r from-bim-blue via-bim-teal to-bim-blue bg-clip-text text-transparent">
                  BIM Compliance
                </span>
                <br />
                <span className="text-bim-dark">Validation</span>
              </h1>
              <p className="text-xl text-bim-gray leading-relaxed font-medium max-w-lg">
                Transform your Revit workflow with AI-powered bylaw compliance checking. 
                From hours of manual verification to seconds of intelligent analysis.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate("/upload")}
                className="bg-gradient-to-r from-bim-blue to-bim-teal hover:from-bim-blue/90 hover:to-bim-teal/90 text-white font-semibold px-8 py-4 h-auto text-lg shadow-premium hover:shadow-elevated transition-all duration-300"
              >
                Start Compliance Check
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-bim-blue/20 hover:border-bim-blue/30 hover:bg-bim-blue/5 font-semibold px-8 py-4 h-auto text-lg"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/30">
              <div>
                <div className="text-3xl font-bold text-bim-blue">3min</div>
                <div className="text-sm text-bim-gray font-medium">Average Check Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-bim-blue">99.8%</div>
                <div className="text-sm text-bim-gray font-medium">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-bim-blue">BBMP</div>
                <div className="text-sm text-bim-gray font-medium">2019 Compliant</div>
              </div>
            </div>
          </div>
          
          <div className="relative lg:pl-8">
            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-bim-blue/20 to-bim-teal/20 rounded-2xl rotate-12 blur-sm"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-bim-teal/20 to-bim-blue/20 rounded-3xl -rotate-12 blur-sm"></div>
            
            {/* Main Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-bim-blue/30 to-bim-teal/30 rounded-3xl blur-2xl transform scale-105"></div>
              <div className="relative bg-gradient-card rounded-3xl p-4 shadow-elevated border border-border/20">
                <img 
                  src={heroImage} 
                  alt="BIM model with compliance overlay showing building regulations"
                  className="rounded-2xl w-full h-auto shadow-lg"
                />
                
                {/* Floating Badge */}
                <div className="absolute top-8 right-8 bg-background/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-card border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm font-semibold text-success">Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
