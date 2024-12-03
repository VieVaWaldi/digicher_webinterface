import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

const MIN_YEAR = 1990;
const MAX_YEAR = 2027;

interface TimeSliderProps {
  year: number;
  onChange: (value: number | ((prev: number) => number)) => void;
}

export default function TimeSlider({ year, onChange }: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        onChange((prev) => (prev < MAX_YEAR ? prev + 1 : MIN_YEAR));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, onChange]);

  return (
    <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex flex-col gap-1">
          <input
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={year}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{MIN_YEAR}</span>
            <span className="font-medium">{year}</span>
            <span>{MAX_YEAR}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
