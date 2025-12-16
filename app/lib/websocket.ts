// lib/websocket.ts - FIXED VERSION
// 'use server';

// Simpan client connections
export const clients = new Set<WebSocket>();

export async function broadcastToClients(table: string, action: string, data: any) {
  if (clients.size === 0) {
    console.log('⚠️ No connected clients to broadcast to');
    return;
  }

  const message = JSON.stringify({ 
    table, 
    action, 
    data,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  let deadConnections = 0;

  clients.forEach((client) => {
    try {
      if (client.readyState === 1) {
        client.send(message);
        sentCount++;
      } else {
        deadConnections++;
      }
    } catch {
      deadConnections++;
    }
  });

  if (deadConnections > 0) {
    clients.forEach(c => c.readyState !== 1 && clients.delete(c));
  }

  console.log(`Broadcast done: ${sentCount}/${clients.size}`);
}