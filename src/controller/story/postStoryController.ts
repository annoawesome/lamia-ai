import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export function postStoryController(req: AuthenticatedRequest, res: Response) {
    storyDao.createStory(req.username, JSON.stringify(req.body))
        .then((uuid) => {
            res.status(200).send(uuid);
        });
}