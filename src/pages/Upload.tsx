import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, FileText, Download, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Upload = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [qnAQuery, setQnAQuery] = useState("");
  const [qnAResponse, setQnAResponse] = useState("");
  const [qnALoading, setQnALoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError("");
    
    if (!file) return;
    
    // Check file type
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith('.csv')) {
      setUploadError("Please upload a CSV file only.");
      setUploadedFile(null);
      return;
    }
    
    // Check file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10 MB.");
      setUploadedFile(null);
      return;
    }
    
    setUploadedFile(file);
  };

  const handleAnalyze = () => {
    setAnalysisLoading(true);
    // Simulate analysis
    setTimeout(() => {
      setAnalysisLoading(false);
      setShowReport(true);
    }, 2000);
  };

  const handleQnASubmit = () => {
    if (!qnAQuery.trim()) return;
    setQnALoading(true);
    // Simulate AI response
    setTimeout(() => {
      setQnAResponse("The minimum stair width in residential buildings is 1.2 meters as per BBMP 2019, Clause 6.3.2. This ensures safe evacuation and accessibility compliance.");
      setQnALoading(false);
    }, 1500);
  };

  const mockComplianceData = [
    { metric: "Building Height", value: "10.5m", limit: "Max: 12m", status: "compliant", reference: "BBMP 2019, Clause 4.3.2" },
    { metric: "Setback", value: "9m", limit: "Required: 7m", status: "compliant", reference: "Clause 5.1.1" },
    { metric: "Parking", value: "18 spaces", limit: "Min: 15", status: "compliant", reference: "Clause 6.2.1" },
    { metric: "FAR", value: "1.5", limit: "Allowed: 1.25", status: "violation", reference: "Table 5.4.1" },
  ];

  const exampleQuestions = [
    "Min stair width",
    "Car parking requirements", 
    "Max floor area ratio",
    "Front setback for residential"
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto max-w-4xl py-8 px-6">
        {/* Top Bar */}
        <div className="flex justify-end mb-8">
          <button 
            onClick={() => navigate("/")}
            className="text-foreground hover:text-primary transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Upload Your BIM Data</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Currently BuildCheckAI supports CSV files exported from Revit schedules.<br />
            RVT and IFC support coming soon.
          </p>

          <Card className="shadow-card mb-6">
            <CardContent className="p-8">
              <div className="border-2 border-dashed border-pastel-blue rounded-lg p-12 text-center bg-pastel-blue/5 hover:border-pastel-blue/80 transition-colors">
                <UploadIcon className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <label className="cursor-pointer">
                  <Button variant="outline">Choose File</Button>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadedFile && (
                  <p className="mt-4 text-sm text-foreground">✓ {uploadedFile.name}</p>
                )}
                {uploadError && (
                  <p className="mt-4 text-sm text-red-600">{uploadError}</p>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <a href="#" className="text-primary hover:underline">Download Sample CSV</a>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={handleAnalyze}
                  disabled={!uploadedFile || analysisLoading}
                  className="w-full"
                  size="lg"
                >
                  {analysisLoading ? "Analyzing..." : "Analyze Compliance"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How to Export from Revit */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">How to Export from Revit</h2>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <p className="mb-4 text-muted-foreground">
                For now, we support CSV files only. RVT and IFC files will be available in future versions.
              </p>
              <ul className="space-y-2">
                <li>• Open Revit/ArchiCAD project</li>
                <li>• Export schedules to CSV including:</li>
                <li className="ml-4">• Plot + built-up area</li>
                <li className="ml-4">• Heights & floor counts</li>
                <li className="ml-4">• Front, rear, side setbacks</li>
                <li className="ml-4">• Parking spots</li>
                <li className="ml-4">• Building type + location</li>
                <li>• Upload the CSV file above</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Report */}
        {showReport && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Compliance Report – {uploadedFile?.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {mockComplianceData.map((item, index) => (
                <Card key={index} className={`shadow-card ${item.status === 'compliant' ? 'bg-pastel-green/10' : 'bg-pastel-orange/10'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold">{item.metric}</h3>
                      {item.status === 'compliant' ? 
                        <CheckCircle className="text-green-600" size={20} /> : 
                        <XCircle className="text-red-600" size={20} />
                      }
                    </div>
                    <p className="text-sm mb-2">
                      <span className="font-medium">{item.value}</span> | {item.limit}
                    </p>
                    <p className={`text-sm font-medium ${item.status === 'compliant' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.status === 'compliant' ? '✅ Compliant' : '❌ Violation'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-3">{item.reference}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mb-8">
              <p className="text-2xl font-bold">
                <span className="text-green-600">3 Compliant</span>, <span className="text-red-600">1 Violation</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center mb-12">
              <Button size="lg">Download Compliance Report</Button>
              <Button variant="outline" size="lg" onClick={() => {setShowReport(false); setUploadedFile(null);}}>
                Try Another Project
              </Button>
            </div>
          </div>
        )}

        {/* AI-Powered Q&A Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Ask a Bylaw Question</h2>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="e.g., What's the minimum stair width?"
                  value={qnAQuery}
                  onChange={(e) => setQnAQuery(e.target.value)}
                  className="flex-1 bg-pastel-blue/5"
                />
                <Button onClick={handleQnASubmit} disabled={qnALoading}>
                  {qnALoading ? "Asking..." : "Ask AI"}
                </Button>
              </div>
              
              {qnAResponse && (
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="text-primary mt-1" size={16} />
                    <p className="text-sm">{qnAResponse}</p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setQnAQuery(question)}
                    className="px-3 py-1 text-xs bg-pastel-blue/20 hover:bg-pastel-blue/30 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;