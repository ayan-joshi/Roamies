import type { Metadata } from "next";
import { FeedbackForm } from "./feedback-form";

export const metadata: Metadata = { title: "Feedback · Roamies" };

export default async function FeedbackPage({ searchParams }: PageProps<"/feedback">) {
  const { from } = await searchParams;
  const back = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") ? from : "/";
  return <FeedbackForm back={back} />;
}
