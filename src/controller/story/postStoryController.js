import { storyDao } from "../../dao/storyDao.js";

export function postStoryController(req, res) {
    storyDao.createStory(req.username, JSON.stringify(req.body))
        .then((uuid) => {
            res.status(200).send(uuid);
        });
}