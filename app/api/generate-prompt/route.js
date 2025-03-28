import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Example prompts
// const examplePrompts = `
//   "Sketch Smudge, A medium-sized sketch of a womans face is drawn on a white paper. The womans eyes are squinted and her lips are slightly parted. Her hair is long and wavy. She is wearing a brown jacket that is pulled up to her chest. Her neck is draped over her shoulders. She has a black collar around her neck. Her eyebrows are black and her hair is a dark brown color. There are blue circles on the paper behind her.",
//   "Sketch Smudge, stylized charcoal sketch of a mans face is drawn on a dark gray background. The mans expression is intense, his eyebrows furrowed, and his lips set in a firm line. His hair is short and spiky, and he has a prominent jawline. He is wearing a leather jacket with visible texture and metallic details on the collar. The background is accented with streaks of white and black, giving the sketch a dramatic and gritty atmosphere.",
//   "Sketch Smudge, A gray and white drawing of a womans head is depicted on a white canvas background. The womans face is facing the left side of the frame, her eyes are open and her lips are slightly parted. Her hair is long and cascades over her shoulders. She is wearing a gray knitted cap, and a white scarf around her neck. The background is a vibrant red, and the womans neck is adorned with a white design."
// `;

const examplePrompts = `
  Example 1: "Sketch Smudge, A medium-sized sketch of ropes hanging on the wall using nails. The wall is made with wooden planks, and there is a small portrait of a macho man with mustache. The sketch is done with a style of Comics with Exagerated Expressions.",
  Reason Why the Example 1 is good: Ropes hanging on the wall look like rectangles with thick strokes without fill. Also, nails made it understandable that the ropes are hanging on the wall.
  
  Example 2: "Sketch Smudge, A medium-sized sketch of a woman's hand stretching toward right bottom. She is pointing the diamond at the right bottom corner with her finger. The diamond is laying on the ground, with casted shodow on the floor. The sketch is done in a detailed, American Comics style.",
  Reason Why the Example 2 is good: The line chart's data was falling trend of diamonds prices, which means that the line starts from the top left corner and goes to the bottom right corner. This leads to natural direction of the hand and finger. Also, the diamond at the right bottom corresponds to the subject of thedata.
  
  Example 3: "Sketch Smudge, A medium-sized sketch of bushes with fruits. As you go to the right, the bushes have fewer fruits and leaves, leaving only bare branches. Each bush's bottome is a clay pot, starting with a shallow branch without leaves. The sketch is done in a detailed, American Comics style.",
  Reason Why the Example 3 is good: This was for bar charts. Selecting word "bushes" instead of "plants" made it more applicable to bar markers. Also, the bushes' bottom is clay pots, which specify the specific context of the entire metaphorical scene. Also, fewer fruits and leaves reflect the decreasing trend of the data, naturally liking with "bush" concept.
`

// Define the schema for a single metaphor
const SingleMetaphorSchema = z.object({
  "metaphorical object for the chart's marks": z.string(),
  "reason why this metaphor is fit for the chart's subject": z.string(),
  "reason why this metaphor is fit for the author's intent": z.string(),
  prompt: z.string(),
});

// Define the schema for the response format using the single metaphor schema
const MetaphorsSchema = z.object({
  author_intention: z.string(),
  data_subject: z.string(),
  initial_metaphors: z.array(SingleMetaphorSchema),
  selected_metaphors: z.array(SingleMetaphorSchema),
});

export async function POST(request) {
  try {
    const { imageData, subject, authorIntention } = await request.json();

    const system_role = `
      You are a data visualization expert.
      Your job is to generate three prompts that will be used to generate pictorial chart using the FLUX.1.dev API.
      You are given three inputs: 
      (1) an author's intention of generating a pictorial chart (what feeling the author wants to convey),
      (2) a data subject of the chart (what the data is about),
      (3) an original image of a chart which is a starting point for the pictorial chart.
    `;
    const system_prompt_constraints = `
      Each prompt should start with "Sketch Smudge, a sketch of [metaphorical description for the chart's marks]" and be no more than 60 words.
    `;
    const system_metaphor_direction = `
      Regarding the metaphor, try to figure out which metaphor is closely related to the author's intention and the data's subject and trend.
      For example, if the data is about "cost of living" and the trend is increasing, the metaphor could be "a house", "a money bag" or "an apratment and a ladder reaching the window".
      In addition to this, if the author's intention is to warn about the cost of living, "a house" can be "an evil house" or "a money bag" can be "a money bag with a monstrous mouth".

      First, generate six metaphors.
      Among your ideas, select the most appropriate three metaphors which help the readers to understand the author's intention.
      Please be creative and use your imagination. Do not repeat the examples given.
    `;
    const system_prompt_examples = `
      Please describe the main metaphorical objects, and extra details to make it more realistic, so the FLUX.1.dev API can understand the context and generate the final output more acceptable.
      While detailing the extras, please do not specify non-main elements and leave the background as white.
      Followings are example prompts:
      ${examplePrompts}
    `;

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-08-06',
      messages: [
        {
          role: 'system',
          content: `
            ${system_role}
            ${system_prompt_constraints}
            ${system_metaphor_direction}
            
            For each prompt, please provide a detailed description of visual elements of the metaphor.
            ${system_prompt_examples}
          `,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: "Here is the author's intention of generating a pictorial chart:" },
            { type: 'text', text: `"${authorIntention}"` },
            { type: 'text', text: "Here is the data subject of the chart:" },
            { type: 'text', text: `"${subject}"` },
            { type: 'text', text: "Here is the original image of the chart:" },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageData}`,
              },
            },
          ],
        },
      ],
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