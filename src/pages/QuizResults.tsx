import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TAGLINES = [
  "Scanning 8 resources for your score range...",
  "Weighing community feedback from students like you...",
  "Matching your plateau to the breakthrough...",
];

const QuizResults = () => {
  const navigate = useNavigate();
  const [taglineIdx, setTaglineIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => navigate("/feed", { replace: true }), 3000);
    const i = setInterval(() => {
      setTaglineIdx((x) => (x + 1) % TAGLINES.length);
    }, 1000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0F0F0F] px-6 text-white">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0D9488] opacity-60" />
        <span className="relative inline-flex h-12 w-12 rounded-full bg-[#0D9488]" />
      </div>

      <h1 className="mt-8 text-[1.75rem] font-bold tracking-tight text-white">
        Finding your resources...
      </h1>

      <div className="mt-3 h-6 text-sm text-white/60">
        {TAGLINES.map((line, i) => (
          <p
            key={i}
            className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-500 ${
              i === taglineIdx ? "opacity-100" : "opacity-0"
            }`}
          >
            {line}
          </p>
        ))}
      </div>

      <div className="mt-10 h-1.5 w-72 max-w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#0D9488]"
          style={{ animation: "tb-progress 3s linear forwards" }}
        />
      </div>

      <style>{`
        @keyframes tb-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default QuizResults;