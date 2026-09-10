import { useEffect, useState } from "react";
import { useLab } from "@/crates/session/store";

export function Hint() {
  const [show, setShow] = useState(true);
  const selectedId = useLab((s) => s.selectedId);
  const explodeAmount = useLab((s) => s.explodeAmount);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(false), 9000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (selectedId || explodeAmount > 0.02) setShow(false);
  }, [selectedId, explodeAmount]);

  if (!show) return null;
  return (
    <p className="lab-hint" role="note">
      Drag to orbit · Scroll to zoom · Click any part · / to search
      <span className="lab-hint-sub"> Educational laboratory. Not a permit determination.</span>
    </p>
  );
}
