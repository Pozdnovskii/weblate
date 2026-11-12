import { useState } from "react";
import type { NavbarProps } from "sanity";
import { Button } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { RocketIcon } from "@sanity/icons/Rocket";

/** Deploy, right from the navbar — no page, no second click. Status via toast. */
export function DeployButton(props: NavbarProps) {
  const [deploying, setDeploying] = useState(false);
  const toast = useToast();

  async function handleDeploy() {
    setDeploying(true);
    try {
      const res = await fetch("https://weblateweb.dev/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      toast.push({
        status: "success",
        title: "Deploy triggered",
        description: "Check the Cloudflare dashboard for progress.",
      });
    } catch (err) {
      toast.push({
        status: "error",
        title: "Deploy failed",
        description: err instanceof Error ? err.message : String(err),
        duration: 10000,
      });
    } finally {
      setDeploying(false);
    }
  }

  return (
    <>
      {props.renderDefault(props)}
      <Button
        icon={RocketIcon}
        text={deploying ? "Deploying…" : "Deploy"}
        tone="primary"
        mode="ghost"
        loading={deploying}
        disabled={deploying}
        onClick={handleDeploy}
        style={{ cursor: deploying ? undefined : "pointer" }}
      />
    </>
  );
}
