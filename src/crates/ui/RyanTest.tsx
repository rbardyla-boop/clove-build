import { useEffect, useMemo, useState } from "react";
import { useLab } from "@/crates/session/store";

const TESTS = [
  { id: "A", title: "Orbit", body: "Orbit completely around the house." },
  { id: "B", title: "Whole explode", body: "Explode the complete building to 100%, then return to 0%." },
  { id: "C", title: "Local explode", body: "Select an exterior wall and explode only that assembly." },
  { id: "D", title: "Construction scrub", body: "Scrub construction from bare site to completed framing and backward." },
  { id: "E", title: "Inspect", body: "Inspect a normal stud, header, floor member and foundation element." },
  { id: "F", title: "Break It", body: "Enter Break It and remove a designated component around the window opening." },
  { id: "G", title: "Check locates", body: "Run CHECK and verify the issue is visibly located in 3D." },
  { id: "H", title: "Restore", body: "Restore the component and verify the result changes." },
  { id: "I", title: "No bluff", body: "Create a case the prototype cannot determine and confirm it says MISSING or UNCERTAIN rather than bluffing." },
  { id: "J", title: "Reset", body: "Press RESET and confirm the entire house returns to canonical state." },
] as const;

type Mark = "PASS" | "FAIL" | "NOTE" | "";

const KEY = "clove.ryan-test.v1";

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
      "CLOVE BUILD LAB — RYAN TEST",
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
    <aside className="lab-drawer" aria-label="Ryan Test">
      <header className="lab-check-head">
        <div>
          <p className="lab-kicker">Human test card</p>
          <h2>Ryan Test</h2>
        </div>
        <button type="button" className="lab-btn" onClick={() => dispatch({ type: "TOGGLE_RYAN_TEST" })}>
          Close
        </button>
      </header>
      <ol className="lab-test-list">
        {TESTS.map((t) => (
          <li key={t.id}>
            <p>
              <strong>TEST {t.id}</strong> {t.title}
            </p>
            <p className="lab-muted">{t.body}</p>
            <div className="lab-inspect-actions">
              {(["PASS", "FAIL", "NOTE"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={marks[t.id] === m ? "lab-btn lab-btn-on" : "lab-btn"}
                  onClick={() => setMarks((prev) => ({ ...prev, [t.id]: m }))}
                >
                  {m}
                </button>
              ))}
            </div>
            <input
              className="lab-input"
              placeholder="Note"
              value={notes[t.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [t.id]: e.target.value }))}
            />
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="lab-btn lab-btn-accent"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            const area = document.createElement("textarea");
            area.value = text;
            document.body.appendChild(area);
            area.select();
            document.execCommand("copy");
            area.remove();
          }
        }}
      >
        Copy test results
      </button>
    </aside>
  );
}
