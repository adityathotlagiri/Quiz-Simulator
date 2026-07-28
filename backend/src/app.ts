import express from "express";
import cors from "cors";

import teacherQuizRoutes from "./routes/teacher/quizRoutes";
import teacherConfigRoutes from "./routes/teacher/configRoutes";

import studentQuizRoutes from "./routes/quizRoutes";
import studentAttemptRoutes from "./routes/attemptRoutes";
import studentPerformanceRoutes from "./routes/performanceRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Teacher routes
app.use("/teacher/quizzes", teacherQuizRoutes);
app.use("/teacher/config", teacherConfigRoutes);

// Student routes
app.use("/student/quizzes", studentQuizRoutes);
app.use("/student/attempts", studentAttemptRoutes);
app.use("/student/performance", studentPerformanceRoutes);

export default app;