import { storyDao } from "../../dao/storyDao.js";

export function modifyStoryController(req, res) {
    storyDao.modifyStory(req.username, req.params.storyId, req.body)
        .then((uuid) => {
            res.status(200).send(uuid);
        });
}