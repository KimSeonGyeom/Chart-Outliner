import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await response.json();
    const imageUrl = data.data[0].url;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 