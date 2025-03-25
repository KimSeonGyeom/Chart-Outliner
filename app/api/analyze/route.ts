import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { chartType, data } = await request.json();

    const prompt = `Analyze this ${chartType} chart data and provide insights about:
1. Key trends and patterns
2. Notable data points
3. Potential improvements or suggestions

Chart Data: ${JSON.stringify(data)}

Please provide a concise analysis.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data visualization expert. Provide clear, concise analysis of chart data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ 
      analysis: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'Failed to analyze chart' },
      { status: 500 }
    );
  }
} 