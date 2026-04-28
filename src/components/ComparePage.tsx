import React, { useState } from 'react';
import { motion } from 'motion/react';
import { COMPARISON_DATA } from '../constants/comparison';
import { Cpu, Smartphone, Shield, Battery, Camera, Layers, Info, Plus, X, Maximize2, Weight, Sun, Zap, CloudRain, Award } from 'lucide-react';

interface ParameterRowProps {
  label: string;
  icon?: React.ReactNode;
  values: (string | string[] | null)[];
  highlightCriteria?: 'highest' | 'lowest' | 'none';
  gridCols?: number;
}

const extractNumber = (val: any): number | null => {
  if (typeof val !== 'string') return null;
  const match = val.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

const ParameterRow: React.FC<ParameterRowProps> = ({ label, icon, values, highlightCriteria = 'none', gridCols = 3 }) => {
  const numericValues = values.map(v => {
    if (Array.isArray(v)) return null;
    return extractNumber(v);
  });

  const bestIdx = React.useMemo(() => {
    if (highlightCriteria === 'none') return -1;
    
    let targetIdx = -1;
    let targetVal = highlightCriteria === 'highest' ? -Infinity : Infinity;
    
    numericValues.forEach((num, idx) => {
      if (num !== null) {
        if (highlightCriteria === 'highest' && num > targetVal) {
          targetVal = num;
          targetIdx = idx;
        } else if (highlightCriteria === 'lowest' && num < targetVal) {
          targetVal = num;
          targetIdx = idx;
        }
      }
    });

    return targetIdx;
  }, [numericValues, highlightCriteria]);

  // Use a stable grid class mapping
  const gridClasses: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
  };
  const currentGridClass = gridClasses[gridCols] || 'md:grid-cols-3';

  // Pad values to match gridCols so that the structural layout aligns with header
  const paddedValues = [...values];
  while (paddedValues.length < gridCols) {
    paddedValues.push(null);
  }

  return (
    <div className="py-10 border-b border-white/5 last:border-0 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-center">
      <div className="flex items-center space-x-4 lg:flex-col lg:items-start lg:space-x-0 lg:space-y-4">
        <div className="p-2.5 bg-white/5 rounded-lg text-white/40">
          {icon || <Info size={18} strokeWidth={1.5} />}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-white/40 font-semibold">
            {label}
          </span>
          <span className="text-[9px] text-white/10 uppercase tracking-widest hidden lg:block mt-1">Specification</span>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 ${currentGridClass} gap-8 md:gap-12 w-full`}>
        {paddedValues.map((val, idx) => {
          const isWinner = idx === bestIdx;
          // Placeholder for the empty slot (Add button column)
          if (val === null && idx >= values.length) {
            return <div key={`empty-${idx}`} className="hidden md:block" />;
          }
          return (
            <div key={idx} className="flex flex-col items-center text-center px-4 relative group">
              {Array.isArray(val) ? (
                <div className="space-y-4">
                  {val.map((item, i) => (
                    <p key={i} className="text-sm md:text-base font-light text-white/80 leading-relaxed italic">
                      {`"${item}"`}
                    </p>
                  ))}
                </div>
              ) : val ? (
                <div className="relative w-full">
                  <p className={`text-sm md:text-base transition-all duration-500 whitespace-pre-line ${
                    isWinner 
                      ? 'font-medium text-white scale-105 [text-shadow:0_0_20px_rgba(255,255,255,0.3)]' 
                      : 'font-light text-white/60'
                  }`}>
                    {val}
                  </p>
                  {isWinner && (
                    <motion.div 
                      layoutId={`winner-badge-${label}`}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-white bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-tighter"
                    >
                      Best
                    </motion.div>
                  )}
                </div>
              ) : (
                <span className="text-white/10">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ComparePage: React.FC<{ defaultModel?: string }> = ({ defaultModel }) => {
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    if (defaultModel && COMPARISON_DATA.some(m => m.model === defaultModel)) {
      const results = [defaultModel];
      const others = COMPARISON_DATA
        .filter(m => m.model !== defaultModel)
        .slice(0, 2)
        .map(m => m.model);
      return [...results, ...others];
    }
    return [
      COMPARISON_DATA[0].model,
      COMPARISON_DATA[1].model,
      COMPARISON_DATA[2].model
    ];
  });

  const activeModels = selectedModels.map(name => 
    COMPARISON_DATA.find(m => m.model === name)!
  );

  const handleModelChange = (index: number, newModel: string) => {
    const next = [...selectedModels];
    next[index] = newModel;
    setSelectedModels(next);
  };

  const addColumn = () => {
    if (selectedModels.length < 5) {
      // Add a model that isn't already selected, if possible
      const availableModels = COMPARISON_DATA.filter(m => !selectedModels.includes(m.model));
      const nextModel = availableModels.length > 0 ? availableModels[0].model : COMPARISON_DATA[0].model;
      setSelectedModels([...selectedModels, nextModel]);
    }
  };

  const removeColumn = (index: number) => {
    if (selectedModels.length > 1) {
      const next = selectedModels.filter((_, i) => i !== index);
      setSelectedModels(next);
    }
  };

  const totalCols = selectedModels.length + (selectedModels.length < 5 ? 1 : 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full bg-[#020203] overflow-y-auto pt-32 pb-24 custom-scrollbar"
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Header: Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 mb-12 items-center">
          <div className="hidden lg:block">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">FoldHub Comparison</p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-${totalCols} gap-8 md:gap-12 items-center`}>
            {selectedModels.map((selected, idx) => (
              <div key={idx} className="flex flex-col items-center relative group">
                {selectedModels.length > 1 && (
                  <button 
                    onClick={() => removeColumn(idx)}
                    className="absolute -top-4 -right-2 p-1.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/5 z-10"
                  >
                    <X size={12} />
                  </button>
                )}
                <div className="relative w-full">
                  <select 
                    value={selected}
                    onChange={(e) => handleModelChange(idx, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-4 rounded-xl text-xs md:text-sm font-light appearance-none cursor-pointer hover:bg-white/10 transition-all text-center focus:outline-none focus:ring-1 focus:ring-white/20 truncate"
                  >
                    {COMPARISON_DATA.map(m => (
                      <option key={m.model} value={m.model} className="bg-[#111]">{m.model}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <span className="text-[10px]">▼</span>
                  </div>
                </div>
              </div>
            ))}

            {selectedModels.length < 5 && (
              <button 
                onClick={addColumn}
                className="flex flex-col items-center group w-full"
              >
                <div className="w-full bg-white/5 border border-dashed border-white/10 text-white/20 p-4 rounded-xl text-xs md:text-sm font-light flex items-center justify-center space-x-2 cursor-pointer group-hover:bg-white/10 group-hover:border-white/30 group-hover:text-white transition-all min-h-[58px]">
                  <Plus size={16} strokeWidth={1} />
                  <span className="uppercase tracking-[0.2em]">Add New</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Display Info */}
        <ParameterRow 
          label="Display Size" 
          icon={<Maximize2 size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => `${m.parameters["主屏尺寸"]} / ${m.parameters["外屏尺寸"]}\n(Main / Cover)`)}
          highlightCriteria="highest"
          gridCols={totalCols}
        />
        
        <ParameterRow 
          label="Resolution & Tech" 
          icon={<Smartphone size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["主屏分辨率"])}
          gridCols={totalCols}
        />

        <ParameterRow 
          label="Peak Brightness" 
          icon={<Sun size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["峰值亮度"])}
          highlightCriteria="highest"
          gridCols={totalCols}
        />

        {/* Dimensions */}
        <ParameterRow 
          label="Folded Thickness" 
          icon={<Layers size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => `${m.parameters["厚度（展开）"]} / ${m.parameters["厚度（折叠）"]}\n(展开 / 折叠)`)}
          highlightCriteria="lowest"
          gridCols={totalCols}
        />

        <ParameterRow 
          label="Weight" 
          icon={<Weight size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["重量"])}
          highlightCriteria="lowest"
          gridCols={totalCols}
        />

        {/* Performance */}
        <ParameterRow 
          label="Processor" 
          icon={<Cpu size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["处理器"])}
          gridCols={totalCols}
        />

        {/* Camera */}
        <ParameterRow 
          label="Rear Camera System" 
          icon={<Camera size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => `${m.parameters["后摄主摄"]}\nTele: ${m.parameters["长焦摄像头"]}\nUW: ${m.parameters["超广角摄像头"]}`)}
          highlightCriteria="highest"
          gridCols={totalCols}
        />

        <ParameterRow 
          label="Zoom Range" 
          icon={<Maximize2 size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["变焦"])}
          gridCols={totalCols}
        />

        {/* Battery & Charging */}
        <ParameterRow 
          label="Battery Capacity" 
          icon={<Battery size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["电池"])}
          highlightCriteria="highest"
          gridCols={totalCols}
        />

        <ParameterRow 
          label="Charging Logic" 
          icon={<Zap size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["充电"])}
          highlightCriteria="highest"
          gridCols={totalCols}
        />

        {/* Durability */}
        <ParameterRow 
          label="Hinge Tech" 
          icon={<Award size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => `${m.parameters["铰链"]}`)}
          gridCols={totalCols}
        />

        <ParameterRow 
          label="Environmental protection" 
          icon={<CloudRain size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["防尘防水"])}
          gridCols={totalCols}
        />

        {/* Top Highlights */}
        <ParameterRow 
          label="Core Highlights" 
          icon={<Info size={20} strokeWidth={1.5} />}
          values={activeModels.map(m => m.parameters["Top卖点"])}
          gridCols={totalCols}
        />

        {/* Final CTA Spacer */}
        <div className="py-24 text-center">
          <p className="text-white/20 text-xs uppercase tracking-[0.4em]">End of Comparison</p>
        </div>
      </div>
    </motion.div>
  );
};
