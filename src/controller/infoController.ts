import { Request, Response } from 'express';
import { getEnvVar } from '../util/env.js';

export function getInfoController(req: Request, res: Response) {
    res.json({
        backendName: getEnvVar('LAMIA_BACKEND_NAME'),
        version: getEnvVar('LAMIA_VERSION_LABEL'),
    });
}