[![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/phaser-000?style=for-the-badge&logo=phaser&logoColor=white)](https://phaser.io)
[![Colyseus](https://img.shields.io/badge/colyseus-FF6B35?style=for-the-badge&logo=colyseus&logoColor=white)](https://colyseus.io)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)

# Pixel Quest

A multiplayer maze race game where players navigate a procedurally generated maze using a flashlight mechanic to reveal the path and reach the exit first. Built with Phaser for client-side rendering, Colyseus for real-time multiplayer, and Next.js for the web interface.

## About The Project

Pixel Quest is an engaging 2D multiplayer game focused on exploration and competition. Players join lobbies, generate mazes, and race through dark mazes illuminated only by their flashlight cone. Features include real-time synchronization, scoring, power-ups, and round progression.

Here's why:
- Solves the need for fun, accessible multiplayer browser games.
- Implements core mechanics like maze generation, visibility limiting, and win conditions.
- Follows DRY principles in a monorepo structure for shared types and logic.

Additional templates and expansions can be suggested via issues.

See the [Product Requirements Document (PRD)](docs/prd/) for detailed specs.

## Built With

This project leverages these major frameworks and libraries:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Phaser](https://phaser.io)
- [Colyseus](https://colyseus.io)
- [shadcn/ui](https://ui.shadcn.com/) (for UI components)
- [Jest](https://jestjs.io/) (for testing)

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v18 or higher)
  ```bash
  # Verify installation
  node --version
  npm --version
  ```

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/yourusername/pixel-quest.git
   cd pixel-quest
   ```

2. Install NPM packages
   ```bash
   npm install
   ```

3. Set up environment variables (create `.env.local` in packages/client and packages/server if needed)
   - For server: `PORT=2567` (Colyseus default)
   - For client: `NEXT_PUBLIC_SERVER_URL=http://localhost:2567`

4. Run the server
   ```bash
   # In a new terminal, from root
   cd packages/server
   npm run dev
   ```

5. Run the client
   ```bash
   # In another terminal, from root
   cd packages/client
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

The game lobby will be available at `/lobby/[roomId]`, and games at `/game/[roomId]`.

## Usage

1. **Host a Game**: Click "Host Game" on the home page to create a lobby and get a shareable URL.
2. **Join a Lobby**: Enter a room ID or use the shared URL to join.
3. **Start the Game**: Once players are in the lobby, the host can start the maze generation.
4. **Play**: Use WASD or arrow keys to move your player. The flashlight reveals the maze; reach the exit to win.
5. **Rounds and Scoring**: Games progress through rounds with increasing difficulty; track scores across sessions.

For more examples, refer to the [Architecture Docs](docs/architecture/) and [User Stories](docs/stories/).

## Roadmap

See the [open issues](https://github.com/yourusername/pixel-quest/issues) for a full list of proposed features and known issues.

- [x] Project setup and lobby functionality (Epic 1)
- [ ] Maze generation and display (Epic 2)
- [ ] Player movement and state sync (Epic 3)
- [ ] Core gameplay: Flashlight and win conditions (Epic 4)
- [ ] Scoring and round progression (Epic 5)
- [ ] Power-up system (Epic 6)
- [ ] Additional features: Multi-language support, mobile optimization

Future:
- Add changelog automation
- Enhance UI with more shadcn components
- Integrate analytics

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information. (Create a LICENSE file with MIT template if not present.)

## Contact

Your Name - [@your_twitter](https://twitter.com/your_username) - email@example.com

Project Link: [https://github.com/yourusername/pixel-quest](https://github.com/yourusername/pixel-quest)

## Acknowledgments

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template) inspired this structure.
- [Choose an Open Source License](https://choosealicense.com)
- [Phaser Examples](https://phaser.io/examples)
- [Colyseus Documentation](https://docs.colyseus.io)
- [shadcn/ui](https://ui.shadcn.com/)
