export function log(msg) {
    console.log(`[INFO]  ${msg}`);
}

export function warn(msg) {
    console.log(`[INFO]  ${msg}`);
}

export function error(msg) {
    console.log(`[ERROR] ${msg}`);
}

export function logSource(req, res, next) {
    // console.log(`[INFO] "${req.method} ${req.originalUrl}" from ${req.ip}`);
    log(`"${req.method} ${req.originalUrl}" from ${req.ip}`);
    next();
}