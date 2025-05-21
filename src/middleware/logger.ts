import { NextFunction, Request, Response } from "express";

export function log(msg: any) {
    console.log(`[INFO]:  ${msg}`);
}

export function warn(msg: any) {
    console.log(`[WARN]:  ${msg}`);
}

export function error(msg: any) {
    console.log(`[ERROR]: ${msg}`);
}

export function logSource(req: Request, res: Response, next: NextFunction) {
    log(`"${req.method} ${req.originalUrl}" from ${req.ip}`);
    next();
}