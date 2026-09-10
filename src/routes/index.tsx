import { createFileRoute } from "@tanstack/react-router";
import { LabShell } from "@/crates/ui/LabShell";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <LabShell />;
}
