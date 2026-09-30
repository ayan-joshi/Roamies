"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    // Native share sheet (WhatsApp, Instagram DM...) where supported, else copy.
    if (navigator.share) {
      try {
        await navigator.share({ title: "Roamies", text: "Find someone headed the same way, on the same dates.", url });
        return;
      } catch {
        return; // user closed the sheet
      }
    }
    await copy();
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="secondary" onClick={copy} className="flex-1">
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button type="button" onClick={share} className="flex-1">
        Share
      </Button>
    </div>
  );
}
