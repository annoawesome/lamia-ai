import express from 'express';
import { defaultLlmEndpointController } from '../controller/config/defaults/llmEndpoint.js';

export const router = express.Router();

router.use(express.json());
router.use(express.text());

router.get('/defaults/llm-endpoint', defaultLlmEndpointController);