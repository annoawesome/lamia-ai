import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export async function postIndexController(req: AuthenticatedRequest, res: Response) {
    if (!req.username) {
        res.sendStatus(409);
        return;
    }

    await storyDao.writeIndex(req.username, JSON.stringify(req.body))
    res.sendStatus(200)
}