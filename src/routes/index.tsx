import { createFileRoute } from "@tanstack/react-router";
import { Portal } from "@/components/show/portal";

export const Route = createFileRoute("/")({
  component: Portal,
});
