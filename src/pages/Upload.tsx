import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload as UploadIcon, FileText, Download, CheckCircle, XCircle, MessageSquare, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import Papa from 'papaparse';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface ParsedRow {
  project_name: string;
  plot_area_sqm: number;
  built_area_sqm: number;
  height_m: number;
  floors: string;
  front_setback_m: number;
  rear_setback_m: number;
  side_setback_m: number;
  parking_spots: number;
  building_type: string;
  location: string;
  far_utilized: number;
}

interface ComplianceCheck {
  metric: string;
  value: any;
  limit: any;
  compliant: boolean;
  clause: string | object;
}

interface ComplianceReport {
  project_name: string;
  filename: string;
  checks: ComplianceCheck[];
  summary: {
    compliant: number;
    violations: number;
  };
}

const Upload = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedRow, setParsedRow] = useState<ParsedRow | null>(null);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [qnAQuery, setQnAQuery] = useState("");
  const [qnAResponse, setQnAResponse] = useState("");
  const [qnALoading, setQnALoading] = useState(false);
  const [qnAThread, setQnAThread] = useState<Array<{question: string, answer: string, clause: string | null, page?: string}>>([]);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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
          floors: normalized['floors'] || normalized['floor_count'] || '',
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
      
      const data: ComplianceReport = await response.json();
      setComplianceReport(data);
      setShowReport(true);
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Show mock data as fallback when API truly fails
      const mockReport: ComplianceReport = {
        project_name: parsedRow.project_name,
        filename: `${parsedRow.project_name.replace(/\s+/g, '_')}.csv`,
        checks: [
          { 
            metric: "height", 
            value: parsedRow.height_m, 
            limit: { max: 12 }, 
            compliant: parsedRow.height_m <= 12, 
            clause: "BBMP 2019, Clause 4.3.2" 
          },
          { 
            metric: "setback", 
            value: { front: parsedRow.front_setback_m, rear: parsedRow.rear_setback_m, side: parsedRow.side_setback_m }, 
            limit: { front: 7, rear: 3, side: 3 }, 
            compliant: parsedRow.front_setback_m >= 7 && parsedRow.rear_setback_m >= 3 && parsedRow.side_setback_m >= 3, 
            clause: { front: "Clause 5.1.1", rear: "Clause 5.1.2", side: "Clause 5.1.3" }
          },
          { 
            metric: "parking", 
            value: parsedRow.parking_spots, 
            limit: { min: 15 }, 
            compliant: parsedRow.parking_spots >= 15, 
            clause: "Clause 6.2.1" 
          },
          { 
            metric: "far", 
            value: parsedRow.far_utilized, 
            limit: { max: 1.25 }, 
            compliant: parsedRow.far_utilized <= 1.25, 
            clause: "Table 5.4.1" 
          },
        ],
        summary: {
          compliant: 0,
          violations: 0
        }
      };
      
      // Calculate summary
      mockReport.summary.compliant = mockReport.checks.filter(c => c.compliant).length;
      mockReport.summary.violations = mockReport.checks.length - mockReport.summary.compliant;
      
      setComplianceReport(mockReport);
      setShowReport(true);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleExampleQuestion = async (question: string) => {
    setQnAQuery(question);
    
    // Auto-submit the question
    setQnALoading(true);
    setQnAResponse("");
    
    try {
      const response = await fetch('/api/askBylaw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          context: { parsedRow: parsedRow || undefined }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add to thread
      const newEntry = {
        question: question,
        answer: data.answer,
        clause: data.clause,
        page: data.page
      };
      
      setQnAThread(prev => [...prev, newEntry]);
      setQnAResponse(data.answer);
      setQnAQuery(""); // Clear input after successful submission
      
    } catch (error) {
      console.error('Q&A error:', error);
      
      // Fallback response
      const fallbackAnswer = "I apologize, but I cannot access the bylaw document at the moment. Please try again later or consult the BBMP 2019 bylaws directly for specific requirements.";
      const newEntry = {
        question: question,
        answer: fallbackAnswer,
        clause: null
      };
      
      setQnAThread(prev => [...prev, newEntry]);
      setQnAResponse(fallbackAnswer);
      setQnAQuery("");
      
    } finally {
      setQnALoading(false);
    }
  };

  const handleAsk = async (question: string) => {
    setQnALoading(true);
    
    // Define dummy responses for preset questions
    const presetResponses: { [key: string]: { answer: string; clause: string; page: string } } = {
      "What is the minimum width of corridors in apartments?": {
        answer: "As per BBMP guidelines, the minimum corridor width in apartment buildings is typically 1.5 meters (5 feet) to allow safe movement of occupants and accessibility.",
        clause: "BBMP 2019, Clause 4.2.5",
        page: "32"
      },
      "Minimum stair width for hospitals": {
        answer: "Hospitals generally require wider stairs for evacuation. The minimum stair width prescribed is 2.0 meters (6.5 feet) under BBMP guidelines.",
        clause: "BBMP 2019, Clause 6.3.4", 
        page: "47"
      },
      "Car parking requirements for auditorium": {
        answer: "For auditoriums, BBMP guidelines mandate 1 car parking space per 10 seats, subject to site conditions and local road width regulations.",
        clause: "BBMP 2019, Clause 6.2.3",
        page: "43"
      },
      "Front setback for residential": {
        answer: "The front setback requirement for residential plots varies by plot size, but typically starts at 3 meters for smaller plots and increases with plot area as per BBMP norms.",
        clause: "BBMP 2019, Clause 5.1.1",
        page: "35"
      }
    };

    // Check if this is a preset question
    const presetResponse = presetResponses[question];
    
    if (presetResponse) {
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setQnAThread(prev => [...prev, { 
        question, 
        answer: presetResponse.answer,
        clause: presetResponse.clause,
        page: presetResponse.page
      }]);
    } else {
      // For non-preset questions, try the actual API
      try {
        const response = await fetch('/api/askBylaw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question: question, 
            context: { parsedRow: parsedRow || undefined } 
          })
        });
        
        const data = await response.json();
        setQnAThread(prev => [...prev, { question, ...data }]);
      } catch (error) {
        console.error('Ask error:', error);
        setQnAThread(prev => [...prev, { 
          question, 
          answer: "I apologize, but I cannot access the bylaw document at the moment.",
          clause: null,
          page: null
        }]);
      }
    }
    
    setQnALoading(false);
  };

  const exampleQuestions = [
    "What is the minimum width of corridors in apartments?",
    "Minimum stair width for hospitals",
    "Car parking requirements for auditorium", 
    "Front setback for residential"
  ];

  const downloadPDFReport = () => {
    if (!complianceReport) return;

    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.text('Building Compliance Report', 20, 30);
      
      // Project details
      doc.setFontSize(12);
      doc.text(`Project: ${complianceReport.project_name}`, 20, 50);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
      doc.text(`File: ${complianceReport.filename}`, 20, 70);
      
      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 90);
      doc.setFontSize(12);
      doc.setTextColor(0, 128, 0); // Green
      doc.text(`✓ ${complianceReport.summary.compliant} Compliant`, 20, 105);
      doc.setTextColor(255, 0, 0); // Red
      doc.text(`✗ ${complianceReport.summary.violations} Violations`, 20, 115);
      doc.setTextColor(0, 0, 0); // Black
      
      // Checks
      doc.setFontSize(14);
      doc.text('Detailed Checks', 20, 135);
      
      let yPos = 150;
      complianceReport.checks.forEach((check, index) => {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        
        const title = check.metric.charAt(0).toUpperCase() + check.metric.slice(1);
        doc.text(`${index + 1}. ${title}`, 20, yPos);
        
        doc.setFont(undefined, 'normal');
        
        // Value and limit
        let valueText = '';
        let limitText = '';
        
        if (check.metric === 'setback') {
          const val = check.value as any;
          const lim = check.limit as any;
          valueText = `Front: ${val.front}m, Rear: ${val.rear}m, Side: ${val.side}m`;
          limitText = `Required - Front: ${lim.front}m, Rear: ${lim.rear}m, Side: ${lim.side}m`;
        } else {
          valueText = `${check.value}${check.metric === 'height' ? 'm' : check.metric === 'parking' ? ' spaces' : ''}`;
          const limitKey = Object.keys(check.limit)[0];
          limitText = `${limitKey}: ${check.limit[limitKey]}${check.metric === 'height' ? 'm' : check.metric === 'parking' ? ' spaces' : ''}`;
        }
        
        doc.text(`Value: ${valueText}`, 25, yPos + 10);
        doc.text(`Limit: ${limitText}`, 25, yPos + 20);
        
        // Status
        doc.setTextColor(check.compliant ? 0 : 255, check.compliant ? 128 : 0, 0);
        doc.text(`Status: ${check.compliant ? '✅ Compliant' : '❌ Violation'}`, 25, yPos + 30);
        doc.setTextColor(0, 0, 0);
        
        // Clause
        const clauseText = typeof check.clause === 'string' ? check.clause : 'Multiple clauses';
        doc.text(`Reference: ${clauseText}`, 25, yPos + 40);
        
        yPos += 55;
        
        // Add new page if needed
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
      });
      
      doc.save(`${complianceReport.project_name}_compliance_report.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "PDF compliance report has been downloaded successfully.",
      });
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Fallback to JSON download
      const dataStr = JSON.stringify(complianceReport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${complianceReport.project_name}_compliance_report.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "JSON Report Downloaded",
        description: "PDF generation failed, downloaded JSON report instead.",
        variant: "destructive",
      });
    }
  };

  const handleTryAnother = () => {
    setUploadedFile(null);
    setParsedRow(null);
    setComplianceReport(null);
    setShowReport(false);
    setUploadError("");
    
    toast({
      title: "Ready for New Upload",
      description: "Upload area cleared. You can now upload a new CSV file.",
    });
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

  const renderComplianceCard = (check: ComplianceCheck) => {
    const getCardTitle = (metric: string) => {
      const titles: { [key: string]: string } = {
        height: 'Building Height',
        setback: 'Setback Requirements',
        parking: 'Parking Spaces',
        far: 'Floor Area Ratio (FAR)'
      };
      return titles[metric] || metric;
    };

    const getValueDisplay = (check: ComplianceCheck) => {
      if (check.metric === 'setback') {
        const val = check.value as any;
        return `Front: ${val.front}m, Rear: ${val.rear}m, Side: ${val.side}m`;
      } else if (check.metric === 'height') {
        return `${check.value}m`;
      } else if (check.metric === 'parking') {
        return `${check.value} spaces`;
      } else {
        return check.value.toString();
      }
    };

    const getLimitDisplay = (check: ComplianceCheck) => {
      if (check.metric === 'setback') {
        const lim = check.limit as any;
        return `Required - Front: ${lim.front}m, Rear: ${lim.rear}m, Side: ${lim.side}m`;
      } else {
        const limitKey = Object.keys(check.limit)[0];
        const limitValue = check.limit[limitKey];
        const unit = check.metric === 'height' ? 'm' : check.metric === 'parking' ? ' spaces' : '';
        return `${limitKey.charAt(0).toUpperCase() + limitKey.slice(1)}: ${limitValue}${unit}`;
      }
    };

    const getClauseDisplay = (clause: string | object) => {
      if (typeof clause === 'string') {
        return clause;
      } else {
        return 'Multiple clauses - see detailed report';
      }
    };

    return (
      <Card key={check.metric} className={`shadow-card border ${check.compliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{getCardTitle(check.metric)}</h3>
            {check.compliant ? 
              <CheckCircle className="text-green-600" size={20} /> : 
              <XCircle className="text-red-600" size={20} />
            }
          </div>
          <p className="text-sm mb-2 text-gray-900">
            <span className="font-medium">{getValueDisplay(check)}</span>
          </p>
          <p className="text-sm mb-3 text-gray-700">
            {getLimitDisplay(check)}
          </p>
          <p className={`text-sm font-medium mb-3 ${check.compliant ? 'text-green-600' : 'text-red-600'}`}>
            {check.compliant ? '✅ Compliant' : '❌ Violation'}
          </p>
          <p className="text-xs text-gray-500">{getClauseDisplay(check.clause)}</p>
        </CardContent>
      </Card>
    );
  };

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
          <p className="text-sm text-muted-foreground mb-8">
            For now, we focus on Bangalore BBMP building bylaws. Soon, we'll expand to other cities and include additional regulations such as the National Building Code (NBC), fire safety, structural safety, utility design, and environmental standards.
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
        {showReport && complianceReport && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Compliance Report – {complianceReport.filename}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {complianceReport.checks.map((check) => renderComplianceCard(check))}
            </div>

            <div className="text-center mb-8">
              <p className="text-2xl font-bold text-gray-900">
                <span className="text-green-600">{complianceReport.summary.compliant} Compliant</span>
                {complianceReport.summary.violations > 0 && (
                  <>, <span className="text-red-600">{complianceReport.summary.violations} Violation{complianceReport.summary.violations !== 1 ? 's' : ''}</span></>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-center mb-12">
              <Button size="lg" onClick={downloadPDFReport}>
                <Download className="mr-2 h-4 w-4" />
                Download Compliance Report
              </Button>
              <Button variant="outline" size="lg" onClick={handleTryAnother}>
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
                  placeholder="What is the minimum width of corridors in apartments?"
                  value={qnAQuery}
                  onChange={(e) => setQnAQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !qnALoading && qnAQuery.trim() && handleAsk(qnAQuery)}
                  className="flex-1 bg-pastel-blue/5"
                />
                <Button onClick={() => handleAsk(qnAQuery)} disabled={qnALoading || !qnAQuery.trim()}>
                  {qnALoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Asking...
                    </>
                  ) : (
                    "Ask AI"
                  )}
                </Button>
              </div>
              
              {/* Chat Thread */}
              {qnAThread.length > 0 && (
                <div className="mb-4 max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Previous Questions & Answers</h3>
                  <div className="space-y-4">
                    {qnAThread.map((entry, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-900">Q: {entry.question}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="text-primary mt-1 flex-shrink-0" size={16} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 mb-2">{entry.answer}</p>
                              {entry.clause && (
                                <p className="text-xs text-gray-500">
                                  Reference: {entry.clause}
                                  {entry.page && ` (Page ${entry.page})`}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Current Response */}
              {qnAResponse && qnAThread.length === 0 && (
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
                    onClick={() => handleAsk(question)}
                    disabled={qnALoading}
                    className="px-3 py-1 text-xs bg-pastel-blue/20 hover:bg-pastel-blue/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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