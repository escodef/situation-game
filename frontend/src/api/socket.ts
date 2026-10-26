import { ESocketIncomeEvent, ESocketOutcomeEvent } from '@/types';
import { useToastStore } from '@/stores/toast';

type MessageHandler = (data: any) => void;

class SocketService {
  private ws: WebSocket | null = null;
  private handlers = new Map<ESocketOutcomeEvent, Set<MessageHandler>>();
  private pendingMessages: string[] = [];

  connect(token: string) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
    this.ws = new WebSocket(`${wsUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('⚡ WS соединение установлено');
      while (this.pendingMessages.length > 0) {
        const msg = this.pendingMessages.shift();
        if (msg) this.ws?.send(msg);
      }
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

    this.ws.onclose = (ev) => {
      console.log('💤 WS отключен', ev.code, ev.reason);
      if (ev.code === 4000) {
        const toast = useToastStore();
        toast.warning(ev.reason || 'Вы вошли с другого устройства');
      }
    };
  }

  send(event: ESocketIncomeEvent, data?: any) {
    const payload = JSON.stringify(data !== undefined ? { event, data } : { event });
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else {
      this.pendingMessages.push(payload);
    }
  }

  on(event: ESocketOutcomeEvent, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  clearHandlers() {
    this.handlers.clear();
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.pendingMessages = [];
  }
}

export const socket = new SocketService();