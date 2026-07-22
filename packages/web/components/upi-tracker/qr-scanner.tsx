"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera } from "lucide-react";

export type QrScannerProps = {
  /**
   * When true, the camera stream stays live but decode work is skipped —
   * used while the parent shows a malformed-QR error (FR-021), so
   * "Try again" only needs to flip this back to `false` to resume
   * scanning, never re-requesting camera permission or tearing down the
   * stream (research.md §8).
   */
  paused: boolean;
  onDecode: (value: string) => void;
  /** Fired once if getUserMedia rejects — permission denied or no camera
   *  hardware (FR-022). The parent swaps to the manual-entry fallback. */
  onCameraUnavailable: () => void;
};

// IMPORTANT (T007's spike finding): the <video> element must stay in the
// visible render tree — `display:none` silently starves it of decoded
// frames forever, so drawImage() onto the canvas would draw nothing.
// Positioned/opacity tricks are fine; `display:none` is not. This
// component renders the feed as real, visible content (the viewfinder
// itself), so that constraint is satisfied by construction.
export function QrScanner({ paused, onDecode, onCameraUnavailable }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const decodedRef = useRef(false);
  const [pending, setPending] = useState(true);

  pausedRef.current = paused;

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let rafId: number;

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!decodedRef.current && !pausedRef.current && video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height);
          if (result) {
            decodedRef.current = true;
            onDecode(result.data);
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch {
        if (!cancelled) {
          onCameraUnavailable();
        }
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPending(false);
      rafId = requestAnimationFrame(tick);
    }

    void start();

    return () => {
      cancelled = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      stream?.getTracks().forEach((track) => track.stop());
    };
    // Intentionally mount-once: re-running this effect would re-request
    // camera permission, which FR-021's retry path must never do. `paused`
    // is read via a ref inside the loop instead of being a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paused) {
      decodedRef.current = false;
    }
  }, [paused]);

  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden border border-border bg-surface">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        role="img"
        aria-label="Scanning for a UPI QR code"
        className="h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      {pending ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface">
          <Camera aria-hidden="true" size={32} className="text-text-secondary" />
          <p className="text-sm leading-sm text-text-secondary">Requesting camera access.</p>
        </div>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-6">
          <span className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-accent-solid" />
          <span className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-accent-solid" />
          <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-accent-solid" />
          <span className="absolute right-0 bottom-0 h-8 w-8 border-r-2 border-b-2 border-accent-solid" />
        </div>
      )}
    </div>
  );
}
