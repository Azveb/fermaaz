import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    
    // Placeholder AI logic
    return NextResponse.json({ 
      reply: 'Təşəkkür edirik. AI Aqronom hazırda aktivdir və sualınızı təhlil edir.',
      recommendations: []
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
