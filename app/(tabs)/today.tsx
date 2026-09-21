import React, { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SetCompletionControl } from "@/components/SetCompletionControl";
import { getExerciseById } from "@/data/exerciseRepo";
import { restDayMessage, sessionAvailability } from "@/lib/schedule";
import { useAppStore } from "@/store/useAppStore";
import { color, space, tapTarget } from "@/theme/tokens";

export default function TodayScreen() {
  const activeProgram = useAppStore((s) => s.activeProgram);
  const todaysExercises = useAppStore((s) => s.todaysProgramExercises());
  const sessionLogs = useAppStore((s) => s.sessionLogs);
  const draftSetsFor = useAppStore((s) => s.draftSetsFor);
  const logSet = useAppStore((s) => s.logSet);
  const completeExerciseForToday = useAppStore((s) => s.completeExerciseForToday);
  const completeSession = useAppStore((s) => s.completeSession);

  const [activeIndex, setActiveIndex] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const [trainingOnRestDay, setTrainingOnRestDay] = useState(false);

  const availability = sessionAvailability(sessionLogs);
  const hasCompletedToday = availability.state === "completed_today";

  if (!activeProgram) {
    return (
      <ScreenContainer>
        <BodyText size="title" bold>
          No program yet
        </BodyText>
        <BodyText style={{ marginTop: 8 }}>Complete your benchmark to get a program.</BodyText>
      </ScreenContainer>
    );
  }

  if (hasCompletedToday || justFinished) {
    return (
      <ScreenContainer>
        <BodyText size="title" bold>
          You're done for today
        </BodyText>
        <BodyText style={{ marginTop: 12 }}>
          Nice work. Your next session will be here whenever you're ready — there's no rush.
        </BodyText>
      </ScreenContainer>
    );
  }

  if (availability.state === "rest_day" && !trainingOnRestDay) {
    return (
      <ScreenContainer
        footer={
          <BigButton
            label="I'd like to train today anyway"
            variant="secondary"
            onPress={() => setTrainingOnRestDay(true)}
          />
        }
      >
        <BodyText size="title" bold>
          Rest day
        </BodyText>
        <BodyText style={{ marginTop: 12 }}>
          Rest days are part of the program, not time off from it. Your muscles get stronger while
          they recover, so today's job is letting that happen.
        </BodyText>
        <BodyText style={{ marginTop: 16 }} bold>
          {restDayMessage(availability.daysUntilNext)}
        </BodyText>
        <BodyText style={{ marginTop: 16 }} muted>
          Gentle walking or stretching is perfectly fine today.
        </BodyText>
      </ScreenContainer>
    );
  }

  if (todaysExercises.length === 0) {
    return (
      <ScreenContainer>
        <BodyText size="title" bold>
          Nothing scheduled
        </BodyText>
        <BodyText style={{ marginTop: 12 }}>Check back tomorrow.</BodyText>
      </ScreenContainer>
    );
  }

  const currentProgramExercise = todaysExercises[Math.min(activeIndex, todaysExercises.length - 1)];
  const exercise = getExerciseById(currentProgramExercise.exerciseId);
  const draft = draftSetsFor(currentProgramExercise.id);
  const setsLoggedCount = draft.length;

  function handleLogSet(reps: number, load: number | null) {
    logSet(currentProgramExercise.id, { setIndex: setsLoggedCount, reps, load });
    const willHaveLogged = setsLoggedCount + 1;
    if (willHaveLogged >= currentProgramExercise.targetSets) {
      completeExerciseForToday(currentProgramExercise.id);
      const isLastExercise = activeIndex >= todaysExercises.length - 1;
      if (isLastExercise) {
        completeSession();
        setJustFinished(true);
      } else {
        setActiveIndex((i) => i + 1);
      }
    }
  }

  if (!exercise) {
    return (
      <ScreenContainer>
        <BodyText>Exercise data missing for this program.</BodyText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <BodyText muted>
        Exercise {activeIndex + 1} of {todaysExercises.length}
      </BodyText>
      <BodyText size="title" bold style={{ marginTop: 4, marginBottom: space.sm }}>
        {exercise.name}
      </BodyText>

      <View
        style={{
          alignSelf: "flex-start",
          minHeight: tapTarget.minHeight,
          justifyContent: "center",
          marginBottom: space.md,
        }}
      >
        <BodyText
          bold
          style={{ color: color.primary, textDecorationLine: "underline" }}
          onPress={() => router.push(`/exercise/${exercise.id}`)}
        >
          See how to do this
        </BodyText>
      </View>

      <SetCompletionControl
        // Remount per exercise: the rep/load steppers seed their state from
        // props on mount only, so without this the next exercise inherits the
        // previous one's reps and weight.
        key={currentProgramExercise.id}
        setNumber={setsLoggedCount + 1}
        totalSets={currentProgramExercise.targetSets}
        repMin={currentProgramExercise.targetRepMin}
        repMax={currentProgramExercise.targetRepMax}
        isBalanceHold={exercise.pattern === "balance"}
        load={currentProgramExercise.targetLoad}
        loadIncrement={currentProgramExercise.loadIncrement}
        onLogSet={handleLogSet}
      />
    </ScreenContainer>
  );
}
