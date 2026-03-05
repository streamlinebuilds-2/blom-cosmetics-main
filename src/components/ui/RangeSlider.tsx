import React, { useState, useEffect, useRef } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (value: number) => string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (v) => v.toString(),
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.min(Number(e.target.value), localValue[1] - step);
    setLocalValue([newVal, localValue[1]]);
    onChange([newVal, localValue[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Math.max(Number(e.target.value), localValue[0] + step);
    setLocalValue([localValue[0], newVal]);
    onChange([localValue[0], newVal]);
  };

  const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="w-full">
      <style>
        {`
          .range-slider-thumb {
            -webkit-appearance: none;
            pointer-events: all;
            width: 24px;
            height: 24px;
            -webkit-tap-highlight-color: transparent;
            z-index: 30;
            position: relative;
            outline: none;
            cursor: pointer;
          }
          .range-slider-thumb::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: black;
            cursor: pointer;
            pointer-events: all;
          }
          .range-slider-thumb::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: black;
            cursor: pointer;
            pointer-events: all;
            border: none;
          }
        `}
      </style>
      <div className="relative w-full h-6 mb-8">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute pointer-events-none appearance-none z-20 h-2 w-full bg-transparent cursor-pointer range-slider-thumb"
          style={{ zIndex: localValue[0] > max - 100 ? 50 : 30 }} 
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute pointer-events-none appearance-none z-20 h-2 w-full bg-transparent cursor-pointer range-slider-thumb"
          style={{ zIndex: 40 }}
        />

        <div className="relative w-full h-1 bg-gray-200 rounded-full top-3">
          <div
            className="absolute h-1 bg-black rounded-full"
            style={{
              left: `${getPercent(localValue[0])}%`,
              width: `${getPercent(localValue[1]) - getPercent(localValue[0])}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center border border-gray-200 rounded px-3 py-2 w-full">
            <span className="text-gray-500 mr-1">R</span>
            <input 
                type="number" 
                min={min}
                max={localValue[1]}
                value={localValue[0]}
                onChange={handleMinChange}
                className="w-full outline-none text-right font-medium"
            />
        </div>
        <span className="text-gray-500">to</span>
        <div className="flex items-center border border-gray-200 rounded px-3 py-2 w-full">
            <span className="text-gray-500 mr-1">R</span>
            <input 
                type="number" 
                min={localValue[0]}
                max={max}
                value={localValue[1]}
                onChange={handleMaxChange}
                className="w-full outline-none text-right font-medium"
            />
        </div>
      </div>
    </div>
  );
};
