import { useEffect, useState, useRef } from "react";
import { Clock } from "lucide-react";

interface Props {
  durationMinutes: number;
  onExpire: () => void;
}

export default function CountdownTimer({ durationMinutes, onExpire }: Props) {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const hasExpired = useRef(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!hasExpired.current) {
        hasExpired.current = true;
        onExpire();
      }
      return;
    }

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const percentLeft = secondsLeft / totalSeconds;
  const isUrgent = percentLeft <= 0.1; // last 10% of time
  const isWarning = percentLeft <= 0.25 && !isUrgent; // last 25%

  // circle math
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentLeft);

  const ringColor = isUrgent ? "#EF4444" : isWarning ? "#F59E0B" : "#7C3AED";

  return (
    <div
      className={`flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 ${
        isUrgent ? "timer-pulse" : ""
      }`}
    >
      <div className="relative w-11 h-11 shrink-0">
        <svg className="w-11 h-11 -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        <Clock
          size={14}
          className="absolute inset-0 m-auto text-white"
        />
      </div>
      <div>
        <div className="text-[10px] text-indigo-100/70 uppercase tracking-wider font-medium">
          Time Left
        </div>
        <div
          className={`font-[family-name:var(--font-display)] font-semibold text-lg tabular-nums ${
            isUrgent ? "text-red-200" : "text-white"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}