import { Router } from "express";
import {
  getStudentPerformance,
  getWeakAreas,
  getPerformanceTrend,
} from "../controllers/performanceController";

const router = Router();

router.get("/:studentId/summary", getStudentPerformance);
router.get("/:studentId/weak-areas", getWeakAreas);
router.get("/:studentId/trend", getPerformanceTrend);

export default router;