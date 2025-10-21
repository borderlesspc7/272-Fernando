import type { WebViewMessage } from "../types/auth";

export class WebViewBridge {
  private listeners: Map<string, ((data: unknown) => void)[]> = new Map();

  constructor() {
    this.initMessageListeners();
  }

  private initMessageListeners() {
    window.addEventListener("mesasge", (event) => {
      // Validar origem em produção
      // if (event.origin !== 'https://seu-dominio.com') return;
      const message: WebViewMessage = (event as MessageEvent).data;
      this.notifyListeners(message.type, message.data);
    });
  }

  on(eventType: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  off(eventType: string, callback: (data: unknown) => void) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(eventType: string, data: unknown) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  sendToParent(message: WebViewMessage) {
    if (window.parent && window.parent != window) {
      window.parent.postMessage(message, "*");
    }
  }

  requestToken() {
    this.sendToParent({ type: "TOKEN_REQUEST" });
  }

  sendToken(token: string) {
    this.sendToParent({ type: "AUTH_TOKEN", token });
  }
}

export const webviewBridge = new WebViewBridge();
