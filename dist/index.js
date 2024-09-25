"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultDatabase = exports.Gun = exports.errorHandler = void 0;
exports.createGun = createGun;
exports.createDatabase = createDatabase;
const gun_1 = __importDefault(require("gun"));
exports.Gun = gun_1.default;
const config_1 = require("./config");
const database_1 = require("./database");
const logger_1 = require("./logger");
var middleware_1 = require("./middleware");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return middleware_1.errorHandler; } });
__exportStar(require("./errors"), exports);
__exportStar(require("./model"), exports);
__exportStar(require("./database"), exports);
__exportStar(require("./middleware"), exports);
__exportStar(require("./logger"), exports);
__exportStar(require("./config"), exports);
function createGun(config = {}) {
    const mergedConfig = { ...config_1.config, ...config };
    return (0, gun_1.default)({
        peers: mergedConfig.gunPeers
    });
}
function createDatabase(gun) {
    return new database_1.Database(gun);
}
// Initialize with default configuration
const defaultGun = createGun();
exports.defaultDatabase = createDatabase(defaultGun);
logger_1.logger.info('GunDB library initialized');
