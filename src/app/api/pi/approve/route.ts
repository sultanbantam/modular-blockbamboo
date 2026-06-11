import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json();
    
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      console.error("PI_API_KEY is missing in environment variables. You must set it in Vercel.");
      return NextResponse.json({ error: 'Server misconfiguration: Missing PI_API_KEY' }, { status: 500 });
    }

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Pi Network Approval Error:", errorData);
      return NextResponse.json({ error: 'Failed to approve payment' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Approve Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
