import { Router } from "express";
import {
  startAttempt,
  submitAttempt,
  getAttemptDetail,
  getAttemptHistory,
} from "../controllers/attemptController";

const router = Router();

router.post("/start", startAttempt);
router.post("/:attemptId/submit", submitAttempt);
router.get("/:attemptId", getAttemptDetail);
router.get("/history/:quizId/:studentId", getAttemptHistory);

export default router;