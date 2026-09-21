import React, { useState } from "react";
import { View } from "react-native";
import { BodyText } from "@/components/BodyText";
import { BigButton } from "@/components/BigButton";
import { Stepper } from "@/components/Stepper";
import { space } from "@/theme/tokens";

interface Props {
  setNumber: number;
  totalSets: number;
  repMin: number;
  repMax: number;
  isBalanceHold: boolean;
  load: number | null;
  loadIncrement: number | null;
  onLogSet: (reps: number, load: number | null) => void;
}

export function SetCompletionControl({
  setNumber,
  totalSets,
  repMin,
  repMax,
  isBalanceHold,
  load,
  loadIncrement,
  onLogSet,
}: Props) {
  const [reps, setReps] = useState(repMax);
  const [currentLoad, setCurrentLoad] = useState(load ?? 0);

  return (
    <View>
      <BodyText size="bodyLarge" bold center>
        Set {setNumber} of {totalSets}
      </BodyText>
      <BodyText muted center style={{ marginTop: 4 }}>
        Target: {repMin}-{repMax} {isBalanceHold ? "seconds held" : "reps"}
        {load !== null ? ` at ${load} lb` : ""}
      </BodyText>

      <BodyText style={{ marginTop: space.md }} center>
        {isBalanceHold ? "How many seconds did you hold?" : "How many did you complete?"}
      </BodyText>
      <Stepper value={reps} onChange={setReps} min={0} max={Math.max(repMax + 10, 30)} />

      {load !== null && loadIncrement !== null ? (
        <>
          <BodyText center>What weight did you use?</BodyText>
          <Stepper value={currentLoad} onChange={setCurrentLoad} min={0} max={200} step={loadIncrement} suffix="lb" />
        </>
      ) : null}

      <BigButton
        label="Log this set"
        onPress={() => onLogSet(reps, load !== null ? currentLoad : null)}
      />
    </View>
  );
}
