import {Router} from 'express';
import { createUser, login, sendEmail, verifyToken, changePassword, logout, getAllUsers, updateStatus } from './user.controller.js';
import { forgotPassword } from './user.controller.js';
import { AdminUserGuard, verifyTokenGuard, AdminGuard } from '../middleware/guard.middleware.js';

const userRouter = Router();

// @POST api/user/signup
userRouter.post('/signup', createUser);

// @POST api/user/login
userRouter.post('/login', login);

// @GET api/user/logout
userRouter.get('/logout', logout);

// @GET api/user/get
userRouter.get('/get', AdminGuard, getAllUsers);

// @GET api/user/status
userRouter.put('/status/:id', AdminGuard, updateStatus);

// @POST api/user/login
userRouter.post("/send-mail", sendEmail );

// @POST api/user/forgot-password
userRouter.post("/forgot-password", forgotPassword);

// @POST api/user/verify-token
userRouter.post("/verify-token",verifyTokenGuard, verifyToken);

// @PUT api/user/verify-token
userRouter.put("/change-password",verifyTokenGuard, changePassword);

// @GET api/user/session
userRouter.get("/session",AdminUserGuard, (req, res) => {return res.json(req.user);
});

export default userRouter;