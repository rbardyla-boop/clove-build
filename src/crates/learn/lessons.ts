export type Lesson = {
  id: string;
  prompt: string;
  seedId: string;
  hint: string;
  observe: string;
};

/**
 * Restrained in-house learning prompts. Predict → touch → observe.
 * Not a quiz platform.
 */
export const LESSONS: Lesson[] = [
  {
    id: "lesson.drain",
    prompt: "Where do you think this drain goes?",
    seedId: "plumbing.fixture.sink.kitchen",
    hint: "Trace drain from the kitchen sink. Follow trap → branch → stack → building drain.",
    observe: "Kitchen waste drops through a trap, runs in the floor structure, and joins the soil stack. It does not cross the living room in the air.",
  },
  {
    id: "lesson.opening",
    prompt: "Which parts of this opening can be removed?",
    seedId: "assembly.wall.front.header.W1",
    hint: "Jack studs under the header are the demonstration load path. Remove one in Break It, then Check.",
    observe: "A header without a jack is an educational load-path failure — not a calculated structural collapse.",
  },
  {
    id: "lesson.vent",
    prompt: "Where should this vent travel?",
    seedId: "plumbing.dwv.trap.kitchen.001",
    hint: "Trace vent. The kitchen vent rises in the wall and crosses in the attic, not through the room.",
    observe: "Vents relieve traps. In this house the kitchen vent is an attic crossing, not a mid-room pipe.",
  },
  {
    id: "lesson.circuit",
    prompt: "What does this circuit connect back to?",
    seedId: "electrical.device.receptacle.front.001",
    hint: "Trace to panel: receptacle → cable → breaker → panel.",
    observe: "Devices are not magic. They are topology back to an overcurrent device.",
  },
  {
    id: "lesson.air",
    prompt: "What disappears when this control layer is interrupted?",
    seedId: "thermal.wall.front.air-barrier",
    hint: "Trace the air-control layer, then Break It on the teaching wall.",
    observe: "Air control is a plane. A hole in the teaching wall is a continuity lesson, not a blower-door number.",
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
