import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload as UploadIcon, FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto max-w-4xl py-20 px-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">Upload Your BIM Data</h1>
          <p className="text-xl text-muted-foreground">
            Upload your CSV file to get instant compliance validation
          </p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="text-primary" size={24} />
              CSV File Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center hover:border-primary transition-colors">
              <UploadIcon className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
              <p className="text-muted-foreground mb-4">or click to browse</p>
              <Button variant="outline">Choose File</Button>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">File Requirements:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• CSV format only</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Must contain BIM model data</li>
                <li>• Include building dimensions, setbacks, and zoning information</li>
              </ul>
            </div>
            
            <div className="flex gap-4">
              <Button variant="hero" size="lg" disabled className="flex-1">
                Analyze Compliance
              </Button>
              <Button variant="outline" size="lg">
                Download Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            This is a placeholder page. File upload functionality will be implemented in the next iteration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Upload;