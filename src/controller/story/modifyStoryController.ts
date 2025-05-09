import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export function modifyStoryController(req: AuthenticatedRequest, res: Response) {
    storyDao.modifyStory(req.username, req.params.storyId, JSON.stringify(req.body))
        .then((uuid) => {
            res.status(200).send(uuid);
        });
}