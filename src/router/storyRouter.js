import express from 'express';
import { getStoryIdController } from '../controller/story/getStoryIdController.js';
import { postStoryController } from '../controller/story/postStoryController.js';
import { authenticate } from '../middleware/authenticate.js';
import { modifyStoryController } from '../controller/story/modifyStoryController.js';
import { getStoryIdsController } from '../controller/story/getStoryIdsController.js';

export const router = express.Router();

router.use(express.json());
router.use(express.text());
router.use(authenticate);
router.get('/:storyId', getStoryIdController);
router.post('/', postStoryController);
router.post('/:storyId', modifyStoryController);
router.get('/ids', getStoryIdsController);
router.get('/index'); // convenient encrypted list of story names. Dont have to decrypt every single id
router.post('/index');