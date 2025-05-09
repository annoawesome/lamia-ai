import express from 'express';
import { createUserController } from '../controller/user/createController.js';
import { postLoginController } from '../controller/user/loginController.js';

export const router = express.Router();

router.use(express.json());
router.post('/create', createUserController);
router.post('/login', postLoginController);