import { useEffect, useMemo, useState } from "react";
import { useLab } from "@/crates/session/store";

const TESTS = [
  { id: "A", title: "Orbit finished house", body: "Orbit completely around the completed house." },
  { id: "B", title: "Scrub construction", body: "Scrub from foundation to finished house and back." },
  { id: "C", title: "Trade layers", body: "Toggle every trade layer independently (on / ghost / off)." },
  { id: "D", title: "Whole explode", body: "Explode the complete house, then collapse." },
  { id: "E", title: "Exterior wall explode", body: "Explode an exterior wall assembly." },
  { id: "F", title: "Bathroom / service wall", body: "Explode the bathroom wet wall and read the layers." },
  { id: "G", title: "Plumbing trace", body: "Trace kitchen or bath plumbing to the building drain / source." },
  { id: "H", title: "Electrical trace", body: "Trace a receptacle, light or device to the electrical panel." },
  { id: "I", title: "HVAC / exhaust trace", body: "Trace a ventilation or HVAC path." },
  { id: "J", title: "Hide drywall", body: "Hide finish / x-ray and inspect concealed systems." },
  { id: "K", title: "Break structure", body: "Break one structural dependency (Break It)." },
  { id: "L", title: "Break plumbing", body: "Break one plumbing connection, then check topology." },
  { id: "M", title: "Break electrical", body: "Break one electrical topology connection, then trace." },
  { id: "N", title: "Whole-house CHECK", body: "Run CHECK and inspect findings by authority class." },
  { id: "O", title: "Reset", body: "RESET and confirm exact baseline recovery." },
  { id: "P", title: "Explode after reset", body: "Repeat explode / collapse after reset." },
] as const;

type Mark = "PASS" | "FAIL" | "NOTE" | "";

const KEY = "clove.ryan-trades-test.v02";

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
      "CLOVE BUILD LAB — RYAN TRADES TEST",
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
    <aside className="lab-drawer" aria-label="Ryan Trades Test">
      <header className="lab-check-head">
        <div>
          <p className="lab-kicker">Human test card</p>
          <h2>Ryan Trades Test</h2>
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
