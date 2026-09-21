import { nextPrescription, Prescription } from "@/lib/overload";

const adjustable: Prescription = {
  targetSets: 2,
  targetRepMin: 8,
  targetRepMax: 12,
  targetLoad: 10,
  loadIncrement: 2.5,
};

const fixed: Prescription = {
  targetSets: 2,
  targetRepMin: 8,
  targetRepMax: 12,
  targetLoad: null,
  loadIncrement: null,
};

describe("nextPrescription", () => {
  it("increases load and keeps the rep range when all sets hit the top with adjustable load", () => {
    const lastSession = [
      { setIndex: 0, reps: 12, load: 10 },
      { setIndex: 1, reps: 12, load: 10 },
    ];
    const result = nextPrescription(adjustable, lastSession);
    expect(result.targetLoad).toBe(12.5);
    expect(result.targetRepMin).toBe(8);
    expect(result.targetRepMax).toBe(12);
  });

  it("increases target reps by 1 on both ends when load isn't adjustable and all sets hit the top", () => {
    const lastSession = [
      { setIndex: 0, reps: 12, load: null },
      { setIndex: 1, reps: 13, load: null },
    ];
    const result = nextPrescription(fixed, lastSession);
    expect(result.targetRepMin).toBe(9);
    expect(result.targetRepMax).toBe(13);
    expect(result.targetLoad).toBeNull();
  });

  it("does not progress if fewer sets were logged than prescribed", () => {
    const lastSession = [{ setIndex: 0, reps: 12, load: 10 }];
    const result = nextPrescription(adjustable, lastSession);
    expect(result).toEqual(adjustable);
  });

  it("repeats the prescription when performance is within range but not at the top", () => {
    const lastSession = [
      { setIndex: 0, reps: 9, load: 10 },
      { setIndex: 1, reps: 10, load: 10 },
    ];
    const result = nextPrescription(adjustable, lastSession);
    expect(result).toEqual(adjustable);
  });

  it("decreases load only after falling below the bottom of the range for two consecutive sessions", () => {
    const lastSession = [
      { setIndex: 0, reps: 6, load: 10 },
      { setIndex: 1, reps: 7, load: 10 },
    ];
    const previousSession = [
      { setIndex: 0, reps: 5, load: 10 },
      { setIndex: 1, reps: 6, load: 10 },
    ];
    const result = nextPrescription(adjustable, lastSession, previousSession);
    expect(result.targetLoad).toBe(7.5);
  });

  it("does not decrease load after just one session below range", () => {
    const lastSession = [
      { setIndex: 0, reps: 6, load: 10 },
      { setIndex: 1, reps: 7, load: 10 },
    ];
    const result = nextPrescription(adjustable, lastSession, []);
    expect(result.targetLoad).toBe(10);
  });

  it("never decreases load below zero", () => {
    const nearZero: Prescription = { ...adjustable, targetLoad: 2, loadIncrement: 2.5 };
    const belowRange = [
      { setIndex: 0, reps: 3, load: 2 },
      { setIndex: 1, reps: 4, load: 2 },
    ];
    const result = nextPrescription(nearZero, belowRange, belowRange);
    expect(result.targetLoad).toBe(0);
  });
});
