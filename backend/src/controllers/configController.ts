import { Request, Response } from "express";
import prisma from "../utils/prisma";

// CREATE or UPDATE practice config for a quiz (upsert)
export const upsertPracticeConfig = async (req: Request, res: Response) => {
  try {
    const quizId: string = String(req.params.quizId);
    const { allowedAttempts, hasTimer, durationMinutes, isActive } = req.body;

    const config = await prisma.practiceConfig.upsert({
      where: { quizId },
      update: {
        allowedAttempts,
        hasTimer,
        durationMinutes,
        isActive,
      },
      create: {
        quizId,
        allowedAttempts,
        hasTimer,
        durationMinutes,
        isActive: isActive ?? true,
      },
    });

    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET practice config for a quiz
export const getPracticeConfig = async (req: Request, res: Response) => {
  try {
    const quizId: string = String(req.params.quizId);
    const config = await prisma.practiceConfig.findUnique({ where: { quizId } });

    if (!config) {
      return res.status(404).json({ success: false, message: "Practice config not found" });
    }

    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE or UPDATE exam config for a quiz (upsert)
export const upsertExamConfig = async (req: Request, res: Response) => {
  try {
    const quizId: string = String(req.params.quizId);
    const { scheduledStart, scheduledEnd, durationMinutes, isActive } = req.body;

    const config = await prisma.examConfig.upsert({
      where: { quizId },
      update: {
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        durationMinutes,
        isActive,
      },
      create: {
        quizId,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        durationMinutes,
        isActive: isActive ?? true,
      },
    });

    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET exam config for a quiz
export const getExamConfig = async (req: Request, res: Response) => {
  try {
    const quizId: string = String(req.params.quizId);
    const config = await prisma.examConfig.findUnique({ where: { quizId } });

    if (!config) {
      return res.status(404).json({ success: false, message: "Exam config not found" });
    }

    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};