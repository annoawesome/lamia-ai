import { storyDao } from "../../dao/storyDao.js";

export function postIndexController(req, res) {
    storyDao.writeIndex(req.username, JSON.stringify(req.body))
        .then(() => res.sendStatus(200));
}