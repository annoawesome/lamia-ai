import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export function postIndexController(req: AuthenticatedRequest, res: Response) {
    storyDao.writeIndex(req.username, JSON.stringify(req.body))
        .then(() => res.sendStatus(200));
}