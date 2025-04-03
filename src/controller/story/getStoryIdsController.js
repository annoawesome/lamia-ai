import { storyDao } from "../../dao/storyDao.js";

export function getStoryIdsController(req, res) {
    storyDao.getStoryIds(req.username)
        .then((list) => {
            res.status(200).json(list);
        });
}