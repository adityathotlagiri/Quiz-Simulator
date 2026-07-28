import { Request, Response } from "express";
import prisma from "../utils/prisma";

// CREATE quiz (with nested questions + options)
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      instructions,
      durationMinutes,
      totalMarks,
      passingPercentage,
      status,
      createdBy,
      questions,
      assessmentMode, // 'practice' | 'exam'
      // practice fields
      allowedAttempts,
      hasTimer,
      // exam fields
      scheduledStart,
      scheduledEnd,
      randomizeQuestions,
    } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        instructions,
        durationMinutes,
        totalMarks,
        passingPercentage,
        status: status || "draft",
        createdBy,
        assessmentMode: assessmentMode || "practice",
        randomizeQuestions: randomizeQuestions ?? false,
        questions: {
          create: (questions || []).map((q: any) => ({
            questionText: q.questionText,
            type: q.type,
            marks: q.marks,
            orderIndex: q.orderIndex,
            explanation: q.explanation,
            options: {
              create: (q.options || []).map((o: any) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { options: true } } },
    });

    // Create the matching config right away
    if (assessmentMode === "exam") {
      await prisma.examConfig.create({
        data: {
          quizId: quiz.id,
          scheduledStart: new Date(scheduledStart),
          scheduledEnd: new Date(scheduledEnd),
          durationMinutes,
          isActive: true,
        },
      });
    } else {
      await prisma.practiceConfig.create({
        data: {
          quizId: quiz.id,
          allowedAttempts: allowedAttempts ?? null,
          hasTimer: hasTimer ?? false,
          durationMinutes: hasTimer ? durationMinutes : null,
          isActive: true,
        },
      });
    }

    res.status(201).json({ success: true, data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all quizzes
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const status: string | undefined = req.query.status
      ? String(req.query.status)
      : undefined;
    const createdBy: string | undefined = req.query.createdBy
      ? String(req.query.createdBy)
      : undefined;

    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(createdBy ? { createdBy } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { questions: true } },
        practiceConfig: true,
        examConfig: true,
      },
    });

    res.json({ success: true, data: quizzes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET single quiz
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const id: string = String(req.params.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: { options: true },
        },
        practiceConfig: true,
        examConfig: true,
      },
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    res.json({ success: true, data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE quiz
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const id: string = String(req.params.id);
    const {
      title,
      description,
      instructions,
      durationMinutes,
      totalMarks,
      passingPercentage,
      status,
      questions,
      assessmentMode,
      allowedAttempts,
      hasTimer,
      scheduledStart,
      scheduledEnd,
      randomizeQuestions,
    } = req.body;

    await prisma.question.deleteMany({ where: { quizId: id } });

    const quiz = await prisma.quiz.update({
      where: { id },
      data: {
        title,
        description,
        instructions,
        durationMinutes,
        totalMarks,
        passingPercentage,
        status,
        assessmentMode,
        randomizeQuestions: randomizeQuestions ?? false,
        questions: {
          create: (questions || []).map((q: any) => ({
            questionText: q.questionText,
            type: q.type,
            marks: q.marks,
            orderIndex: q.orderIndex,
            explanation: q.explanation,
            options: {
              create: (q.options || []).map((o: any) => ({
                optionText: o.optionText,
                isCorrect: o.isCorrect,
              })),
            },
          })),
        },
      },
      
      include: { questions: { include: { options: true } } },
    });

    if (assessmentMode === "exam") {
      await prisma.examConfig.upsert({
        where: { quizId: id },
        update: {
          scheduledStart: new Date(scheduledStart),
          scheduledEnd: new Date(scheduledEnd),
          durationMinutes,
        },
        create: {
          quizId: id,
          scheduledStart: new Date(scheduledStart),
          scheduledEnd: new Date(scheduledEnd),
          durationMinutes,
          isActive: true,
        },
      });
    } else {
      await prisma.practiceConfig.upsert({
        where: { quizId: id },
        update: {
          allowedAttempts: allowedAttempts ?? null,
          hasTimer: hasTimer ?? false,
          durationMinutes: hasTimer ? durationMinutes : null,
        },
        create: {
          quizId: id,
          allowedAttempts: allowedAttempts ?? null,
          hasTimer: hasTimer ?? false,
          durationMinutes: hasTimer ? durationMinutes : null,
          isActive: true,
        },
      });
    }

    res.json({ success: true, data: quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// DELETE quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const id: string = String(req.params.id);
    await prisma.quiz.delete({ where: { id } });
    res.json({ success: true, message: "Quiz deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};