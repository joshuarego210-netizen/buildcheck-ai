import logo from "@/assets/LogoBM.png";

export const Header = () => {
  return (
    <header className="py-6 px-6 bg-background/95 backdrop-blur-md border-b border-border/30 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={logo} 
              alt="BuildCheck AI Logo" 
              className="w-12 h-12 drop-shadow-sm"
            />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-bim-blue to-bim-teal bg-clip-text text-transparent">
                BuildCheck AI
              </h1>
              <p className="text-sm text-muted-foreground font-medium">BIM Compliance Intelligence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-bim-blue rounded-full animate-pulse"></div>
              Revit Compatible
            </span>
            <span>BBMP 2019 Compliant</span>
          </div>
        </div>
      </div>
    </header>
  );
};
