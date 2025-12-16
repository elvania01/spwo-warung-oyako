// components/WebSocketClient.tsx
'use client';
import { useEffect } from 'react';

export default function WebSocketClient() {
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔗 WebSocket connected to server');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', message);
        
        // Handle different types of updates
        switch (message.table) {
          case 'petty_cash':
            handlePettyCashUpdate(message.action, message.data);
            break;
          case 'inventory':
            handleInventoryUpdate(message.action, message.data);
            break;
          default:
            console.log('Unknown table update:', message.table);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      // Attempt reconnect after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const handlePettyCashUpdate = (action: string, data: any) => {
    console.log('💰 Petty Cash Update:', action, data);
    
    // Refresh petty cash data
    if (action === 'INSERT' || action === 'UPDATE' || action === 'DELETE') {
      // Dispatch custom event untuk refresh components
      window.dispatchEvent(new CustomEvent('pettyCashUpdated', { 
        detail: { action, data } 
      }));
      
      // Show notification
      if (action === 'INSERT') {
        showNotification('Petty Cash added: ' + data.description);
      }
    }
  };

  const handleInventoryUpdate = (action: string, data: any) => {
    console.log('📦 Inventory Update:', action, data);
    
    if (action === 'INSERT' || action === 'UPDATE' || action === 'IMPORT') {
      // Dispatch custom event untuk refresh inventory
      window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
        detail: { action, data } 
      }));
      
      // Show notification for imports
      if (action === 'IMPORT') {
        showNotification(`Inventory imported: ${data.importedCount} items`);
      }
    }
  };

  const showNotification = (message: string) => {
    // Simple browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SPWO Update', { body: message });
    }
    
    // Or show alert
    console.log('🔔', message);
  };

  return null; // This component doesn't render anything
}