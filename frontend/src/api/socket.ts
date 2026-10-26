import { ESocketIncomeEvent, ESocketOutcomeEvent } from '@/types';

type MessageHandler = (data: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private handlers = new Map<ESocketOutcomeEvent, Set<MessageHandler>>();

  connect(token: string) {
    if (this.ws) {
      this.ws.close();
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('⚡ WS соединение установлено');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event) {
          const callbacks = this.handlers.get(message.event);
          callbacks?.forEach((cb) => cb(message.data));
        }
      } catch (err) {
        console.error('Ошибка парсинга WS сообщения:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('💤 WS отключен');
    };
  }

  send(event: ESocketIncomeEvent, data?: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    } else {
      console.warn('WS не подключен или закрыт');
    }
  }

  on(event: ESocketOutcomeEvent, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: ESocketOutcomeEvent, handler: MessageHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }
}

export const socket = new SocketService();