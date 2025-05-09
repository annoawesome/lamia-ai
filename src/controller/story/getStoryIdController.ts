import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export function getStoryIdController(req: AuthenticatedRequest, res: Response) {
    return storyDao.getStory(req.username, req.params.storyId)
        .then(jsonString => {
            res.status(200).set('Content-Type', 'application/json').send(jsonString);
        });
}