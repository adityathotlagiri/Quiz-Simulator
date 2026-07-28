import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { gradeResponse } from "../utils/grading";

// START an attempt (practice or exam)
export const startAttempt = async (req: Request, res: Response) => {
  try {
    const { quizId, studentId, mode } = req.body; // mode: 'practice' | 'exam'

    if (mode === "practice") {
      const config = await prisma.practiceConfig.findUnique({ where: { quizId } });
      if (config?.allowedAttempts) {
        const attemptsUsed = await prisma.attempt.count({
          where: { quizId, studentId, mode: "practice" },
        });
        if (attemptsUsed >= config.allowedAttempts) {
          return res.status(403).json({
            success: false,
            message: "No attempts remaining for this practice test",
          });
        }
      }
    }

    if (mode === "exam") {
      const config = await prisma.examConfig.findUnique({ where: { quizId } });
      if (!config) {
        return res.status(400).json({ success: false, message: "Exam not configured" });
      }
      const now = new Date();
      if (now < config.scheduledStart || now > config.scheduledEnd) {
        return res.status(403).json({ success: false, message: "Exam is not currently available" });
      }
      const existing = await prisma.attempt.findFirst({
        where: { quizId, studentId, mode: "exam" },
      });
      if (existing) {
        return res.status(403).json({ success: false, message: "Exam already attempted" });
      }
    }

    const attemptCount = await prisma.attempt.count({
      where: { quizId, studentId, mode },
    });

    const attempt = await prisma.attempt.create({
      data: {
        quizId,
        studentId,
        mode,
        attemptNumber: attemptCount + 1,
        status: "in_progress",
      },
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// SUBMIT an attempt (grades everything, creates Result)
export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const attemptId: string = String(req.params.attemptId);
    const { responses, autoSubmitted } = req.body;
    // responses: array of { questionId, selectedOptionIds: string[] }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { quiz: true },
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    if (attempt.status !== "in_progress") {
      return res.status(400).json({ success: false, message: "Attempt already submitted" });
    }

    const questions = await prisma.question.findMany({
      where: { quizId: attempt.quizId },
      include: { options: true },
    });

    let obtainedMarks = 0;

    const createdResponses = [];

    for (const r of responses) {
      const question = questions.find((q: { id: any; }) => q.id === r.questionId);
      if (!question) continue;

      const correctOptionIds = question.options
        .filter((o: { isCorrect: any; }) => o.isCorrect)
        .map((o: { id: any; }) => o.id);

      const isCorrect = gradeResponse(correctOptionIds, r.selectedOptionIds || []);
      const marksObtained = isCorrect ? question.marks : 0;
      obtainedMarks += marksObtained;

      createdResponses.push(
        prisma.response.create({
          data: {
            attemptId,
            questionId: question.id,
            selectedOptionIds: r.selectedOptionIds || [],
            isCorrect,
            marksObtained,
          },
        })
      );
    }

    await Promise.all(createdResponses);

    const totalMarks = attempt.quiz.totalMarks;
    const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
    const passFail = percentage >= attempt.quiz.passingPercentage;

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: autoSubmitted ? "auto_submitted" : "submitted",
        submittedAt: new Date(),
      },
    });

    const result = await prisma.result.create({
      data: {
        attemptId,
        totalMarks,
        obtainedMarks,
        percentage,
        passFail,
      },
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET attempt detail with responses + result (used for review/explanation screen)
export const getAttemptDetail = async (req: Request, res: Response) => {
  try {
    const attemptId: string = String(req.params.attemptId);

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        responses: {
          include: {
            question: {
              include: { options: true },
            },
          },
        },
        result: true,
        quiz: true,
      },
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: "Attempt not found" });
    }

    res.json({ success: true, data: attempt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET attempt history for a student on a quiz (for "compare previous attempts")
export const getAttemptHistory = async (req: Request, res: Response) => {
  try {
    const quizId: string = String(req.params.quizId);
    const studentId: string = String(req.params.studentId);
    const mode = req.query.mode ? String(req.query.mode) : undefined;

    const attempts = await prisma.attempt.findMany({
      where: {
        quizId,
        studentId,
        ...(mode ? { mode: mode as any } : {}),
      },
      orderBy: { attemptNumber: "asc" },
      include: { result: true },
    });

    res.json({ success: true, data: attempts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};