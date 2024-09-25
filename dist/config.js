"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3000,
    gunPeers: process.env.GUN_PEERS ? process.env.GUN_PEERS.split(',') : [],
    logLevel: process.env.LOG_LEVEL || 'info',
    enableLogRotation: process.env.ENABLE_LOG_ROTATION === 'true',
};
