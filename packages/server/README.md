# Server Package

This package contains the Colyseus server for the Pixel Quest game.

## Development

Run the development server with:

```bash
pnpm dev
```

## Production

To build and run in production:

1. Build the shared package and server:
   ```bash
   cd packages/server
   pnpm build
   ```

2. Run the production server:
   ```bash
   pnpm start
   ```

The server will listen on port 2567 (or PORT env var) for WebSocket connections and HTTP requests.

### Dependencies

- Ensure the shared package is built first, as it contains types and schemas used by the server.