import "reflect-metadata";
import '@testing-library/jest-dom';

// Mock ws module for Colyseus testing
jest.mock('ws', () => ({
  WebSocket: class {},
  WebSocketServer: class {
    constructor(options, callback) {
      this.clients = new Set();
      this.on = jest.fn();
      this.emit = jest.fn();
      this.close = jest.fn();
      if (callback) callback();
    }
    on(event, listener) {
      // Mock for events
    }
    emit(event, ...args) {
      // Mock emit
    }
    close(callback) {
      if (callback) callback();
    }
  }
}));