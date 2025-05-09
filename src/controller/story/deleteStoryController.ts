import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export function deleteStoryController(req: AuthenticatedRequest, res: Response) {
    storyDao.deleteStory(req.username, req.params.storyId)
        .then(() => {
            res.sendStatus(200);
        });
}