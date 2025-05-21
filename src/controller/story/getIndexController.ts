import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export async function getIndexController(req: AuthenticatedRequest, res: Response) {
    if (!req.username) {
        res.sendStatus(409);
        return;
    }

    const data = await storyDao.getIndex(req.username)
    res.set('Content-Type', 'application/json').status(200).send(data);
}