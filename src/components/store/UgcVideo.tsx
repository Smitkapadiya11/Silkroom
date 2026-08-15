"use client";

import { useEffect, useRef, useState } from "react";

type UgcVideoProps = {
  className?: string;
  srcMp4: string;
  poster: string;
  label?: string;
};

export function UgcVideo({
  className = "",
  srcMp4,
  poster,
  label = "Silk Room product video",
}: UgcVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          void video.play().then(() => setPlaying(true)).catch(() => {
            setPlaying(false);
          });
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  if (failed) {
    return (
      <div className={`ugc-video ugc-video--fallback ${className}`.trim()} role="img" aria-label={label}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" />
        <span>Video unavailable</span>
      </div>
    );
  }

  return (
    <div className={`ugc-video ${className}`.trim()}>
      <video
        ref={videoRef}
        className="ugc-video__media"
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
        onError={() => setFailed(true)}
      >
        <source src={srcMp4} type="video/mp4" />
      </video>

      <div className="ugc-video__controls">
        <button
          type="button"
          className="ugc-video__button"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              void video.play().catch(() => undefined);
            } else {
              video.pause();
            }
          }}
          aria-label={playing ? "Pause video" : "Play video"}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className="ugc-video__button"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            const nextMuted = !video.muted;
            if (!nextMuted) {
              document.querySelectorAll("video.ugc-video__media").forEach((other) => {
                if (other !== video) (other as HTMLVideoElement).muted = true;
              });
              void video.play().catch(() => undefined);
            }
            video.muted = nextMuted;
            setMuted(nextMuted);
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}
