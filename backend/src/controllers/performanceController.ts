import { Request, Response } from "express";
import prisma from "../utils/prisma";

// GET overall performance summary for a student (across all quizzes)
export const getStudentPerformance = async (req: Request, res: Response) => {
  try {
    const studentId: string = String(req.params.studentId);

    const attempts = await prisma.attempt.findMany({
      where: {
        studentId,
        status: { in: ["submitted", "auto_submitted"] },
      },
      include: {
        result: true,
        quiz: { select: { id: true, title: true } },
      },
      orderBy: { submittedAt: "asc" },
    });

    if (attempts.length === 0) {
      return res.json({
        success: true,
        data: {
          highestScore: 0,
          averageScore: 0,
          latestScore: 0,
          totalAttempts: 0,
          quizWise: [],
        },
      });
    }

    const percentages = attempts
      .filter((a: { result: any; }) => a.result)
      .map((a: { result: any; }) => a.result!.percentage);

    const highestScore = Math.max(...percentages);
    const averageScore =
      percentages.reduce((sum: any, p: any) => sum + p, 0) / percentages.length;
    const latestScore = percentages[percentages.length - 1];

    // group by quiz for topic/quiz-wise breakdown
    const quizMap: Record<string, { quizId: string; title: string; scores: number[]; attempts: number }> = {};

    for (const a of attempts) {
      if (!a.result) continue;
      if (!quizMap[a.quizId]) {
        quizMap[a.quizId] = {
          quizId: a.quizId,
          title: a.quiz.title,
          scores: [],
          attempts: 0,
        };
      }
      quizMap[a.quizId].scores.push(a.result.percentage);
      quizMap[a.quizId].attempts += 1;
    }

    const quizWise = Object.values(quizMap).map((q) => ({
      quizId: q.quizId,
      title: q.title,
      highest: Math.max(...q.scores),
      average: q.scores.reduce((s, v) => s + v, 0) / q.scores.length,
      latest: q.scores[q.scores.length - 1],
      totalAttempts: q.attempts,
    }));

    res.json({
      success: true,
      data: {
        highestScore,
        averageScore,
        latestScore,
        totalAttempts: attempts.length,
        quizWise,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET correct vs incorrect breakdown + weak topics (per question, aggregated across attempts)
export const getWeakAreas = async (req: Request, res: Response) => {
  try {
    const studentId: string = String(req.params.studentId);

    const responses = await prisma.response.findMany({
      where: {
        attempt: { studentId, status: { in: ["submitted", "auto_submitted"] } },
      },
      include: {
        question: { select: { id: true, questionText: true, quizId: true } },
      },
    });

    let correctCount = 0;
    let incorrectCount = 0;

    type QuestionStat = { questionId: string; questionText: string; correct: number; incorrect: number };
    const questionMap: Record<string, QuestionStat> = {};

    for (const r of responses) {
      if (r.isCorrect) correctCount++;
      else incorrectCount++;

      if (!questionMap[r.questionId]) {
        questionMap[r.questionId] = {
          questionId: r.questionId,
          questionText: r.question.questionText,
          correct: 0,
          incorrect: 0,
        };
      }
      if (r.isCorrect) questionMap[r.questionId].correct++;
      else questionMap[r.questionId].incorrect++;
    }

    // weak = questions answered incorrectly more often than correctly, min 1 attempt
    const weakTopics = Object.values(questionMap)
      .filter((q) => q.incorrect > q.correct)
      .sort((a, b) => b.incorrect - a.incorrect);

    res.json({
      success: true,
      data: {
        correctCount,
        incorrectCount,
        weakTopics,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET trend data (score over time, for chart)
export const getPerformanceTrend = async (req: Request, res: Response) => {
  try {
    const studentId: string = String(req.params.studentId);

    const attempts = await prisma.attempt.findMany({
      where: {
        studentId,
        status: { in: ["submitted", "auto_submitted"] },
      },
      include: { result: true, quiz: { select: { title: true } } },
      orderBy: { submittedAt: "asc" },
    });

    const trend = attempts
      .filter((a: { result: any; }) => a.result)
      .map((a: { id: any; quiz: { title: any; }; submittedAt: any; result: any; }) => ({
        attemptId: a.id,
        quizTitle: a.quiz.title,
        date: a.submittedAt,
        percentage: a.result!.percentage,
        passFail: a.result!.passFail,
      }));

    res.json({ success: true, data: trend });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};