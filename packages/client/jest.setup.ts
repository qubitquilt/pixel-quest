import "reflect-metadata";
import '@testing-library/jest-dom';

// Mock ws module for Colyseus testing
jest.mock('ws', () => ({
  WebSocket: class {},
  WebSocketServer: class {
    clients: Set<any>;
    on: jest.Mock<any, any>;
    emit: jest.Mock<any, any>;
    close: jest.Mock<any, any>;
    constructor(options: any, callback?: () => void) {
      this.clients = new Set();
      this.on = jest.fn();
      this.emit = jest.fn();
      this.close = jest.fn();
      if (callback) callback();
    }
  }
}));

// Suppress console output during tests for cleaner run logs
console.log = jest.fn();
console.error = jest.fn();