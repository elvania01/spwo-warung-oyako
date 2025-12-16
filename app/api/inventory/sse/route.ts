// app/api/inventory/sse/route.ts - SIMPLE VERSION
import { NextRequest } from 'next/server';

const inventoryClients = new Map();

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Date.now().toString();
      
      const welcomeMessage = {
        type: 'CONNECTED', 
        clientId,
        message: 'Connected to inventory updates'
      };
      
      controller.enqueue(`data: ${JSON.stringify(welcomeMessage)}\n\n`);

      // Simpan client
      inventoryClients.set(clientId, { controller });

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        inventoryClients.delete(clientId);
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

// Simple broadcast function
export function broadcastInventoryUpdate(action: string, data: any) {
  const message = {
    type: 'INVENTORY_UPDATE',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  const sseMessage = `data: ${JSON.stringify(message)}\n\n`;
  
  // Simple loop tanpa complexity
  inventoryClients.forEach((client, clientId) => {
    try {
      client.controller.enqueue(sseMessage);
    } catch (error) {
      inventoryClients.delete(clientId);
    }
  });
}