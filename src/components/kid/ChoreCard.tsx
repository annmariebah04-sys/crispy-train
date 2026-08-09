import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Camera, Check, Loader2, RotateCcw, Video } from "lucide-react";
import ProofModal from "../ProofModal";
import type { Chore, Completion } from "../../types";

interface Props {
  chore: Chore;
  completion?: Completion;
  onSubmit: (input: {
    photoFile?: File;
    videoFile?: File;
    note?: string;
  }) => Promise<void>;
}

const MAX_VIDEO_BYTES = 25 * 1024 * 1024;

export default function ChoreCard({ chore, completion, onSubmit }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);

  const status = completion?.status;

  function openSheet() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setVideoFile(null);
    setNote("");
    setError(null);
    setSheetOpen(true);
  }

  function handlePhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  }

  function handleVideoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        "That video is too big — keep it under 25MB (a few seconds is plenty).",
      );
      return;
    }
    setVideoFile(file);
    setError(null);
  }

  async function submit() {
    if (!photoFile && !videoFile && !note.trim()) {
      setError("Add a photo, a video, or a note before submitting.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        photoFile: photoFile ?? undefined,
        videoFile: videoFile ?? undefined,
        note: note.trim() || undefined,
      });
      setSheetOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't submit that, try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleCardTap() {
    if (status === "approved" || status === "pending") setViewing(true);
    else openSheet(); // not submitted yet, or rejected — (re)submit
  }

  const badgeText =
    status === "approved"
      ? `Done ${completion?.approvedAt ? new Date(completion.approvedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}`
      : status === "pending"
        ? "Waiting for a parent to approve"
        : status === "rejected"
          ? completion?.rejectionNote
            ? `Needs another try — ${completion.rejectionNote}`
            : "Needs another try"
          : `+${chore.points} pts · tap to submit proof`;
  const badgeCls =
    status === "pending"
      ? "text-amber-300"
      : status === "rejected"
        ? "text-rose-300"
        : "text-white/40";

  return (
    <motion.div layout className="glass rounded-2xl p-4">
      <button
        onClick={handleCardTap}
        className={`flex w-full items-center gap-4 text-left transition ${status === "approved" ? "opacity-60" : ""}`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
          {chore.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`font-medium ${status === "approved" ? "line-through text-white/50" : ""}`}
          >
            {chore.title}
          </div>
          <div className={`text-xs ${badgeCls}`}>{badgeText}</div>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
            status === "approved"
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
              : status === "pending"
                ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                : status === "rejected"
                  ? "border-rose-400/60 bg-rose-400/10 text-rose-300"
                  : "border-white/25 text-white/40"
          }`}
        >
          {status === "approved" ? (
            <Check size={16} strokeWidth={3} />
          ) : status === "pending" ? (
            <Loader2 size={14} />
          ) : status === "rejected" ? (
            <RotateCcw size={13} />
          ) : (
            <Camera size={14} />
          )}
        </div>
      </button>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoPick}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleVideoPick}
      />

      {createPortal(
        <AnimatePresence>
          {sheetOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:px-6"
              onClick={() => !busy && setSheetOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                onClick={(e) => e.stopPropagation()}
                className="glass w-full max-w-sm rounded-t-3xl p-5 sm:rounded-3xl"
              >
                <div className="font-medium">
                  {chore.emoji} {chore.title}
                </div>
                <p className="mt-1 text-xs text-white/40">
                  Add a photo, video, or note as proof — at least one.
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs transition ${
                      photoFile
                        ? "bg-fuchsia-500/25 text-fuchsia-200 ring-2 ring-fuchsia-400/60"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Camera size={18} /> {photoFile ? "Photo added" : "Photo"}
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs transition ${
                      videoFile
                        ? "bg-cyan-500/25 text-cyan-200 ring-2 ring-cyan-400/60"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Video size={18} /> {videoFile ? "Video added" : "Video"}
                  </button>
                </div>

                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt=""
                    className="mt-3 h-32 w-full rounded-xl object-cover"
                  />
                )}
                {videoFile && !photoPreview && (
                  <div className="mt-3 truncate rounded-xl bg-white/5 px-3 py-2 text-xs text-white/50">
                    {videoFile.name}
                  </div>
                )}

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a note instead (optional)"
                  rows={2}
                  className="mt-3 w-full resize-none rounded-xl bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:ring-2 focus:ring-fuchsia-400/60"
                />

                {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setSheetOpen(false)}
                    disabled={busy}
                    className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm text-white/60 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      "Submit for approval"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <AnimatePresence>
        {viewing && completion && (
          <ProofModal
            completion={completion}
            chore={chore}
            onClose={() => setViewing(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
