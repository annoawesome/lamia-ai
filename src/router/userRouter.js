import express from 'express';
import { createUserController } from '../controller/user/createController.js';

export const router = express.Router();

router.use(express.json());
router.post('/create', createUserController);