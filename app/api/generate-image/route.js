import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "No prompt provided" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: "512x512",
      }),
    });

    const data = await response.json();
    
    // Check if the API response contains the expected data structure
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: data.error?.message || "Error from OpenAI API" 
        },
        { status: response.status }
      );
    }
    
    // Check if the data structure is as expected
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Unexpected API response structure:', data);
      return NextResponse.json(
        { success: false, error: "Invalid response from image generation API" },
        { status: 500 }
      );
    }

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