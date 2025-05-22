import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export async function modifyStoryController(req: AuthenticatedRequest, res: Response) {
    if (!req.username) {
        res.sendStatus(409);
        return;
    }

    const uuid = await storyDao.modifyStory(req.username, req.params.storyId, JSON.stringify(req.body));
    res.status(200).send(uuid);
}