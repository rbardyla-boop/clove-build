export const WINDOW_CHALLENGE = {
  id: "challenge.window-opening",
  title: "The window opening",
  prompt:
    "Several members surround this window. Remove the pieces you believe are unnecessary, then inspect the result and run CHECK.",
  targetAssembly: "assembly.wall.front",
  focusId: "assembly.wall.front.header.W1",
  hintAfterCheck: "The temporary brace is construction scaffolding. The jacks and header are the opening’s load path.",
  removableHintIds: ["assembly.wall.front.temp-brace.W1"],
  criticalIds: [
    "assembly.wall.front.header.W1",
    "assembly.wall.front.jack.W1.L",
    "assembly.wall.front.jack.W1.R",
    "assembly.wall.front.king.W1.L",
    "assembly.wall.front.king.W1.R",
  ],
} as const;
