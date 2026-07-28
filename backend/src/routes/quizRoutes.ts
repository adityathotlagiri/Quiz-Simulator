import { Router } from "express";
import { getQuizzes, getQuizById } from "../controllers/quizController";

const router = Router();

// Students only browse/view quizzes — creation/editing stays teacher-only
router.get("/", getQuizzes); // frontend should call with ?status=published
router.get("/:id", getQuizById);

export default router;