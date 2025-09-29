import express from 'express';
import { defaultLlmEndpointController } from '../controller/config/defaults/llmEndpoint.js';
import { getLlmSettings } from '../controller/config/llmSettings.js';
import { authenticate } from '../middleware/authenticate.js';

export const router = express.Router();

router.use(express.json());
router.use(express.text());

router.get('/defaults/llm-endpoint', defaultLlmEndpointController);

router.use(authenticate);
router.get('/user/llm-config', getLlmSettings);