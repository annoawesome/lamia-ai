import { Request, Response } from 'express';

export function getInfoController(req: Request, res: Response) {
    res.json({
        backendName: process.env.LAMIA_BACKEND_NAME,
        version: process.env.LAMIA_VERSION_LABEL,
    });
}