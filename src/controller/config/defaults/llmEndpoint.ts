import { Request, Response } from 'express';
import { getEnvVar } from '../../../service/lamiadbService.js';

export function defaultLlmEndpointController(req: Request, res: Response) {
    res.status(200).send(getEnvVar('LAMIA_DEFAULT_LLM_ENDPOINT'));
}