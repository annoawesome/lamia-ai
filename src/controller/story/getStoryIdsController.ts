import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export function getStoryIdsController(req: AuthenticatedRequest, res: Response) {
    storyDao.getStoryIds(req.username)
        .then((list) => {
            res.status(200).json(list);
        });
}