import { Router, type IRouter } from "express";
import healthRouter from "./health";
import habboRouter from "./habbo";
import roomRouter from "./room";

const router: IRouter = Router();

router.use(healthRouter);
router.use(habboRouter);
router.use(roomRouter);

export default router;
