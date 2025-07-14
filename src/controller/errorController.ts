import { Request, Response } from 'express';

export function errorRedirectController(req: Request, res: Response,) {
    res.status(404).redirect('error');
}