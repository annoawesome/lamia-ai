import express from 'express';
import { getStoryIdController } from '../controller/story/getStoryIdController.js';
import { postStoryController } from '../controller/story/postStoryController.js';
import { authenticate } from '../middleware/authenticate.js';
import { modifyStoryController } from '../controller/story/modifyStoryController.js';
import { getStoryIdsController } from '../controller/story/getStoryIdsController.js';
import { getIndexController } from '../controller/story/getIndexController.js';
import { postIndexController } from '../controller/story/postIndexController.js';

export const router = express.Router();

router.use(express.json());
router.use(express.text());
router.use(authenticate);
router.get('/content/:storyId', getStoryIdController);
router.post('/content', postStoryController);
router.post('/content/:storyId', modifyStoryController);
router.get('/ids', getStoryIdsController);
router.get('/index', getIndexController); // convenient encrypted list of story names. Dont have to decrypt every single id
router.post('/index', postIndexController);