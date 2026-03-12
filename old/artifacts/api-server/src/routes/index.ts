import { Router, type IRouter } from "express";
import healthRouter from "./health";
import habboRouter from "./habbo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(habboRouter);

export default router;
