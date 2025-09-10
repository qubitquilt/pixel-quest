# **2. Tech Stack**

This table represents the definitive list of technologies and specific versions to be used for this project. All development must adhere to this stack to ensure consistency.

| Category | Technology | Version | Purpose | Rationale |
| :---- | :---- | :---- | :---- | :---- |
| **Frontend Language** | TypeScript | \~5.x | Adds static typing to JavaScript | Enhances code quality, readability, and catches errors early. |
| **Web Framework** | Next.js | \~14.x | React framework for web applications | Provides structure, routing, and SSR capabilities for non-game screens. |
| **Game Engine** | Phaser | \~3.80.x | 2D game framework for HTML5 | Fast, free, and powerful. Ideal for 2D browser games. |
| **UI Components** | **shadcn/ui** | Latest | Accessible and composable UI components | Speeds up development of menus/lobby with high-quality, stylable components. |
| **Styling** | Tailwind CSS | \~3.x | Utility-first CSS framework | Comes with shadcn/ui and allows for rapid, consistent styling. |
| **Backend Language** | TypeScript | \~5.x | Adds static typing to JavaScript | Consistent language across the stack, improves backend code quality. |
| **Backend Framework** | Node.js | \~20.x | JavaScript runtime environment | Aligns with the JavaScript ecosystem of the frontend. |
| **Multiplayer** | Colyseus | \~0.15.x | Multiplayer game server framework for Node.js | Simplifies lobby, matchmaking, and real-time state synchronization. |
| **Containerization** | Docker | Latest | OS-level virtualization | Creates consistent, portable environments for both client and server. |
| **Infrastructure** | Google Cloud Run | N/A | Serverless container platform | Cost-effective, auto-scaling hosting for both services. |
| **Infrastructure** | Google Cloud Load Balancer | N/A | Global load balancing and CDN | Provides a single entry point, SSL, and caching for the frontend. |
| **Monorepo Tool** | npm workspaces | N/A | Manages multiple packages within one repository | Simplifies managing shared code between the client and server. |
