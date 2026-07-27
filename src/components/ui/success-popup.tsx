"use client";

import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  duration?: number;
}

export function SuccessPopup({
  isOpen,
  onClose,
  title = "Email Sent",
  description = "Your message has been delivered successfully.",
  duration = 2400,
}: SuccessPopupProps) {
  const [isMounted, setIsMounted] =
    useState(false);

  const [isVisible, setIsVisible] =
    useState(false);

  const [typedTitle, setTypedTitle] =
    useState("");

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      return;
    }

    setIsMounted(true);
    setTypedTitle("");

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const showTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 10);

    const typingStartDelay = 620;
    const typingSpeed = 55;

    const typingTimer = window.setTimeout(() => {
      let currentIndex = 0;

      const letterTimer = window.setInterval(() => {
        currentIndex += 1;

        setTypedTitle(
          title.slice(0, currentIndex)
        );

        if (currentIndex >= title.length) {
          window.clearInterval(letterTimer);
        }
      }, typingSpeed);

      return () => {
        window.clearInterval(letterTimer);
      };
    }, typingStartDelay);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, Math.max(duration - 280, 1000));

    const closeTimer = window.setTimeout(() => {
      setIsMounted(false);
      setTypedTitle("");
      onCloseRef.current();
    }, duration);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.clearTimeout(showTimer);
      window.clearTimeout(typingTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
  }, [isOpen, title, duration]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${
        isVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      {/* Blurred background overlay */}
      <div
        className={`absolute inset-0 bg-black/10 backdrop-blur-[7px] transition-all duration-300 ${
          isVisible
            ? "opacity-100"
            : "opacity-0"
        }`}
      />

      {/* Success card */}
      <div
        className={`success-card relative z-10 w-full max-w-[360px] overflow-hidden rounded-[22px] border border-gray-200 bg-white px-5 pb-5 pt-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)] transition-all duration-300 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="flex min-h-[76px] items-center justify-center">
          <div className="success-content flex items-center justify-center">
            {/* Animated check */}
            <div className="success-icon-wrapper relative flex h-16 w-16 shrink-0 items-center justify-center">
              <span className="success-pulse-ring absolute inset-0 rounded-full border-2 border-emerald-400/60" />

              <span className="success-glow absolute inset-1 rounded-full bg-emerald-400/20 blur-md" />

              <span className="success-check-circle relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-[0_10px_28px_rgba(16,185,129,0.35)]">
                <Check
                  className="success-check h-8 w-8 text-white"
                  strokeWidth={3.2}
                />
              </span>
            </div>

            {/* Animated text */}
            <div className="success-text ml-4 min-w-0">
              <p className="whitespace-nowrap text-xl font-bold tracking-tight text-emerald-600">
                {typedTitle}
                <span
                  className={
                    typedTitle.length < title.length
                      ? "ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-emerald-500 align-middle"
                      : "hidden"
                  }
                />
              </p>

              <p className="success-description mt-1 max-w-[230px] text-sm leading-5 text-gray-500">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Auto-close progress line */}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-emerald-100">
          <div
            className="success-progress h-full rounded-full bg-emerald-500"
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .success-card {
          transform-origin: center;
        }

        .success-content {
          animation: content-layout 0.75s
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .success-icon-wrapper {
          animation: icon-slide 0.75s
            cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        .success-check-circle {
          animation: check-pop 0.55s
            cubic-bezier(0.34, 1.56, 0.64, 1)
            both;
        }

        .success-check {
          stroke-dasharray: 60;
          stroke-dashoffset: 60;
          animation: draw-check 0.38s ease-out
            0.18s forwards;
        }

        .success-pulse-ring {
          animation: pulse-ring 0.75s ease-out
            0.12s both;
        }

        .success-glow {
          animation: glow-pulse 0.8s ease-out
            both;
        }

        .success-text {
          max-width: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateX(-12px);
          animation: reveal-text 0.5s
            cubic-bezier(0.22, 1, 0.36, 1)
            0.55s forwards;
        }

        .success-description {
          opacity: 0;
          transform: translateY(5px);
          animation: reveal-description 0.35s
            ease-out 1.15s forwards;
        }

        .success-progress {
          width: 100%;
          transform-origin: left center;
          animation-name: progress-shrink;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }

        @keyframes check-pop {
          0% {
            opacity: 0;
            transform: scale(0.2);
          }

          65% {
            opacity: 1;
            transform: scale(1.12);
          }

          82% {
            transform: scale(0.94);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes draw-check {
          from {
            stroke-dashoffset: 60;
          }

          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse-ring {
          0% {
            opacity: 0.8;
            transform: scale(0.65);
          }

          100% {
            opacity: 0;
            transform: scale(1.65);
          }
        }

        @keyframes glow-pulse {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }

          40% {
            opacity: 1;
            transform: scale(1.15);
          }

          100% {
            opacity: 0.35;
            transform: scale(1);
          }
        }

        @keyframes icon-slide {
          0%,
          65% {
            transform: translateX(52px);
          }

          100% {
            transform: translateX(0);
          }
        }

        @keyframes content-layout {
          0%,
          65% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(0);
          }
        }

        @keyframes reveal-text {
          0% {
            max-width: 0;
            opacity: 0;
            transform: translateX(-12px);
          }

          100% {
            max-width: 250px;
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes reveal-description {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progress-shrink {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .success-content,
          .success-icon-wrapper,
          .success-check-circle,
          .success-check,
          .success-pulse-ring,
          .success-glow,
          .success-text,
          .success-description,
          .success-progress {
            animation-duration: 0.01ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </div>
  );
}