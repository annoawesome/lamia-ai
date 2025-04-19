export function log(msg) {
    console.log(`[INFO]:  ${msg}`);
}

export function warn(msg) {
    console.log(`[WARN]:  ${msg}`);
}

export function error(msg) {
    console.log(`[ERROR]: ${msg}`);
}

export function logSource(req, res, next) {
    log(`"${req.method} ${req.originalUrl}" from ${req.ip}`);
    next();
}