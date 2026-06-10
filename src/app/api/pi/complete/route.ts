import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { paymentId, txid } = await req.json();
    
    if (!paymentId || !txid) {
      return NextResponse.json({ error: 'Missing paymentId or txid' }, { status: 400 });
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      // For Sandbox testing without API KEY, we just mock success
      console.warn("No PI_API_KEY found. Mocking completion for payment:", paymentId);
      return NextResponse.json({ message: 'Completed (Mock)' });
    }

    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Pi Network Completion Error:", errorData);
      return NextResponse.json({ error: 'Failed to complete payment' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Complete Exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
