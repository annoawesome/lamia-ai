import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate.js";
import { getUserConfig } from "../../dao/configDao.js";

export async function getLlmSettings(req: AuthenticatedRequest, res: Response) {
    if (!req.username) {
        res.sendStatus(409);
        return;
    }

    const config = await getUserConfig(req.username);
    res.status(200).json(config);
}