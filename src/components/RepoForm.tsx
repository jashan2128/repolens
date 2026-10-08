"use client";
import { useState } from "react";

type Props = {
  onSubmit: (url: string) => void;
  loading: boolean;
};

export default function RepoForm({ onSubmit, loading }: Props) {
  const [url, setUrl] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(url);
      }}
      className="flex gap-2"
    >
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="github.com/owner/repo"
        className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm outline-none focus:border-neutral-400"
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </form>
  );
}
