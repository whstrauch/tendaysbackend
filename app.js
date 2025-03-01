import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from 'cors';
import { initialize } from "./gameFunctions.js";

const local = "http://localhost:3000"
const publicURL = "https://tendays-a1e2d.web.app"

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: publicURL
    }
  });

app.use(cors());

// Need to update socket.id on reconnect

io.on("connection", (socket) => {
    console.log("Connection from:", socket.id)
    initialize(io, socket);
});

httpServer.listen(process.env.PORT || 8000, () => console.log("Server running on port 8000..."));
