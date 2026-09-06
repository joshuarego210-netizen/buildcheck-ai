import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/BYLAWS.jpeg";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Bylaw compliance for BIM teams
            </p>
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight text-foreground">
                Check Your
                <br />
                Building Bylaw
                <br />
                <span className="text-primary">Compliance</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                From days of manual work to minutes of AI-powered validation.
              </p>
            </div>

            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/upload")}
              className="text-base px-8 py-6 h-auto"
            >
              Check Your Building Compliance
            </Button>
          </div>

          <div>
            <img
              src={heroImage}
              alt="BIM model with compliance overlay illustration"
              className="rounded-md w-full h-auto border border-border"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
