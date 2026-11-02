"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { writeClient } from "@/sanity/write";

export type BriefFormState = { error?: string };

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = /\.(pdf|docx|md|markdown|txt)$/i;

export async function submitBrief(_: BriefFormState, form: FormData): Promise<BriefFormState> {
  const title = String(form.get("title") ?? "").trim();
  const submittedBy = String(form.get("submittedBy") ?? "").trim();
  const text = String(form.get("text") ?? "").trim();
  const file = form.get("document");
  const hasFile = file instanceof File && file.size > 0;

  if (!title) return { error: "Give the page a name." };
  if (!submittedBy) return { error: "Add your name so the Build is attributed to you." };
  if (hasFile === Boolean(text)) return { error: "Upload a brief document or paste the brief, not both." };
  if (hasFile && file.size > MAX_BYTES) return { error: "Keep the document under 10 MB." };
  if (hasFile && !ACCEPTED.test(file.name)) return { error: "Upload a PDF, DOCX, Markdown, or text file." };

  const id = randomUUID();
  try {
    const document = hasFile
      ? await writeClient.assets.upload("file", Buffer.from(await file.arrayBuffer()), { filename: file.name })
      : null;
    const content: { document?: object; text?: string } = document
      ? { document: { _type: "file", asset: { _type: "reference", _ref: document._id } } }
      : { text };
    await writeClient.create({
      _id: id,
      _type: "brief",
      title,
      submittedBy,
      submittedVia: "form",
      status: "idle",
      buildRequestedAt: new Date().toISOString(),
      ...content,
    });
  } catch (error) {
    console.error("Brief submission failed", error);
    return { error: "Could not save the brief. Try again." };
  }
  redirect(`/brief/${id}`);
}
