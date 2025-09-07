import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, FileText, Download, CheckCircle, XCircle, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import Papa from 'papaparse';
import { useToast } from "@/hooks/use-toast";

interface ParsedRow {
  project_name: string;
  plot_area_sqm: number;
  built_area_sqm: number;
  height_m: number;
  floors: number;
  front_setback_m: number;
  rear_setback_m: number;
  side_setback_m: number;
  parking_spots: number;
  building_type: string;
  location: string;
  far_utilized: number;
}

interface ComplianceResult {
  metric: string;
  value: string;
  limit: string;
  status: 'compliant' | 'violation';
  reference: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRow, setParsedRow] = useState<ParsedRow | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [qnAQuery, setQnAQuery] = useState("");
  const [qnAResponse, setQnAResponse] = useState("");
  const [qnALoading, setQnALoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);

  const onFile = useCallback((file: File) => {
    setUploadError("");
    
    // Check file type
    if (file.type !== "text/csv" && !file.name.toLowerCase().endsWith('.csv')) {
      setUploadError("Please upload a CSV file only.");
      setUploadedFile(null);
      setParsedRow(null);
      return;
    }
    
    // Check file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10 MB.");
      setUploadedFile(null);
      setParsedRow(null);
      return;
    }
    
    setUploadedFile(file);
    
    // Parse CSV
    Papa.parse(file, {
      header: true,
      complete: (res) => {
        if (res.errors.length > 0) {
          setUploadError("Error parsing CSV file. Please check the format.");
          return;
        }
        
        if (!res.data || res.data.length === 0) {
          setUploadError("CSV file is empty or has no data rows.");
          return;
        }
        
        const row = res.data[0] as any; // assume one row
        
        // normalize keys -> lowercased underscore
        const normalized: { [key: string]: string } = {};
        Object.keys(row).forEach(k => {
          const normalizedKey = k.trim().toLowerCase().replace(/\s+/g, '_');
          normalized[normalizedKey] = row[k]?.toString().trim() || '';
        });
        
        const parsed: ParsedRow = {
          project_name: normalized['project_name'] || normalized['project'] || '',
          plot_area_sqm: Number(normalized['plot_area_sqm'] || normalized['plot_area'] || 0),
          built_area_sqm: Number(normalized['built_area_sqm'] || normalized['built_area'] || 0),
          height_m: Number(normalized['height_m'] || normalized['height'] || 0),
          floors: Number(normalized['floors'] || normalized['floor_count'] || 0),
          front_setback_m: Number(normalized['front_setback_m'] || normalized['front_setback'] || 0),
          rear_setback_m: Number(normalized['rear_setback_m'] || normalized['rear_setback'] || 0),
          side_setback_m: Number(normalized['side_setback_m'] || normalized['side_setback'] || 0),
          parking_spots: Number(normalized['parking_spots'] || normalized['parking'] || 0),
          building_type: normalized['building_type'] || normalized['type'] || '',
          location: normalized['location'] || '',
          far_utilized: Number(normalized['far_utilized'] || normalized['far'] || 0)
        };
        
        setParsedRow(parsed);
      },
      error: (error) => {
        setUploadError(`Error parsing CSV: ${error.message}`);
      }
    });
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFile(files[0]);
    }
  }, [onFile]);

  const handleAnalyze = async () => {
    if (!parsedRow) return;
    
    setAnalysisLoading(true);
    setShowReport(false);
    
    try {
      const response = await fetch('/api/checkCompliance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedRow),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const results = await response.json();
      setComplianceResults(results);
      setShowReport(true);
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze compliance. The API may not be implemented yet.",
        variant: "destructive",
      });
      
      // Show mock data for now
      const mockResults: ComplianceResult[] = [
        { 
          metric: "Building Height", 
          value: `${parsedRow.height_m}m`, 
          limit: "Max: 12m", 
          status: parsedRow.height_m <= 12 ? "compliant" : "violation", 
          reference: "BBMP 2019, Clause 4.3.2" 
        },
        { 
          metric: "Setback", 
          value: `${parsedRow.front_setback_m}m`, 
          limit: "Required: 7m", 
          status: parsedRow.front_setback_m >= 7 ? "compliant" : "violation", 
          reference: "Clause 5.1.1" 
        },
        { 
          metric: "Parking", 
          value: `${parsedRow.parking_spots} spaces`, 
          limit: "Min: 15", 
          status: parsedRow.parking_spots >= 15 ? "compliant" : "violation", 
          reference: "Clause 6.2.1" 
        },
        { 
          metric: "FAR", 
          value: parsedRow.far_utilized.toString(), 
          limit: "Allowed: 1.25", 
          status: parsedRow.far_utilized <= 1.25 ? "compliant" : "violation", 
          reference: "Table 5.4.1" 
        },
      ];
      setComplianceResults(mockResults);
      setShowReport(true);
    } finally {
      setAnalysisLoading(false);
    }
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

  const formatPreviewValue = (key: string, value: any): string => {
    switch (key) {
      case 'height_m':
      case 'front_setback_m':
      case 'rear_setback_m':
      case 'side_setback_m':
        return `${value} m`;
      case 'plot_area_sqm':
      case 'built_area_sqm':
        return `${value} sqm`;
      case 'parking_spots':
        return `${value} spaces`;
      case 'floors':
        return `${value} floors`;
      case 'far_utilized':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const getPreviewLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      project_name: 'Project Name',
      plot_area_sqm: 'Plot Area',
      built_area_sqm: 'Built Area',
      height_m: 'Building Height',
      floors: 'Floors',
      front_setback_m: 'Front Setback',
      rear_setback_m: 'Rear Setback',
      side_setback_m: 'Side Setback',
      parking_spots: 'Parking Spaces',
      building_type: 'Building Type',
      location: 'Location',
      far_utilized: 'FAR Utilized'
    };
    return labels[key] || key;
  };

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
              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragOver 
                    ? 'border-primary bg-primary/10' 
                    : 'border-pastel-blue bg-pastel-blue/5 hover:border-pastel-blue/80'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="text-lg font-semibold mb-2">Drop your CSV file here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <div className="relative">
                  <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                    Choose File
                  </Button>
                  <input 
                    id="file-input"
                    type="file" 
                    accept=".csv,text/csv" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
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
            </CardContent>
          </Card>

          {/* CSV Preview */}
          {parsedRow && (
            <Card className="shadow-card mb-6">
              <CardHeader>
                <CardTitle>CSV Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {Object.entries(parsedRow).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-muted-foreground">{getPreviewLabel(key)}:</span>
                      <span className="text-foreground">{formatPreviewValue(key, value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analyze Button */}
          <div className="mb-6">
            <Button 
              onClick={handleAnalyze}
              disabled={!parsedRow || analysisLoading}
              className="w-full"
              size="lg"
            >
              {analysisLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Compliance"
              )}
            </Button>
          </div>
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
        {showReport && complianceResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Compliance Report – {uploadedFile?.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {complianceResults.map((item, index) => (
                <Card key={index} className={`shadow-card border ${item.status === 'compliant' ? 'bg-pastel-green/20 border-pastel-green/40' : 'bg-pastel-orange/20 border-pastel-orange/40'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{item.metric}</h3>
                      {item.status === 'compliant' ? 
                        <CheckCircle className="text-green-600" size={20} /> : 
                        <XCircle className="text-red-600" size={20} />
                      }
                    </div>
                    <p className="text-sm mb-2 text-foreground">
                      <span className="font-medium">{item.value}</span> | {item.limit}
                    </p>
                    <p className={`text-sm font-medium mb-3 ${item.status === 'compliant' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.status === 'compliant' ? '✅ Compliant' : '❌ Violation'}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.reference}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mb-8">
              <p className="text-2xl font-bold">
                <span className="text-green-600">{complianceResults.filter(r => r.status === 'compliant').length} Compliant</span>, 
                <span className="text-red-600"> {complianceResults.filter(r => r.status === 'violation').length} Violation{complianceResults.filter(r => r.status === 'violation').length !== 1 ? 's' : ''}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center mb-12">
              <Button size="lg">Download Compliance Report</Button>
              <Button variant="outline" size="lg" onClick={() => {setShowReport(false); setUploadedFile(null); setParsedRow(null);}}>
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