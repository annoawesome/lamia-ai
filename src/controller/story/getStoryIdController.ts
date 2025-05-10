import { Response } from "express";
import { storyDao } from "../../dao/storyDao.js";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";

export async function getStoryIdController(req: AuthenticatedRequest, res: Response) {
    if (!req.username) {
        res.sendStatus(409);
        return;
    }

    const jsonString = await storyDao.getStory(req.username, req.params.storyId);
    res.status(200).set('Content-Type', 'application/json').send(jsonString);
}