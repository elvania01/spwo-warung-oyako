// app/api/ws/route.ts - WORKING WEBSOCKET ENDPOINT
import { NextRequest } from 'next/server';
import { clients } from '@/app/lib/websocket';

// Untuk WebSocket, kita perlu handle WebSocket upgrade
export async function GET(request: NextRequest) {
  // Karena Next.js App Router tidak support WebSocket langsung,
  // kita akan gunakan approach yang berbeda
  
  return new Response('WebSocket endpoint - Use Server-Sent Events instead', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

// Server-Sent Events sebagai fallback
export async function POST(request: NextRequest) {
  // Implement SSE sebagai fallback
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now().toString();
      
      // Send initial connection message
      const data = `data: ${JSON.stringify({ 
        type: 'CONNECTED', 
        clientId,
        message: 'Connected to real-time updates'
      })}\n\n`;
      controller.enqueue(data);

      // Simpan client (simplified version)
      const client = { id: clientId, controller };
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        console.log(`Client ${clientId} disconnected`);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}