import { Client } from "colyseus.js";

const host = process.env.NEXT_PUBLIC_COLYSEUS_HOST || "ws://localhost:2567";
export const client = new Client(host);
