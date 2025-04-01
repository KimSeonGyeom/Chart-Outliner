import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for a single metaphor
const SingleMetaphorSchema = z.object({
  "metaphorical object": z.string(),
  "reason why this metaphor is fit for the visual interpretation(data trend)": z.string(),
  "reason why this metaphor is fit for the chart's subject(not data trend)": z.string(),
  "reason why this metaphor is fit for the author's intent": z.string(),
});

// Define the schema for the response format using the single metaphor schema
const MetaphorsSchema = z.object({
  author_intention: z.string(),
  data_subject: z.string(),
  visual_interpretation: z.string(),
  metaphors: z.array(SingleMetaphorSchema),
});

export async function POST(request) {
  try {
    const { subject, authorIntention, visualInterpretation } = await request.json();

    const system_role = `
      You are a data visualization expert.
      Your job is to generate metaphors that could be used to create bars in a pictorial bar chart.
      You are given three inputs: 
      (1) a visual interpretation of the data trend,
      (2) an author's intention of generating a pictorial bar chart (what feeling the author wants to convey),
      (3) a data subject of the chart (what the data is about).
    `;

    const system_metaphor_direction = `
      Regarding the metaphor, try to figure out which metaphor is closely related to the visual interpretation, the author's intention and the data's subject and trend.
      For example, if the data is about "cost of living" and the trend is increasing, the metaphor could be "a house", "a money bag" or "an apartment and a ladder reaching the window".
      In addition to this, if the author's intention is to warn about the cost of living, "a house" can be "an evil house" or "a money bag" can be "a money bag with a monstrous mouth".

      Generate four metaphors that could be used to create bars in a pictorial bar chart.
      For each metaphor, explain why it fits well with:
      1. The visual interpretation of the data trend
      2. The chart's subject matter
      3. The author's intended message
      
      Please consider below points:
      - The conventional appearance of the metaphor should be tall as the bars in the chart(e.g., select a tree rather than a moss for green metaphor).
      - The metaphor should be a single object(e.g., a house) or a single grouped objects(e.g., a single stack of coins).
      - Please do not use word that reminds multiple objects (e.g., skyscrapper).

      To sum up, please name the metaphor starting with "a single [object]".
    `;

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `
            ${system_role}
            ${system_metaphor_direction}
          `,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: "Here is the author's intention of generating a pictorial chart:" },
            { type: 'text', text: `"${authorIntention}"` },
            { type: 'text', text: "Here is the data subject of the chart:" },
            { type: 'text', text: `"${subject}"` },
            { type: 'text', text: "Here is the visual interpretation of the data:" },
            { type: 'text', text: `"${visualInterpretation}"` },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: zodResponseFormat(MetaphorsSchema, "metaphors"),
    });

    console.log('Raw response:', response);

    return NextResponse.json({ 
      success: true, 
      content: response.choices[0].message.parsed 
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 