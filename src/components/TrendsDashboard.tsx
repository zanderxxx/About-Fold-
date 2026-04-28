import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, AreaChart, Area, PieChart, Pie, Sector
} from 'recharts';
import { ChevronRight, Filter } from 'lucide-react';

const BRAND_COLORS: Record<string, string> = {
  "Huawei": "#ff3333",
  "Samsung": "#4b8df8",
  "Honor": "#b886ff",
  "OPPO": "#05d58b",
  "vivo": "#4575fb",
  "Xiaomi": "#ff8c00",
  "Lenovo": "#e11d48",
  "Others": "#555555"
};

const RAW_MARKET_DATA = [
  {
    "year": 2021,
    "brands": [
      { "brand": "Huawei", "share": 49.3 },
      { "brand": "Samsung", "share": 28.8 },
      { "brand": "Xiaomi", "share": 13.2 },
      { "brand": "OPPO", "share": 6.1 },
      { "brand": "Lenovo", "share": 0.2 },
      { "brand": "Others", "share": 2.4 }
    ]
  },
  {
    "year": 2022,
    "brands": [
      { "brand": "Huawei", "share": 47.4 },
      { "brand": "Samsung", "share": 16.5 },
      { "brand": "OPPO", "share": 13.8 },
      { "brand": "vivo", "share": 7.7 },
      { "brand": "Honor", "share": 6.6 },
      { "brand": "Xiaomi", "share": 6.4 },
      { "brand": "Lenovo", "share": 1.6 }
    ]
  },
  {
    "year": 2023,
    "brands": [
      { "brand": "Huawei", "share": 37.4 },
      { "brand": "OPPO", "share": 18.3 },
      { "brand": "Honor", "share": 17.7 },
      { "brand": "Samsung", "share": 11.0 },
      { "brand": "vivo", "share": 9.7 },
      { "brand": "Xiaomi", "share": 4.6 },
      { "brand": "Lenovo", "share": 1.4 }
    ]
  },
  {
    "year": 2024,
    "brands": [
      { "brand": "Huawei", "share": 48.6 },
      { "brand": "Honor", "share": 20.6 },
      { "brand": "vivo", "share": 11.1 },
      { "brand": "Xiaomi", "share": 7.4 },
      { "brand": "OPPO", "share": 5.3 },
      { "brand": "Others", "share": 7.0 }
    ]
  },
  {
    "year": 2025,
    "brands": [
      { "brand": "Huawei", "share": 71.8 },
      { "brand": "Honor", "share": 9.1 },
      { "brand": "vivo", "share": 4.9 },
      { "brand": "OPPO", "share": 4.3 },
      { "brand": "Samsung", "share": 4.3 },
      { "brand": "Others", "share": 5.7 }
    ]
  }
];

const BRANDS = ["Huawei", "Honor", "Samsung", "vivo", "OPPO", "Xiaomi", "Lenovo", "Others"];

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111] border border-white/10 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-xs text-white/50 mb-1 uppercase tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 py-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color || BRAND_COLORS[entry.name] || '#fff' }} 
            />
            <span className="text-sm font-light text-white/90">{entry.name}:</span>
            <span className="text-sm font-medium" style={{ color: entry.color || BRAND_COLORS[entry.name] || '#fff' }}>
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PieYearCard: React.FC<{ 
  yearData: typeof RAW_MARKET_DATA[0];
  brandColors: Record<string, string>;
}> = React.memo(({ yearData, brandColors }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pieData = useMemo(() => yearData.brands.filter(b => b.share !== null), [yearData]);
  
  const PieTooltip = ({ active, payload, coordinate }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="absolute pointer-events-none z-[9999]"
          style={{ 
            left: coordinate?.x ? coordinate.x : 0, 
            top: coordinate?.y ? coordinate.y : 0,
            transform: 'translate(12px, -110%)'
          }}
        >
          <div className="bg-[#111]/95 border border-white/15 px-3 py-2 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl min-w-[100px] ring-1 ring-white/10">
            <p className="text-[9px] text-white/40 mb-1.5 uppercase tracking-[0.2em] font-medium">
              {payload[0]?.name}
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-light text-white">
                {payload[0]?.value}%
              </span>
              <div 
                className="w-1.5 h-1.5 rounded-full ring-2 ring-white/5" 
                style={{ backgroundColor: payload[0]?.color || brandColors[payload[0]?.name] || '#fff' }} 
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col h-full transition-all duration-300 hover:bg-white/[0.04] group relative overflow-visible"
    >
      <div className="flex justify-between items-center mb-2 relative z-10">
        <span className="text-xl font-light tracking-widest text-white/90 group-hover:text-white transition-colors">{yearData.year}</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors">Annual Share</span>
      </div>
      <div className="flex-1 w-full relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={hoveredIndex !== null ? hoveredIndex : undefined}
              activeShape={renderActiveShape}
              data={pieData}
              dataKey="share"
              nameKey="brand"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              animationDuration={500}
              onMouseEnter={(_, index) => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              stroke="none"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={brandColors[entry.brand] || '#fff'} 
                  style={{ 
                    filter: hoveredIndex !== null && hoveredIndex !== index ? 'grayscale(0.8) opacity(0.2)' : 'none',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              content={<PieTooltip />} 
              wrapperStyle={{ pointerEvents: 'none', visibility: 'visible' }}
              cursor={false}
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
});

export const TrendsDashboard: React.FC = () => {
  const [activeBrands, setActiveBrands] = useState<Set<string>>(new Set(BRANDS));
  const [expandedYear, setExpandedYear] = useState<number>(2025);

  const toggleBrand = (brand: string) => {
    setActiveBrands(prev => {
      const next = new Set(prev);
      if (next.has(brand)) {
        if (next.size > 1) next.delete(brand);
      } else {
        next.add(brand);
      }
      return next;
    });
  };

  const trendsData = useMemo(() => {
    return RAW_MARKET_DATA.map(yearData => {
      const entry: any = { year: yearData.year };
      yearData.brands.forEach(b => {
        entry[b.brand] = b.share;
      });
      return entry;
    });
  }, []);

  const distributionYears = useMemo(() => [...RAW_MARKET_DATA].sort((a, b) => b.year - a.year), []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-screen flex flex-col px-[6%] md:pb-12 md:pt-24 bg-[#020203] overflow-hidden"
    >
      <div className="flex flex-col items-start mb-12 space-y-8 shrink-0">
        <div className="z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl md:text-4xl font-extralight tracking-tighter mb-4 text-white uppercase"
          >
            Market Trends
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-xs md:text-sm tracking-[0.3em] uppercase"
          >
            China Foldable Smartphone Share (IDC Data)
          </motion.p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10">
          {BRANDS.map(brand => (
            <button
              key={brand}
              onClick={() => toggleBrand(brand)}
              className={`px-4 py-1.5 rounded-full border text-[9px] uppercase tracking-widest transition-all duration-300 flex items-center space-x-2 ${
                activeBrands.has(brand)
                  ? 'bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                  : 'bg-transparent border-white/5 text-white/15 hover:border-white/10'
              }`}
            >
              <div 
                className="w-1 h-1 rounded-full" 
                style={{ 
                  backgroundColor: BRAND_COLORS[brand],
                  boxShadow: activeBrands.has(brand) ? `0 0 6px ${BRAND_COLORS[brand]}` : 'none',
                  opacity: activeBrands.has(brand) ? 1 : 0.3
                }} 
              />
              <span>{brand}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-12 min-h-0">
        <div className="md:col-span-3 flex flex-col min-h-0">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <defs>
                  {BRANDS.map(brand => (
                    <linearGradient key={`grad-${brand}`} id={`color-${brand}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_COLORS[brand]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={BRAND_COLORS[brand]} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis 
                  dataKey="year" 
                  stroke="#ffffff60" 
                  fontSize={12} 
                  fontWeight={500}
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <Tooltip content={<CustomLineTooltip />} />
                {BRANDS.filter(b => activeBrands.has(b)).map(brand => (
                  <Area
                    key={brand}
                    type="monotone"
                    dataKey={brand}
                    name={brand}
                    stroke={BRAND_COLORS[brand]}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#color-${brand})`}
                    connectNulls
                    animationDuration={1500}
                    dot={{ 
                      r: 4, 
                      fill: '#020203', 
                      stroke: BRAND_COLORS[brand], 
                      strokeWidth: 2 
                    }}
                    activeDot={{ 
                      r: 6, 
                      fill: BRAND_COLORS[brand], 
                      stroke: '#020203', 
                      strokeWidth: 2 
                    }}
                    label={({ x, y, index, value, payload }) => {
                      // Only show label on the last point
                      if (index === trendsData.length - 1 && value !== null) {
                        return (
                          <text 
                            x={x + 12} 
                            y={y} 
                            fill={BRAND_COLORS[brand]} 
                            fontSize={10} 
                            fontWeight={600}
                            className="uppercase tracking-tighter"
                            dominantBaseline="middle"
                          >
                            {brand}
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hidden md:flex md:flex-col md:border-l md:border-white/5 md:pl-10 space-y-6 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-white/20 text-[10px] uppercase tracking-[0.4em] sticky top-0 bg-[#020203] py-4 z-20 border-b border-white/5 mb-2">Annual Breakdown</h3>
          
          <div className="flex-1 space-y-3">
            {distributionYears.map(yearData => {
              const isExpanded = expandedYear === yearData.year;
              return (
                <div key={yearData.year} className="flex flex-col">
                  <button 
                    onClick={() => setExpandedYear(yearData.year)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      isExpanded 
                        ? 'bg-white/[0.05] border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' 
                        : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5 opacity-40 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm tracking-widest transition-colors ${isExpanded ? 'text-white font-medium' : 'text-white/60'}`}>
                        {yearData.year}
                      </span>
                      {isExpanded && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1 h-1 rounded-full bg-white/40"
                        />
                      )}
                    </div>
                    <ChevronRight 
                      size={14} 
                      className={`transition-transform duration-500 ${isExpanded ? 'rotate-90 text-white' : 'text-white/20'}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 400, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="py-6 h-full">
                          <PieYearCard 
                            yearData={yearData} 
                            brandColors={BRAND_COLORS}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="pt-8 border-t border-white/5 pb-10 mt-auto">
            <div className="flex items-start space-x-3 text-white/40 opacity-60">
              <ChevronRight size={14} className="mt-1 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-light leading-relaxed tracking-[0.2em] uppercase opacity-40 mb-1.5">Market Insights</p>
                <p className="text-[11px] font-light leading-relaxed">
                  Huawei maintains dominance in the Chinese market, reaching over 70% share in early 2025.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
