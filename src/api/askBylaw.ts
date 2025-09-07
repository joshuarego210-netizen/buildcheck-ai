import axios from 'axios';

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

interface AskBylawRequest {
  question: string;
  context?: {
    parsedRow?: ParsedRow;
  };
}

interface AskBylawResponse {
  answer: string;
  clause: string | null;
  page?: string;
}

export async function askBylawHandler(body: AskBylawRequest): Promise<AskBylawResponse> {
  const { question, context } = body;

  if (!question) {
    throw new Error("Question is required");
  }

  // Verify environment variables
  const apiKey = process.env.LLAMACLOUD_API_KEY;
  const endpoint = process.env.LLAMACLOUD_ENDPOINT;
  const documentId = process.env.LLAMACLOUD_DOCUMENT_ID;

  if (!apiKey || !endpoint || !documentId) {
    console.error('Missing environment variables:', { 
      hasApiKey: !!apiKey, 
      hasEndpoint: !!endpoint, 
      hasDocumentId: !!documentId 
    });
    throw new Error("LlamaCloud configuration is incomplete");
  }

  console.log('Processing bylaw question:', question);
  console.log('Using document ID:', documentId);

  // Construct proper prompt for LlamaCloud
  const contextStr = context?.parsedRow ? `\nProject Context: ${JSON.stringify(context.parsedRow, null, 2)}` : '';
  
  const prompt = `You are an assistant with access to the Bangalore bylaws document ${documentId}.

Answer the following question concisely in 1-3 sentences and include:
(a) Short numeric answer if applicable (e.g., "1.5 meters", "7 meters", "1 space per 10 seats")
(b) The exact clause citation and page number if available
(c) A one-line actionable note

${contextStr}

Question: ${question}

Please respond in JSON format with the following structure:
{
  "answer": "Your detailed answer here",
  "clause": "Exact clause reference",
  "page": "Page number"
}`;

  // Retry logic for LlamaCloud API
  let lastError: any;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`LlamaCloud API attempt ${attempt}/2`);
      
      const response = await axios.post(
        `${endpoint}/v1/parsing/job/${documentId}/result/markdown`,
        {
          query: prompt,
          parsing_instruction: "Extract specific bylaw requirements with numeric values, clause references, and page numbers."
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log('LlamaCloud response status:', response.status);
      console.log('LlamaCloud response data:', response.data);

      // Parse response - LlamaCloud might return different formats
      let result: AskBylawResponse;
      
      if (typeof response.data === 'string') {
        // Try to extract JSON from markdown response
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create structured response from text
          result = {
            answer: response.data.trim(),
            clause: null,
            page: null
          };
        }
      } else if (response.data.answer) {
        result = response.data;
      } else {
        // Handle different response structures
        result = {
          answer: response.data.result || response.data.text || JSON.stringify(response.data),
          clause: response.data.clause || null,
          page: response.data.page || null
        };
      }

      // Validate response
      if (!result.answer || result.answer.trim().length === 0) {
        throw new Error('Empty response from LlamaCloud');
      }

      return {
        answer: result.answer,
        clause: result.clause || null,
        page: result.page || null
      };

    } catch (error: any) {
      lastError = error;
      console.error(`LlamaCloud API attempt ${attempt} failed:`, error.message);
      
      if (attempt === 1) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // If all attempts failed, throw a clear error
  console.error('All LlamaCloud attempts failed:', lastError);
  throw new Error('Temporary error connecting to bylaw database. Please try again in a moment.');
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await askBylawHandler(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Ask-a-Bylaw handler error:", error);
    
    res.status(500).json({
      answer: error.message.includes('Temporary error') 
        ? error.message 
        : "Temporary error connecting to bylaw database. Please try again in a moment.",
      clause: null,
      page: null
    });
  }
}
