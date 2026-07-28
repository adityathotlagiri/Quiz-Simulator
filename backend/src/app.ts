import express from "express";
import cors from "cors";

import teacherQuizRoutes from "./routes/teacher/quizRoutes";
import teacherConfigRoutes from "./routes/teacher/configRoutes";

import studentQuizRoutes from "./routes/quizRoutes";
import studentAttemptRoutes from "./routes/attemptRoutes";
import studentPerformanceRoutes from "./routes/performanceRoutes";
import chatRoutes from "./routes/chatRoutes";

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
app.use("/chat", chatRoutes);
app.use(cors({
  origin: "https://quiz-simulator-u5e7-4620lozja-adityathotlagiri-8938s-projects.vercel.app/",
}));
export default app;