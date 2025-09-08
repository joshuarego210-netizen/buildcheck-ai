import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import beforeImage from "@/assets/BEFORE.jpeg";
import afterImage from "@/assets/AFTER.jpeg";
export const BeforeAfterSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 px-6 bg-gradient-subtle relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-bim-blue rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-bim-teal rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-bim-dark mb-6">
            Revolutionizing BIM Workflow
          </h2>
          <p className="text-xl text-bim-gray max-w-3xl mx-auto">
            See how BuildCheck AI transforms traditional compliance checking into an intelligent, automated process
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Before Section */}
          <Card className="group relative overflow-hidden bg-gradient-card border border-destructive/20 shadow-elevated hover:shadow-premium transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive to-destructive/60"></div>
            
            <CardContent className="p-10 space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive-light rounded-full mb-6">
                  <AlertTriangle className="text-destructive" size={16} />
                  <span className="text-sm font-semibold text-destructive">Traditional Method</span>
                </div>
                
                <h3 className="text-3xl font-bold text-bim-dark mb-6">
                  Manual Compliance Checking
                </h3>
                
                <div className="relative mb-8">
                  <img 
                    src={beforeImage} 
                    alt="Architect overwhelmed with manual compliance checking process" 
                    className="rounded-2xl w-full shadow-lg group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    Legacy Process
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-destructive-light rounded-xl">
                  <Clock className="text-destructive flex-shrink-0" size={24} />
                  <div>
                    <span className="text-lg font-bold text-destructive block">5-15 Days</span>
                    <span className="text-sm text-bim-gray">Average completion time</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border border-destructive/20 rounded-xl">
                    <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold text-bim-dark block">Manual Document Review</span>
                      <span className="text-bim-gray text-sm">Download and analyze 200+ page bylaw documents</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 border border-destructive/20 rounded-xl">
                    <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold text-bim-dark block">Error-Prone Calculations</span>
                      <span className="text-bim-gray text-sm">Manually compute FAR, setbacks, parking, and height limits</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 border border-destructive/20 rounded-xl">
                    <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold text-bim-dark block">High Risk of Violations</span>
                      <span className="text-bim-gray text-sm">Multiple revision cycles and approval delays</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-destructive/10 p-6 rounded-2xl border-l-4 border-destructive">
                  <p className="text-lg font-bold text-destructive text-center">
                    Costly delays • Human errors • Project setbacks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* After Section */}
          <Card className="group relative overflow-hidden bg-gradient-card border border-success/20 shadow-elevated hover:shadow-premium transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-bim-blue to-bim-teal"></div>
            
            <CardContent className="p-10 space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-light rounded-full mb-6">
                  <CheckCircle2 className="text-success" size={16} />
                  <span className="text-sm font-semibold text-success">AI-Powered Solution</span>
                </div>
                
                <h3 className="text-3xl font-bold text-bim-dark mb-6">
                  BuildCheck AI Integration
                </h3>
                
                <div className="relative mb-8">
                  <img 
                    src={afterImage} 
                    alt="Architect efficiently using AI-powered compliance checking system" 
                    className="rounded-2xl w-full shadow-lg group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-bim-blue to-bim-teal text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    AI Powered
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-success-light rounded-xl">
                  <Clock className="text-success flex-shrink-0" size={24} />
                  <div>
                    <span className="text-lg font-bold text-success block">3 Minutes</span>
                    <span className="text-sm text-bim-gray">Complete analysis time</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border border-success/20 rounded-xl bg-success-light/20">
                    <CheckCircle2 className="text-success mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold text-bim-dark block">Direct BIM Integration</span>
                      <span className="text-bim-gray text-sm">Upload CSV data directly from Revit or other BIM tools</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 border border-success/20 rounded-xl bg-success-light/20">
                    <CheckCircle2 className="text-success mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold text-bim-dark block">AI Agent Validation</span>
                      <span className="text-bim-gray text-sm">Instant validation against BBMP 2019 bylaws and regulations</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 border border-success/20 rounded-xl bg-success-light/20">
                    <CheckCircle2 className="text-success mt-1 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold text-bim-dark block">Detailed Reports</span>
                      <span className="text-bim-gray text-sm">Comprehensive compliance report with actionable insights</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-success/10 to-bim-blue/10 p-6 rounded-2xl border-l-4 border-success">
                  <p className="text-lg font-bold text-success text-center mb-4">
                    99.8% accuracy • Instant results • Future-ready workflow
                  </p>
                  
                  <div className="text-center">
                    <Button 
                      size="lg"
                      onClick={() => navigate("/upload")} 
                      className="bg-gradient-to-r from-bim-blue to-bim-teal hover:from-bim-blue/90 hover:to-bim-teal/90 text-white font-semibold px-8 py-3 shadow-premium hover:shadow-elevated transition-all duration-300"
                    >
                      Start Your Compliance Check
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-8 bg-gradient-card rounded-2xl px-8 py-6 shadow-card border border-border/20">
            <div className="text-left">
              <p className="text-lg font-semibold text-bim-dark">Ready to transform your BIM workflow?</p>
              <p className="text-bim-gray">Join hundreds of architects already using BuildCheck AI</p>
            </div>
            <Button 
              size="lg"
              onClick={() => navigate("/upload")}
              className="bg-gradient-to-r from-bim-blue to-bim-teal hover:from-bim-blue/90 hover:to-bim-teal/90 text-white font-semibold px-6 py-3 whitespace-nowrap"
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
