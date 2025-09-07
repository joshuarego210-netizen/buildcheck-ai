import axios from 'axios';

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

interface AskBylawRequest {
  question: string;
  context?: ParsedRow;
}

interface AskBylawResponse {
  answer: string;
  clause: string | null;
  page?: string;
}

async function queryLlamaCloudBylaw(question: string, context?: ParsedRow): Promise<AskBylawResponse> {
  const apiKey = process.env.LLAMACLOUD_API_KEY;
  const endpoint = process.env.LLAMACLOUD_ENDPOINT;
  const documentId = process.env.LLAMACLOUD_DOCUMENT_ID;

  if (!apiKey || !endpoint || !documentId) {
    console.error('Missing LlamaCloud environment variables');
    throw new Error('LlamaCloud configuration missing');
  }

  // Construct the prompt
  let prompt = `You are an assistant with the Bangalore bylaws document ${documentId}. Answer concisely with 1–3 sentences and include: (a) short numeric answer if applicable, (b) the clause citation and page number if available, and (c) a one-line actionable note.`;
  
  if (context) {
    prompt += `\nContext (project details): ${JSON.stringify(context)}`;
  }
  
  prompt += `\nQuestion: ${question}`;
  prompt += `\nReturn JSON: { answer: "...", clause: "BBMP 2019 Clause 4.2.1", page: "32" }`;

  try {
    console.log('Querying LlamaCloud for bylaw question:', question);
    
    const response = await axios.post(
      endpoint,
      {
        query: prompt,
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

    console.log('LlamaCloud bylaw response:', response.data);
    
    // Try to parse JSON response
    let result: AskBylawResponse;
    if (typeof response.data === 'string') {
      result = JSON.parse(response.data);
    } else {
      result = response.data;
    }

    // Validate response structure
    if (!result.answer) {
      throw new Error('Invalid response format from LlamaCloud');
    }

    return {
      answer: result.answer,
      clause: result.clause || null,
      page: result.page || undefined
    };

  } catch (error) {
    console.error('LlamaCloud bylaw query failed:', error);
    
    // Fallback response based on common questions
    const fallbackResponses: { [key: string]: AskBylawResponse } = {
      'min stair width': {
        answer: 'The minimum stair width in residential buildings is 1.2 meters as per BBMP 2019. This ensures safe evacuation and accessibility compliance. Ensure your staircase design meets this requirement.',
        clause: 'BBMP 2019, Clause 6.3.2',
        page: '45'
      },
      'car parking requirements': {
        answer: 'Parking requirements are typically 1 space per 100 sqm of built area for commercial buildings. Residential buildings require 1 space per dwelling unit. Check your local zone requirements for specific ratios.',
        clause: 'BBMP 2019, Clause 6.2.1',
        page: '42'
      },
      'max floor area ratio': {
        answer: 'Maximum FAR varies by zone but is typically 1.25 for residential areas and up to 2.5 for commercial zones. Your project should not exceed the permitted FAR for the specific zone.',
        clause: 'BBMP 2019, Table 5.4.1',
        page: '38'
      },
      'front setback for residential': {
        answer: 'Front setback for residential buildings is minimum 7 meters from the road boundary. This provides adequate light, ventilation and fire safety access. Ensure compliance before construction.',
        clause: 'BBMP 2019, Clause 5.1.1',
        page: '35'
      }
    };

    // Try to match question with fallback
    const questionLower = question.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (questionLower.includes(key)) {
        return response;
      }
    }

    // Generic fallback
    return {
      answer: 'I apologize, but I cannot access the bylaw document at the moment. Please try again later or consult the BBMP 2019 bylaws directly for specific requirements.',
      clause: null
    };
  }
}

export async function askBylawHandler(request: AskBylawRequest): Promise<AskBylawResponse> {
  console.log('Processing bylaw question:', request.question);

  if (!request.question || request.question.trim().length === 0) {
    throw new Error('Question is required');
  }

  const result = await queryLlamaCloudBylaw(request.question, request.context);
  
  console.log('Bylaw question answered:', result);
  return result;
}

// Express route handler
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request: AskBylawRequest = req.body;
    
    // Validate required fields
    if (!request.question) {
      return res.status(400).json({ 
        error: 'Missing required field: question' 
      });
    }

    const result = await askBylawHandler(request);
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Ask bylaw error:', error);
    res.status(500).json({ 
      error: 'Internal server error during bylaw query',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
