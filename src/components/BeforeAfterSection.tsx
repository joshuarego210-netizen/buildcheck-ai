import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, Check } from "lucide-react";
import beforeImage from "@/assets/BEFORE.jpeg";
import afterImage from "@/assets/AFTER.jpeg";

export const BeforeAfterSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 border-t border-border bg-secondary/40">
      <div className="container mx-auto max-w-6xl space-y-12">
        <div className="max-w-xl space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            The comparison
          </p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
            Manual checking, and the alternative
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Before */}
          <article className="rounded-md border border-border bg-card p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-destructive">
                Before
              </p>
              <h3 className="text-xl font-medium text-foreground">
                Manual compliance checking
              </h3>
            </div>

            <img
              src={beforeImage}
              alt="Architect overwhelmed with manual compliance checking"
              className="rounded-md w-full h-auto border border-border"
            />

            <div className="flex items-center gap-3 text-foreground">
              <Clock size={18} className="text-muted-foreground" />
              <span className="text-base">Hours to days of manual checking</span>
            </div>

            <ul className="space-y-3 text-muted-foreground">
              {[
                "Download and study 200+ page bylaws",
                "Manually calculate FAR, setbacks, parking, height",
                "High chance of missing violations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <AlertTriangle className="text-destructive/70 mt-1 flex-shrink-0" size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-destructive-light border border-border rounded-md p-4">
              <p className="text-sm text-foreground">
                Weeks of frustration, high error rates, costly delays
              </p>
            </div>
          </article>

          {/* After */}
          <article className="rounded-md border border-border bg-card p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-success">
                After
              </p>
              <h3 className="text-xl font-medium text-foreground">
                BuildCheck-assisted checking
              </h3>
            </div>

            <img
              src={afterImage}
              alt="Architect reviewing AI-generated compliance report"
              className="rounded-md w-full h-auto border border-border"
            />

            <div className="flex items-center gap-3 text-foreground">
              <Clock size={18} className="text-muted-foreground" />
              <span className="text-base">3 minutes of automated checking</span>
            </div>

            <ul className="space-y-3 text-muted-foreground">
              {[
                "Upload BIM data in CSV format",
                "AI agent instantly validates against bylaws",
                "Instant compliance report generated",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="text-success mt-1 flex-shrink-0" size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="bg-success-light border border-border rounded-md p-4">
              <p className="text-sm text-foreground">
                Confidence, speed, and compliance in minutes
              </p>
            </div>

            <div className="pt-2">
              <Button variant="hero" size="lg" onClick={() => navigate("/upload")} className="px-8">
                Check Your Building Compliance
              </Button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
