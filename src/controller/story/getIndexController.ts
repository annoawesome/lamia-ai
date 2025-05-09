import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";

export function getIndexController(req: AuthenticatedRequest, res: Response) {
    storyDao.getIndex(req.username, JSON.stringify(req.body))
        .then((data) => res.set('Content-Type', 'application/json').status(200).send(data));
}