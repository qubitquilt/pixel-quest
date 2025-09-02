# **Story 1.1: Project Scaffolding & Basic Rendering**

## **Status**

* [ ] Draft  
* [ ] Approved  
* [ ] InProgress  
* [x] Review  
* [ ] Done

## **Story**

As a developer,  
I want to set up the monorepo structure with a PixiJS client and a Node.js server,  
so that I can render a basic game screen.

## **Acceptance Criteria**

1. A monorepo is initialized with separate packages for client and server.  
2. The client package is configured with PixiJS and can render a black 800x600 canvas in a web browser.  
3. The server package has a basic Node.js and Express setup that can serve the client application.

## **Tasks / Subtasks**

* [x] Initialize a root package.json using npm workspaces.  
* [x] Create the packages/client directory and initialize a Vite project with a JavaScript template.  
* [x] Add pixi.js as a dependency to the client package.  
* [x] Modify the client's main.js to initialize a PixiJS application and render a black canvas.  
* [x] Create the packages/server directory and initialize a new Node.js project.  
* [x] Add express as a dependency to the server package.  
* [x] Create a basic Express server in server/src/index.js.  
* [x] Configure the Express server to statically serve the built client files from the packages/client/dist directory.  
* [x] Add scripts to the root package.json to build the client and start the server.

## **Dev Notes**

This story establishes the core project structure based on the architecture documents.

### **Architecture Alignment**

* **Architectural Patterns**: Monolith Architecture, Monorepo with npm workspaces.  
* **Repository Structure**: The project will be a monorepo as defined in docs/architecture/source-tree.md.  
* **Platform**: The backend is a Node.js server, and the frontend is a PixiJS client.

### **Tech Stack**

* **Package Manager**: npm (10.x) with workspaces  
* **Backend Runtime**: Node.js (20.x LTS)  
* **Web Server**: Express (4.x)  
* **Frontend Framework**: PixiJS (7.x)  
* **Build Tool**: Vite (5.x)

### **Source Tree**

The initial structure created in this story should align with the approved architecture:

pixel-quest/  
├── packages/  
│   ├── client/  
│   │   ├── src/  
│   │   │   └── main.js  
│   │   ├── index.html  
│   │   └── package.json  
│   └── server/  
│       ├── src/  
│       │   └── index.js  
│       └── package.json  
├── package.json  
└── README.md

## **Testing**

* The developer agent should manually verify that running the server successfully serves the client application and that the PixiJS canvas is visible in the browser. Formal testing frameworks will be introduced in later stories.

## **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-01 | 1.0 | Initial draft | Scrum Master |
| 2025-09-01 | 1.1 | Status updated to Approved | Scrum Master |

## **Dev Agent Record**

### **Agent Model Used**

*TBD*

### **Debug Log References**

*TBD*

### **Completion Notes List**

*TBD*

### **File List**

* `package.json`
* `packages/client/package.json`
* `packages/client/main.js`
* `packages/server/package.json`
* `packages/server/src/index.js`
* `packages/client/vite.config.js`
* `packages/client/index.html`

## **QA Results**

*TBD*