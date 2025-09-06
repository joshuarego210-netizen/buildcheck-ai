import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import beforeImage from "@/assets/BEFORE.png";
import afterImage from "@/assets/AFTER.png";
export const BeforeAfterSection = () => {
  const navigate = useNavigate();
  return <section className="py-20 px-6 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 bg-white">
          {/* Before Section */}
          <Card className="shadow-card border-0 bg-destructive-light">
            <CardContent className="p-8 space-y-6 bg-white">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-destructive mb-4">
                  Before (Manual Process)
                </h2>
                <img src={beforeImage} alt="Architect overwhelmed with manual compliance checking" className="rounded-lg w-full h-full object-cover mb-6" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-destructive" size={24} />
                <span className="text-lg font-semibold text-destructive">
                  Hours to Days of Manual Checking
                </span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={16} />
                  <span>Download and study 200+ page bylaws</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={16} />
                  <span>Manually calculate FAR, setbacks, parking, height</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="text-destructive mt-1 flex-shrink-0" size={16} />
                  <span>High chance of missing violations</span>
                </li>
              </ul>
              
              <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                <p className="text-lg font-semibold text-destructive text-center">
                  Weeks of frustration, high error rates, costly delays
                </p>
              </div>
            </CardContent>
          </Card>

          {/* After Section */}
          <Card className="shadow-card border-0 bg-white">
            <CardContent className="p-8 space-y-6 bg-white">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-success mb-4">
                  After (BuildCheck AI)
                </h2>
                <img src={afterImage} alt="Architect reviewing AI-generated compliance report" className="rounded-lg w-full h-full object-cover mb-6" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-success" size={24} />
                <span className="text-lg font-semibold text-success">
                  3 Minutes of Automated Checking
                </span>
              </div>
              
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-1 flex-shrink-0" size={16} />
                  <span>Upload BIM data in CSV format</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-1 flex-shrink-0" size={16} />
                  <span>AI agent instantly validates against bylaws</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="text-success mt-1 flex-shrink-0" size={16} />
                  <span>Instant compliance report generated</span>
                </li>
              </ul>
              
              <p className="text-lg font-semibold text-success text-center">
                Confidence, speed, and compliance in minutes
              </p>
              
              <div className="text-center pt-4">
                <Button variant="hero" size="lg" onClick={() => navigate("/upload")} className="px-8">
                  Check Your Building Compliance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>;
};
