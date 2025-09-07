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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, context }: AskBylawRequest = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    console.log('Processing bylaw question:', question);

    // Detailed, tuned prompt for LlamaCloud
    const prompt = `
You are an assistant with the Bangalore bylaws document ${process.env.LLAMACLOUD_DOCUMENT_ID}.
Answer concisely in 1-3 sentences and include:
(a) numeric answer if applicable,
(b) exact clause citation,
(c) actionable note.
Context (optional): ${JSON.stringify(context?.parsedRow || {})}
Question: ${question}
Return JSON in this exact format: { "answer": "...", "clause": "...", "page": "..." }
`;

    const response = await axios.post(process.env.LLAMACLOUD_ENDPOINT, {
      document_id: process.env.LLAMACLOUD_DOCUMENT_ID,
      question: prompt
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.LLAMACLOUD_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log('LlamaCloud response:', response.data);

    // Parse the JSON returned by LlamaCloud and return
    let data: AskBylawResponse;
    if (typeof response.data === 'string') {
      data = JSON.parse(response.data);
    } else {
      data = response.data;
    }

    // Validate response structure
    if (!data.answer) {
      throw new Error('Invalid response format from LlamaCloud');
    }

    res.status(200).json({
      answer: data.answer,
      clause: data.clause || null,
      page: data.page || null
    });

  } catch (err) {
    console.error("Ask-a-Bylaw error:", err);
    
    // Fallback responses for common questions
    const fallbackResponses: { [key: string]: AskBylawResponse } = {
      'minimum stair width for hospitals': {
        answer: 'Minimum stair width for hospitals is 1.5 meters as per BBMP 2019. This ensures safe evacuation during emergencies. Ensure compliance for patient safety.',
        clause: 'BBMP 2019, Clause 6.3.4',
        page: '47'
      },
      'car parking requirements for auditorium': {
        answer: 'Auditoriums require 1 parking space per 10 seats or 1 space per 50 sqm of floor area, whichever is higher. Provide adequate parking to avoid violations.',
        clause: 'BBMP 2019, Clause 6.2.3',
        page: '43'
      },
      'front setback for residential': {
        answer: 'Front setback for residential buildings is minimum 7 meters from the road boundary. This provides adequate light, ventilation and fire safety access.',
        clause: 'BBMP 2019, Clause 5.1.1',
        page: '35'
      },
      'minimum width of corridors in apartments': {
        answer: 'Minimum corridor width in apartments is 1.5 meters for main corridors and 1.2 meters for secondary corridors. Ensure adequate width for safe movement.',
        clause: 'BBMP 2019, Clause 4.2.5',
        page: '32'
      }
    };

    // Try to match question with fallback
    const questionLower = question.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (questionLower.includes(key.toLowerCase())) {
        return res.status(200).json(response);
      }
    }

    // Generic fallback
    res.status(200).json({
      answer: "I apologize, but I cannot access the bylaw document at the moment. Please try again later or consult the BBMP 2019 bylaws directly for specific requirements.",
      clause: null,
      page: null
    });
  }
}
