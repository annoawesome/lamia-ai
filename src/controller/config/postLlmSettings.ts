import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";
import { setUserConfig } from "../../dao/configDao.js";

export async function postLlmSettings(req: AuthenticatedRequest, res: Response) {
    if (!req.username) {
        res.sendStatus(409);
        return;
    }

    const success = await setUserConfig(req.username, JSON.parse(req.body).formData);
    res.sendStatus(success ? 200 : 403);
}