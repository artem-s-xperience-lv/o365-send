"use client";

import { FormEvent, useState } from "react";

type ApiResponse = {
  ok: boolean;
  error?: string;
};

export default function HomePage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ to, subject, body })
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to send email");
      }

      setIsError(false);
      setStatus("Email sent successfully");
      setSubject("");
      setBody("");
    } catch (error) {
      setIsError(true);
      setStatus(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Send Email via O365</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="To (comma, semicolon, or newline separated)"
          required
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
        <textarea
          placeholder="Message body"
          required
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>
      {status ? (
        <p className={`status ${isError ? "error" : "success"}`}>{status}</p>
      ) : null}
    </main>
  );
}
