import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Example prompts
const examplePrompts = [
  {
    id: 1,
    prompt: "Sketch Smudge, A medium-sized sketch of a womans face is drawn on a white paper. The womans eyes are squinted and her lips are slightly parted. Her hair is long and wavy. She is wearing a brown jacket that is pulled up to her chest. Her neck is draped over her shoulders. She has a black collar around her neck. Her eyebrows are black and her hair is a dark brown color. There are blue circles on the paper behind her."
  },
  {
    id: 2,
    prompt: "Sketch Smudge, stylized charcoal sketch of a mans face is drawn on a dark gray background. The mans expression is intense, his eyebrows furrowed, and his lips set in a firm line. His hair is short and spiky, and he has a prominent jawline. He is wearing a leather jacket with visible texture and metallic details on the collar. The background is accented with streaks of white and black, giving the sketch a dramatic and gritty atmosphere."
  },
  {
    id: 3,
    prompt: "Sketch Smudge, A gray and white drawing of a womans head is depicted on a white canvas background. The womans face is facing the left side of the frame, her eyes are open and her lips are slightly parted. Her hair is long and cascades over her shoulders. She is wearing a gray knitted cap, and a white scarf around her neck. The background is a vibrant red, and the womans neck is adorned with a white design."
  }
];

export async function POST(request) {
  try {
    const { imageData } = await request.json();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: "what's in this image?" },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageData}`,
              },
            },
          ],
        },
      ],
    });
    
    return NextResponse.json({ 
      success: true, 
      content: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 