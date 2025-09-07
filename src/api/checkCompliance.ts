import axios from 'axios';
import fs from 'fs';
import path from 'path';

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

interface LlamaCloudResponse {
  height_max?: number;
  height_clause?: string;
  setback?: {
    front?: number;
    rear?: number;
    side?: number;
    front_clause?: string;
    rear_clause?: string;
    side_clause?: string;
  };
  parking_min?: number;
  parking_clause?: string;
  far_max?: number;
  far_clause?: string;
}

interface ComplianceCheck {
  metric: string;
  value: any;
  limit: any;
  compliant: boolean;
  clause: string | object;
}

interface ComplianceResponse {
  project_name: string;
  filename: string;
  checks: ComplianceCheck[];
  summary: {
    compliant: number;
    violations: number;
  };
}

// Fallback defaults if LlamaCloud fails
const DEFAULT_RULES = {
  height_max: 12,
  height_clause: "BBMP 2019, Clause 4.3.2",
  setback: {
    front: 7,
    rear: 3,
    side: 3,
    front_clause: "Clause 5.1.1",
    rear_clause: "Clause 5.1.2",
    side_clause: "Clause 5.1.3"
  },
  parking_min: 15,
  parking_clause: "Clause 6.2.1",
  far_max: 1.25,
  far_clause: "Table 5.4.1"
};

async function queryLlamaCloud(question: string): Promise<LlamaCloudResponse | null> {
  const apiKey = process.env.LLAMACLOUD_API_KEY;
  const endpoint = process.env.LLAMACLOUD_ENDPOINT;
  const documentId = process.env.LLAMACLOUD_DOCUMENT_ID;

  if (!apiKey || !endpoint || !documentId) {
    console.error('Missing LlamaCloud environment variables');
    return null;
  }

  try {
    console.log('Querying LlamaCloud with question:', question);
    
    const response = await axios.post(
      endpoint,
      {
        query: question,
        document_id: documentId,
        response_format: 'json'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('LlamaCloud response:', response.data);
    
    // Try to parse JSON response
    if (typeof response.data === 'string') {
      return JSON.parse(response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('LlamaCloud query failed:', error);
    return null;
  }
}

function loadDefaultRules(): LlamaCloudResponse {
  try {
    const rulesPath = path.join(process.cwd(), 'src', 'rules', 'defaults.json');
    if (fs.existsSync(rulesPath)) {
      const rulesData = fs.readFileSync(rulesPath, 'utf8');
      return JSON.parse(rulesData);
    }
  } catch (error) {
    console.error('Failed to load default rules:', error);
  }
  
  return DEFAULT_RULES;
}

function checkCompliance(parsedRow: ParsedRow, rules: LlamaCloudResponse): ComplianceResponse {
  const checks: ComplianceCheck[] = [];

  // Height compliance
  const heightCompliant = parsedRow.height_m <= (rules.height_max || DEFAULT_RULES.height_max);
  checks.push({
    metric: "height",
    value: parsedRow.height_m,
    limit: { max: rules.height_max || DEFAULT_RULES.height_max },
    compliant: heightCompliant,
    clause: rules.height_clause || DEFAULT_RULES.height_clause
  });

  // Setback compliance
  const setbackRules = rules.setback || DEFAULT_RULES.setback;
  const frontCompliant = parsedRow.front_setback_m >= setbackRules.front;
  const rearCompliant = parsedRow.rear_setback_m >= setbackRules.rear;
  const sideCompliant = parsedRow.side_setback_m >= setbackRules.side;
  const setbackCompliant = frontCompliant && rearCompliant && sideCompliant;

  checks.push({
    metric: "setback",
    value: {
      front: parsedRow.front_setback_m,
      rear: parsedRow.rear_setback_m,
      side: parsedRow.side_setback_m
    },
    limit: {
      front: setbackRules.front,
      rear: setbackRules.rear,
      side: setbackRules.side
    },
    compliant: setbackCompliant,
    clause: {
      front: setbackRules.front_clause,
      rear: setbackRules.rear_clause,
      side: setbackRules.side_clause
    }
  });

  // Parking compliance
  const parkingCompliant = parsedRow.parking_spots >= (rules.parking_min || DEFAULT_RULES.parking_min);
  checks.push({
    metric: "parking",
    value: parsedRow.parking_spots,
    limit: { min: rules.parking_min || DEFAULT_RULES.parking_min },
    compliant: parkingCompliant,
    clause: rules.parking_clause || DEFAULT_RULES.parking_clause
  });

  // FAR compliance
  const farCompliant = parsedRow.far_utilized <= (rules.far_max || DEFAULT_RULES.far_max);
  checks.push({
    metric: "far",
    value: parsedRow.far_utilized,
    limit: { max: rules.far_max || DEFAULT_RULES.far_max },
    compliant: farCompliant,
    clause: rules.far_clause || DEFAULT_RULES.far_clause
  });

  const compliantCount = checks.filter(check => check.compliant).length;
  const violationCount = checks.length - compliantCount;

  return {
    project_name: parsedRow.project_name,
    filename: `${parsedRow.project_name.replace(/\s+/g, '_')}.csv`,
    checks,
    summary: {
      compliant: compliantCount,
      violations: violationCount
    }
  };
}

export async function checkComplianceHandler(parsedRow: ParsedRow): Promise<ComplianceResponse> {
  console.log('Processing compliance check for:', parsedRow.project_name);

  // Construct LlamaCloud query
  const question = `Using document ${process.env.LLAMACLOUD_DOCUMENT_ID} (Bangalore bylaws), return the numerical limits and exact clause references for:
1) maximum permissible building height (m) for a ${parsedRow.building_type} at ${parsedRow.location}
2) minimum front/rear/side setback (m)
3) minimum required parking spaces (give rule per area or per unit)
4) maximum allowed FAR
Provide results as JSON: {height_max: X, height_clause: "...", setback:{front: X, rear: Y, side: Z, front_clause:"...", rear_clause:"...", side_clause:"..."}, parking_min: X, parking_clause:"...", far_max: X, far_clause:"..."}`;

  // Try LlamaCloud first
  let rules = await queryLlamaCloud(question);
  
  // Fallback to default rules if LlamaCloud fails
  if (!rules) {
    console.log('LlamaCloud failed, using default rules');
    rules = loadDefaultRules();
  }

  // Perform compliance checks
  const result = checkCompliance(parsedRow, rules);
  
  console.log('Compliance check completed:', result.summary);
  return result;
}

// Express route handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsedRow: ParsedRow = req.body;
    
    // Validate required fields
    if (!parsedRow.project_name || !parsedRow.building_type || !parsedRow.location) {
      return res.status(400).json({ 
        error: 'Missing required fields: project_name, building_type, location' 
      });
    }

    const result = await checkComplianceHandler(parsedRow);
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({ 
      error: 'Internal server error during compliance check',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
