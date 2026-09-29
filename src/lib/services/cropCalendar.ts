import { prisma } from '@/lib/prisma';
import type { CropType } from '@prisma/client';

export interface CropStageInfo {
  stage: string;
  daysAfterPlanting: number;
  currentStage: string;
  daysIntoCurrentStage: number;
  nextStage: string | null;
  daysToNextStage: number | null;
  stages: Array<{ stage: string; daysFromSow: number }>;
}

export async function getCropStage(crop: CropType, plantingDate: Date): Promise<CropStageInfo> {
  const stages = await prisma.cropCalendarStage.findMany({
    where: { crop },
    orderBy: { daysFromSow: 'asc' },
  });

  const daysAfterPlanting = Math.max(
    0,
    Math.floor((Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  let current = stages[0];
  let next = stages[1] ?? null;
  for (let i = 0; i < stages.length; i++) {
    if (stages[i].daysFromSow <= daysAfterPlanting) {
      current = stages[i];
      next = stages[i + 1] ?? null;
    }
  }

  return {
    stage: current?.stage ?? 'unknown',
    daysAfterPlanting,
    currentStage: current?.stage ?? 'unknown',
    daysIntoCurrentStage: current ? daysAfterPlanting - current.daysFromSow : 0,
    nextStage: next?.stage ?? null,
    daysToNextStage: next ? next.daysFromSow - daysAfterPlanting : null,
    stages: stages.map((s) => ({ stage: s.stage, daysFromSow: s.daysFromSow })),
  };
}
