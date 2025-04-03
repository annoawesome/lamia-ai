import { storyDao } from "../../dao/storyDao.js";

export function getStoryIdController(req, res) {
    storyDao.getStory(req.username, req.params.storyId)
        .then(jsonString => {
            res.status(200).set('Content-Type', 'application/json').send(jsonString);
        });
}