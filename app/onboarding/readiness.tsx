import React, { useState } from "react";
import { router } from "expo-router";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ReadinessQuestionCard } from "@/components/ReadinessQuestionCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { READINESS_QUESTIONS } from "@/content/readinessQuestions";
import { useAppStore } from "@/store/useAppStore";
import type { ReadinessFlag } from "@/types/models";

export default function ReadinessScreen() {
  const setOnboardingField = useAppStore((s) => s.setOnboardingField);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [answers, setAnswers] = useState<Partial<Record<ReadinessFlag, boolean>>>({});

  const allAnswered = READINESS_QUESTIONS.every((q) => answers[q.flag] !== undefined);
  const anyYes = READINESS_QUESTIONS.some((q) => answers[q.flag] === true);

  function handleContinue() {
    const flags = READINESS_QUESTIONS.filter((q) => answers[q.flag] === true).map((q) => q.flag);
    setOnboardingField("readinessFlags", flags);
    if (anyYes) {
      router.push("/onboarding/readiness-gate");
    } else {
      completeOnboarding();
      router.push("/benchmark/intro");
    }
  }

  return (
    <ScreenContainer
      footer={<BigButton label="Continue" disabled={!allAnswered} onPress={handleContinue} />}
    >
      <BodyText size="title" bold>
        A few safety questions
      </BodyText>
      <BodyText muted style={{ marginTop: 8, marginBottom: 16 }}>
        This just helps us pick the safest exercises for you. There are no wrong answers.
      </BodyText>
      {READINESS_QUESTIONS.map((q) => (
        <ReadinessQuestionCard
          key={q.flag}
          question={q.question}
          answer={answers[q.flag] ?? null}
          onAnswer={(value) => setAnswers((prev) => ({ ...prev, [q.flag]: value }))}
        />
      ))}
    </ScreenContainer>
  );
}
