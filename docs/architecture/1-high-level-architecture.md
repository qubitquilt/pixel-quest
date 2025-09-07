# **1. High-Level Architecture**

## **1.1. Technical Summary**

This architecture describes a modern fullstack web application hosted entirely on Google Cloud Platform (GCP). It is composed of two containerized services: a game client and a real-time multiplayer backend, both running on Google Cloud Run. The client will be built using Phaser within a Next.js web application. The backend will be a dedicated Node.js server running the Colyseus framework. This setup provides a clear separation of concerns, excellent scalability, and a unified infrastructure environment.

## **1.2. Platform and Infrastructure Choice**

* **Platform:** **Google Cloud Platform (GCP)**. We will use a single cloud provider for all hosting, which simplifies billing, networking, and identity management.  
* **Frontend Hosting:** **Google Cloud Run**. The Next.js client application will be containerized using Docker and deployed as a serverless service. A **Google Cloud Load Balancer** with **Cloud CDN** enabled will be placed in front of this service to provide global caching, a custom domain, and SSL.  
* **Backend Hosting:** **Google Cloud Run**. The Colyseus Node.js server will also be containerized and deployed as a separate, independently scalable service. This service will be configured to support WebSocket connections for real-time communication.

## **1.3. Repository Structure**

* **Structure:** **Monorepo**. We will use a single Git repository to hold both the frontend and backend code. This simplifies dependency management and ensures the client and server logic stay in sync.  
* **Monorepo Tool:** We'll use **npm workspaces**, which is built into Node.js and provides a simple way to manage the two separate packages (client and server) within one repository.

## **1.4. High-Level Architecture Diagram**

graph TD  
    subgraph Browser  
        P\[Player's Device\]  
    end

    subgraph Internet  
        P \-- HTTPS --\> LB\[Google Cloud Load Balancer \+ CDN\]  
        P \-- WebSocket --\> S\_GCR\[Game Server on Cloud Run\]  
    end  
      
    subgraph "Google Cloud Platform"  
        LB \--\> C\_GCR\[Client on Cloud Run\]  
        S\_GCR \-- Runs --\> S\[Colyseus Node.js Server\]  
        C\_GCR \-- Serves --\> C\[Phaser/Next.js Client\]  
    end

    C \-- Connects to --\> S

## **1.5. Architectural Patterns**

* **Client-Server:** A classic and necessary pattern for multiplayer games. The Colyseus server will be the authoritative source of game state, while the Phaser clients will render that state and send user inputs.  
* **Monorepo:** Using a single repository for both client and server code simplifies development, testing, and deployment.  
* **Containerization:** Both the client and server applications will be packaged as Docker containers, ensuring consistent environments from local development to production.  
* **Component-Based UI:** The game's non-gameplay screens (Lobby, Menus) will be built using reusable React components. We will use **shadcn/ui** for pre-built, accessible components which can be styled to match our game's theme, combined with custom components where needed.
