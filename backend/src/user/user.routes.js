import {Router} from 'express';
import { createUser, login, sendEmail } from './user.controller.js';

const userRouter = Router();

// @POST api/user/signup
userRouter.post('/signup', createUser);

// @POST api/user/login
userRouter.post('/login', login);

// @POST api/user/login
userRouter.post("/send-mail", sendEmail );

export default userRouter;