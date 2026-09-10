import { useEffect, useMemo, useState } from "react";
import { useLab } from "@/crates/session/store";

const TESTS = [
  { id: "A", title: "Orbit finished house", body: "Orbit completely around the completed house." },
  { id: "B", title: "Scrub construction", body: "Scrub from foundation to finished house and back." },
  { id: "C", title: "Explode complete house", body: "Explode the complete house, then collapse." },
  { id: "D", title: "Explode exterior wall", body: "Explode an exterior wall assembly layer by layer." },
  { id: "E", title: "Explode bathroom wall", body: "Explode the bathroom wet wall and read finish → services → framing." },
  { id: "F", title: "Trace kitchen cold supply", body: "Trace kitchen cold from fixture under the floor to the stack." },
  { id: "G", title: "Trace kitchen drain", body: "Trace kitchen drain: trap → branch → stack → building drain." },
  { id: "H", title: "Trace plumbing vent", body: "Trace kitchen or stack vent through the attic, not the room." },
  { id: "I", title: "Trace receptacle to panel", body: "Trace a receptacle to the main panel." },
  { id: "J", title: "Trace bathroom exhaust", body: "Trace bath exhaust fan → duct → outlet." },
  { id: "K", title: "Trace water-control layer", body: "Use control-layer water and follow WRB / flashing." },
  { id: "L", title: "Trace air-control layer", body: "Use control-layer air on the teaching wall." },
  { id: "M", title: "Hide finish / rough-in", body: "Hide finish or rewind time and inspect concealed work." },
  { id: "N", title: "Inspect a penetration", body: "Select a foundation or floor penetration and read host/trade." },
  { id: "O", title: "Search header", body: "Search “header” and jump to a framed opening." },
  { id: "P", title: "Search main panel", body: "Search “main panel” and fit camera." },
  { id: "Q", title: "Break framing", body: "Break It: remove a jack under a header, then Check." },
  { id: "R", title: "Break plumbing", body: "Remove a trap or drain, then Check topology." },
  { id: "S", title: "Break electrical", body: "Remove a branch cable, then Trace." },
  { id: "T", title: "Occupied-space routing fault", body: "Challenge: A pipe through the room. Check must FAIL CROSS-ROUTE-001. Reset must restore the planned graph." },
  { id: "U", title: "Whole-house Check", body: "Run Check and read findings by domain and authority class." },
  { id: "V", title: "Show me why", body: "On a FAIL finding, press Show me why." },
  { id: "W", title: "MISSING_INFORMATION", body: "Confirm at least one MISSING_INFORMATION result (climatic / energy / licensed text)." },
  { id: "X", title: "UNCERTAIN", body: "Confirm at least one UNCERTAIN result (e.g. NBC 2025 not adopted in PEI)." },
  { id: "Y", title: "Reset", body: "Reset and confirm exact baseline recovery." },
  { id: "Z", title: "Baseline after reset", body: "Explode / collapse after reset; graph identity unchanged." },
] as const;

type Mark = "PASS" | "FAIL" | "NOTE" | "";

const KEY = "clove.ryan-full-house-test.v03";

export function RyanTest() {
  const open = useLab((s) => s.showRyanTest);
  const dispatch = useLab((s) => s.dispatch);
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { marks: Record<string, Mark>; notes: Record<string, string> };
        setMarks(parsed.marks ?? {});
        setNotes(parsed.notes ?? {});
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ marks, notes }));
  }, [marks, notes]);

  const text = useMemo(() => {
    const lines = [
      "CLOVE BUILD LAB — RYAN FULL-HOUSE TEST A–Z",
      `Date: ${new Date().toISOString()}`,
      "",
      ...TESTS.map((t) => {
        const mark = marks[t.id] || "UNMARKED";
        const note = notes[t.id] ? ` — ${notes[t.id]}` : "";
        return `TEST ${t.id} (${t.title}): ${mark}${note}`;
      }),
    ];
    return lines.join("\n");
  }, [marks, notes]);

  if (!open) return null;

  return (
    <aside className="lab-drawer" aria-label="Ryan Full-House Test">
      <header className="lab-check-head">
        <div>
          <p className="lab-kicker">Human test card</p>
          <h2>Ryan Full-House Test</h2>
        </div>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TOGGLE_RYAN_TEST" })}>
          Close
        </button>
      </header>
      <ol className="lab-test-list">
        {TESTS.map((t) => (
          <li key={t.id}>
            <p>
              <strong>
                {t.id}. {t.title}
              </strong>
            </p>
            <p className="lab-muted">{t.body}</p>
            <div className="lab-test-marks">
              {(["PASS", "FAIL", "NOTE"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={marks[t.id] === m ? "lab-mini lab-mini-on" : "lab-mini"}
                  onClick={() => setMarks((prev) => ({ ...prev, [t.id]: prev[t.id] === m ? "" : m }))}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              className="lab-test-note"
              placeholder="Note"
              value={notes[t.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
              aria-label={`Note for test ${t.id}`}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="lab-btn lab-btn-accent"
        onClick={() => {
          void navigator.clipboard.writeText(text);
        }}
      >
        Copy full test receipt
      </button>
    </aside>
  );
}
