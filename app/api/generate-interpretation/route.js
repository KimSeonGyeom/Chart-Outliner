import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// Define the schema for the response format using the single metaphor schema
const Schema = z.object({
  interpretation: z.string(),
});

export async function POST(request) {
  try {
    const { imageData, subject } = await request.json();

    const system_role = `
      You are a data visualization expert.
      Your role is to look at the basic chart that I give you and figure out what this chart is trying to tell the audience.
      For example, if the bars are going up, it could mean that the data is increasing.
      Or, if the bars are fluctuating, it could mean that the data is unstable or monstrous.
    `;

    const response = await openai.beta.chat.completions.parse({
      model: 'gpt-4o-2024-11-20',
      messages: [
        {
          role: 'system',
          content: `
            ${system_role}

            Please provide your interpreteation when you see the chart in short.
          `,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: "This chart is about"+subject,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageData}`,
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(Schema, "interpretation"),
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