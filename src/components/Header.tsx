import logo from "@/assets/LogoBM.png";

export const Header = () => {
  return (
    <header className="py-4 px-6 bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="BuildCheck AI Logo" 
            className="w-10 h-10"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
            BuildCheck AI
          </h1>
        </div>
      </div>
    </header>
  );
};
