import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const examplePrompts = `
  Example: "Hand drawn sketch style, four wine bottles with different heights. black-red colored wine bottles with different labels and punts",
  Reason Why the Example is good: 
    - This starts with "Hand drawn sketch style, " which is a constraint of our generation. 
    - Also, it defines the number of wine bottles exactly. 
    - Last, the color of the wine bottles is specified, which is an extra information about the main object(wine bottles), not the background or other objects.
`

// Define the schema for a single metaphor
const SingleMetaphorSchema = z.object({
  "metaphorical object": z.string(),
  "reason why this metaphor is fit for the visual interpretation(data trend)": z.string(),
  "reason why this metaphor is fit for the chart's subject(not data trend)": z.string(),
  "reason why this metaphor is fit for the author's intent": z.string(),
  prompt: z.string(),
});

// Define the schema for the response format using the single metaphor schema
const MetaphorsSchema = z.object({
  author_intention: z.string(),
  data_subject: z.string(),
  visual_interpretation: z.string(),
  metaphors: z.array(SingleMetaphorSchema),
});

// Function to get template names from the public/templates directory
function getTemplateNames() {
  const templatesDir = path.join(process.cwd(), 'public', 'templates');
  let templateNames = [];
  
  try {
    if (fs.existsSync(templatesDir)) {
      const files = fs.readdirSync(templatesDir);
      templateNames = files
        .filter(file => file.toLowerCase().endsWith('.png'))
        .map(file => {
          // Extract template name from filename (remove extension)
          const templateName = path.basename(file, path.extname(file));
          // Convert underscores to spaces
          return templateName.replace(/_/g, ' ');
        });
    }
  } catch (error) {
    console.error('Error reading templates directory:', error);
  }
  
  return templateNames;
}

export async function POST(request) {
  try {
    // const { imageData, subject, authorIntention, visualInterpretation } = await request.json();
    const { authorIntention, subject, visualInterpretation, numberOfDataPoints } = await request.json();
    
    // Get template names dynamically from public/templates directory
    const templateNames = getTemplateNames();
    console.log('templateNames', templateNames);
    
    // Format the template names as candidate metaphors
    const candidateMetaphors = templateNames.length > 0
      ? templateNames.map(name => `"${name}"`).join('\n')
      : `None`;
  
    const system_role = `
      You are a data visualization expert.
      Your job is to generate five prompts that will be used to generate pictorial chart using the FLUX.1.dev API.
      You are given three inputs: 
      (1) a data subject of the chart (what the data is about),
      (2) an author's intention of generating a pictorial chart (what feeling the author wants to convey),
      (3) a visual interpretation of the data trend,
    `;
    const system_metaphor_selection = `
      Before generating prompts, try to figure out which metaphor is closely related to all three inputs: the visual interpretation, the author's intention and the data's subject and trend.
      You have a set of candidate metaphors like below:
      ${candidateMetaphors}
    `;
    const system_metaphor_direction = `
      When selecting metaphor, if the data is about "cost of living" and the trend is increasing, the metaphor could be "a house" or "stack of coins".
      In addition to this, if the author's intention is to warn about the cost of living, "a house" can be "an evil house".
    `;
    const system_prompt_constraints = `
      First, select five different metaphors.
      Then, follow the below constraints to generate prompts for each metaphor.
      Each prompt should follow the format of "Hand drawn sketch style, ${numberOfDataPoints} [metaphor] [extra information about the metaphor]" and be no more than 60 words.
    `;
    const system_prompt_examples = `
      Within the prompt, please describe extra information about the metaphor with details to make it easier to get a sense of the metaphor's appearance. 
      depending on the data values, the metaphor's appearance might be different. for example, with population growth data, the metaphor can be an adult when the data is high, and the metaphor can be a child when the data is low.
      This helps the FLUX.1.dev API to understand the context and generate the final output more clearly.
      Following is an example prompt:
      ${examplePrompts}
    `;

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `
            ${system_role}

            ${system_metaphor_selection}

            ${system_prompt_constraints}

            ${system_metaphor_direction}

            ${system_prompt_examples}
          `,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: "Here is the data subject of the chart:" },
            { type: 'text', text: `"${subject}"` },
            { type: 'text', text: "Here is the author's intention of generating a pictorial chart:" },
            { type: 'text', text: `"${authorIntention}"` },
            { type: 'text', text: "Here is the visual interpretation of the data trend:" },
            { type: 'text', text: `"${visualInterpretation}"` },
          ],
        },
      ],
      response_format: zodResponseFormat(MetaphorsSchema, "metaphors"),
    });
    
    return NextResponse.json({  
      success: true, 
      content: response.choices[0].message.parsed.metaphors.map(metaphor => ({
        ...metaphor,
        "metaphorical object": metaphor["metaphorical object"].replace(/\s+/g, '_')
      }))
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 