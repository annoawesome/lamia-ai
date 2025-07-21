import { startServer } from "./server.js";
import { fixPaths, loadEnv } from "./util/appInit.js";

// Starts the server
function init() {
    loadEnv();
    fixPaths(undefined);
    startServer();
}

init();
