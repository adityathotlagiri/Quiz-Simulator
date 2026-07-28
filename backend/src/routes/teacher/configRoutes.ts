import { Router } from "express";
import {
  upsertPracticeConfig,
  getPracticeConfig,
  upsertExamConfig,
  getExamConfig,
} from "../../controllers/configController";

const router = Router();

router.put("/practice/:quizId", upsertPracticeConfig);
router.get("/practice/:quizId", getPracticeConfig);
router.put("/exam/:quizId", upsertExamConfig);
router.get("/exam/:quizId", getExamConfig);

export default router;