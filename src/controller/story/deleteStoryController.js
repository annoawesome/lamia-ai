import { storyDao } from "../../dao/storyDao.js";

export function deleteStoryController(req, res) {
    storyDao.deleteStory(req.username, req.params.storyId)
        .then(() => {
            res.sendStatus(200);
        });
}