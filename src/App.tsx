/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParticleWave } from './components/ParticleWave';
import { TextTransition } from './components/TextTransition';
import { TrendsDashboard } from './components/TrendsDashboard';
import { ComparePage } from './components/ComparePage';

// Logo as Base64 to ensure reliable loading on all platforms (e.g. GitHub Pages)
const logoImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAAeCAYAAABwmH1PAAAACXBIWXMAACE4AAAhOAFFljFgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAAAhRJREFUeAHdmO2RwiAQhkkHlpASUoLXgR1IB2cHpoOzg6QDS7gSYgeUEDvYgxGU4WDZBW7mzDvDH9yP95HEbBTCCgC+xEal2Sa9dv6GhIcmsTFZWKPR31Tw0mZOWrOcPa7VbUr4rbN4cwWwTjI83U1AJ2CNltQJs6F1bK/XVa9vt0Sh/Bp29YzcM8JzckEjEnQkNDGwKkwUhYp4UBRo4xXhGMPgIugUbGPgLDQLlgC96jUIBqzZF+XAigNtvFmPdFgv+QIE6BwsMO67iIdc7V0TWK/IjIGYhnotWIyolO2TAlmsB+yLmTn9ctAp2OilXwE9ZKAVMGE7pJm5bMyjhQpw1+uj67obFqTr7iPbN513T8QP1sdO0HSzPu6CK8Av3VAHQr0+kdtn8g5A0wL+S0KJLLTKNJLEWkXANldmPCho8Nvhmk1YI0adYmCbrxAfbd70AB/V2jbDfUwEH3XzPxH2z6F17S+GjzJoJmxdszIfazMfgMOa8RN7PjaDzsAOgM//NB+Aw168uH11s3If/og7F/vQAZ9I8hyJxx4VJ1GojA8ZiZ/ZPgB/vboi5lLQtX8A0M3jOUZHDmx2eoH4vdQaeMzk5KbCows81MAi0C2BR2JeDnqfOh0jBcxRDR6T1HOJQsHr1a8v9KASTNIVX2th/5MS0C+m4JTfGtYpAj35H7pT3gSsUwDdhx+etgTrZKGfA9MPmNjNj5/rMMgAAAAASUVORK5CYII=";

// --- Types ---
interface PhoneData {
  brand: string;
  model: string;
  release_date: string;
  first_sale_date: string;
  starting_price: string;
  series_type: string;
  year: string;
  month: string;
}

interface BrandColors {
  [key: string]: string;
}

// --- Constants ---
const BRAND_COLORS: BrandColors = {
  "Samsung": "#4b8df8",
  "Huawei": "#ff3333",
  "Xiaomi": "#ff8c00",
  "vivo": "#4575fb",
  "OPPO": "#05d58b",
  "HONOR": "#b886ff"
};

const TYPE_TRANSLATION: { [key: string]: string } = {
  "large_fold": "大折叠",
  "small_fold": "小折叠"
};

const RAW_DATA: { [year: string]: { [month: string]: any[] } } = {
  "2019": { "02": [{ "brand": "Samsung", "model": "Galaxy Fold", "release_date": "2019/2/21", "first_sale_date": "2019/11/8", "starting_price": "¥15,999", "series_type": "large_fold" }], "10": [{ "brand": "Huawei", "model": "Mate X", "release_date": "2019/10/23", "first_sale_date": "2019/11/15", "starting_price": "¥16,999", "series_type": "large_fold" }] },
  "2020": { "02": [{ "brand": "Samsung", "model": "Z Flip", "release_date": "2020/2/11", "first_sale_date": "2020/2/20", "starting_price": "¥11,999", "series_type": "small_fold" }, { "brand": "Huawei", "model": "Mate Xs", "release_date": "2020/2/24", "first_sale_date": "2020/3/5", "starting_price": "¥16,999", "series_type": "large_fold" }], "07": [{ "brand": "Samsung", "model": "Z Flip 5G", "release_date": "2020/7/22", "first_sale_date": "2020/8/7", "starting_price": "¥12,499", "series_type": "small_fold" }], "09": [{ "brand": "Samsung", "model": "Z Fold2", "release_date": "2020/9/1", "first_sale_date": "2020/9/25", "starting_price": "¥16,999", "series_type": "large_fold" }] },
  "2021": { "02": [{ "brand": "Huawei", "model": "Mate X2", "release_date": "2021/2/22", "first_sale_date": "2021/2/25", "starting_price": "¥17,999", "series_type": "large_fold" }], "03": [{ "brand": "Xiaomi", "model": "MIX Fold", "release_date": "2021/3/30", "first_sale_date": "2021/4/16", "starting_price": "¥9,999", "series_type": "large_fold" }], "08": [{ "brand": "Samsung", "model": "Z Flip3", "release_date": "2021/8/11", "first_sale_date": "2021/9/10", "starting_price": "¥7,599", "series_type": "small_fold" }, { "brand": "Samsung", "model": "Z Fold3", "release_date": "2021/8/11", "first_sale_date": "2021/9/10", "starting_price": "¥14,999", "series_type": "large_fold" }], "12": [{ "brand": "Huawei", "model": "P50 Pocket", "release_date": "2021/12/23", "first_sale_date": "2021/12/23", "starting_price": "¥8,988", "series_type": "small_fold" }, { "brand": "OPPO", "model": "Find N", "release_date": "2021/12/15", "first_sale_date": "2021/12/23", "starting_price": "¥7,699", "series_type": "large_fold" }] },
  "2022": { "01": [{ "brand": "HONOR", "model": "Magic V", "release_date": "2022/1/10", "first_sale_date": "2022/1/18", "starting_price": "¥9,999", "series_type": "large_fold" }], "04": [{ "brand": "Huawei", "model": "Mate Xs 2", "release_date": "2022/4/28", "first_sale_date": "2022/5/6", "starting_price": "¥9,999", "series_type": "large_fold" }, { "brand": "vivo", "model": "X Fold", "release_date": "2022/4/11", "first_sale_date": "2022/4/22", "starting_price": "¥8,999", "series_type": "large_fold" }], "08": [{ "brand": "Samsung", "model": "Z Flip4", "release_date": "2022/8/10", "first_sale_date": "2022/9/2", "starting_price": "¥7,499", "series_type": "small_fold" }, { "brand": "Samsung", "model": "Z Fold4", "release_date": "2022/8/10", "first_sale_date": "2022/9/2", "starting_price": "¥12,999", "series_type": "large_fold" }, { "brand": "Xiaomi", "model": "MIX Fold 2", "release_date": "2022/8/11", "first_sale_date": "2022/8/16", "starting_price": "¥8,999", "series_type": "large_fold" }], "09": [{ "brand": "vivo", "model": "X Fold+", "release_date": "2022/9/26", "first_sale_date": "2022/9/29", "starting_price": "¥9,999", "series_type": "large_fold" }], "11": [{ "brand": "Huawei", "model": "Pocket S", "release_date": "2022/11/2", "first_sale_date": "2022/11/10", "starting_price": "¥5,988", "series_type": "small_fold" }, { "brand": "HONOR", "model": "Magic Vs", "release_date": "2022/11/23", "first_sale_date": "2022/12/2", "starting_price": "¥7,499", "series_type": "large_fold" }], "12": [{ "brand": "OPPO", "model": "Find N2 Flip", "release_date": "2022/12/15", "first_sale_date": "2022/12/30", "starting_price": "¥5,999", "series_type": "small_fold" }, { "brand": "OPPO", "model": "Find N2", "release_date": "2022/12/15", "first_sale_date": "2022/12/23", "starting_price": "¥7,999", "series_type": "large_fold" }] },
  "2023": { "03": [{ "brand": "Huawei", "model": "Mate X3", "release_date": "2023/3/23", "first_sale_date": "2023/4/7", "starting_price": "¥12,999", "series_type": "large_fold" }], "04": [{ "brand": "vivo", "model": "X Flip", "release_date": "2023/4/20", "first_sale_date": "2023/4/28", "starting_price": "¥5,999", "series_type": "small_fold" }, { "brand": "vivo", "model": "X Fold2", "release_date": "2023/4/20", "first_sale_date": "2023/4/28", "starting_price": "¥8,999", "series_type": "large_fold" }], "07": [{ "brand": "Samsung", "model": "Z Flip5", "release_date": "2023/7/26", "first_sale_date": "2023/8/11", "starting_price": "¥7,499", "series_type": "small_fold" }, { "brand": "Samsung", "model": "Z Fold5", "release_date": "2023/7/26", "first_sale_date": "2023/8/11", "starting_price": "¥12,999", "series_type": "large_fold" }, { "brand": "Xiaomi", "model": "MIX Fold 4", "release_date": "2023/7/19", "first_sale_date": "2023/7/23", "starting_price": "¥8,999", "series_type": "large_fold" }, { "brand": "HONOR", "model": "Magic V2", "release_date": "2023/7/12", "first_sale_date": "2023/7/20", "starting_price": "¥8,999", "series_type": "large_fold" }], "08": [{ "brand": "OPPO", "model": "Find N3 Flip", "release_date": "2023/8/29", "first_sale_date": "2023/9/8", "starting_price": "¥6,799", "series_type": "small_fold" }, { "brand": "Xiaomi", "model": "MIX Fold 3", "release_date": "2023/8/14", "first_sale_date": "2023/8/16", "starting_price": "¥8,999", "series_type": "large_fold" }], "09": [{ "brand": "Huawei", "model": "Mate X5", "release_date": "2023/9/8", "first_sale_date": "2023/9/8", "starting_price": "¥12,999", "series_type": "large_fold" }], "10": [{ "brand": "OPPO", "model": "Find N3", "release_date": "2023/10/19", "first_sale_date": "2023/10/27", "starting_price": "¥9,999", "series_type": "large_fold" }, { "brand": "HONOR", "model": "Magic Vs2", "release_date": "2023/10/12", "first_sale_date": "2023/10/17", "starting_price": "¥6,999", "series_type": "large_fold" }] },
  "2024": { "02": [{ "brand": "Huawei", "model": "Pocket 2", "release_date": "2024/2/22", "first_sale_date": "2024/2/27", "starting_price": "¥7,499", "series_type": "small_fold" }], "03": [{ "brand": "vivo", "model": "X Fold3", "release_date": "2024/3/26", "first_sale_date": "2024/3/30", "starting_price": "¥6,999", "series_type": "large_fold" }], "07": [{ "brand": "Samsung", "model": "Z Flip6", "release_date": "2024/7/10", "first_sale_date": "2024/7/24", "starting_price": "¥7,999", "series_type": "small_fold" }, { "brand": "Xiaomi", "model": "MIX Flip", "release_date": "2024/7/19", "first_sale_date": "2024/7/23", "starting_price": "¥5,999", "series_type": "small_fold" }, { "brand": "Samsung", "model": "Z Fold6", "release_date": "2024/7/10", "first_sale_date": "2024/7/24", "starting_price": "¥13,999", "series_type": "large_fold" }, { "brand": "HONOR", "model": "Magic V3", "release_date": "2024/7/12", "first_sale_date": "2024/7/19", "starting_price": "¥8,999", "series_type": "large_fold" }, { "brand": "HONOR", "model": "Magic Vs3", "release_date": "2024/7/12", "first_sale_date": "2024/7/19", "starting_price": "¥6,999", "series_type": "large_fold" }], "08": [{ "brand": "Huawei", "model": "Nova Flip", "release_date": "2024/8/5", "first_sale_date": "2024/8/9", "starting_price": "¥5,288", "series_type": "small_fold" }], "09": [{ "brand": "Huawei", "model": "Mate XT 非凡大师", "release_date": "2024/9/10", "first_sale_date": "2024/9/20", "starting_price": "¥19,999", "series_type": "large_fold" }], "11": [{ "brand": "Huawei", "model": "Mate X6", "release_date": "2024/11/26", "first_sale_date": "2024/12/6", "starting_price": "¥12,999", "series_type": "large_fold" }] },
  "2025": { "02": [{ "brand": "OPPO", "model": "Find N5", "release_date": "2025/2/20", "first_sale_date": "2025/2/26", "starting_price": "¥8,999", "series_type": "large_fold" }], "03": [{ "brand": "Huawei", "model": "Pura X", "release_date": "2025/3/20", "first_sale_date": "2025/3/30", "starting_price": "¥7,499", "series_type": "small_fold" }], "06": [{ "brand": "Xiaomi", "model": "MIX Flip2", "release_date": "2025/6/26", "first_sale_date": "2025/6/26", "starting_price": "¥5,999", "series_type": "small_fold" }, { "brand": "vivo", "model": "X Fold5", "release_date": "2025/6/25", "first_sale_date": "2025/7/2", "starting_price": "¥6,999", "series_type": "large_fold" }], "07": [{ "brand": "Samsung", "model": "Z Flip7", "release_date": "2025/7/9", "first_sale_date": "2025/7/25", "starting_price": "¥7,999", "series_type": "small_fold" }, { "brand": "Samsung", "model": "Z Flip7 FE", "release_date": "2025/7/9", "first_sale_date": "2024/7/25", "starting_price": "¥6,499", "series_type": "small_fold" }, { "brand": "Samsung", "model": "Z Fold7", "release_date": "2025/7/9", "first_sale_date": "2025/7/25", "starting_price": "¥13,999", "series_type": "large_fold" }, { "brand": "HONOR", "model": "Magic V5", "release_date": "2025/7/2", "first_sale_date": "2025/7/4", "starting_price": "¥8,999", "series_type": "large_fold" }], "09": [{ "brand": "Huawei", "model": "Mate XTs 非凡大师", "release_date": "2025/9/4", "first_sale_date": "2025/9/12", "starting_price": "¥17,999", "series_type": "large_fold" }], "11": [{ "brand": "Huawei", "model": "Mate X7", "release_date": "2025/11/25", "first_sale_date": "2025/12/5", "starting_price": "¥12,999", "series_type": "large_fold" }] },
  "2026": { "02": [{ "brand": "OPPO", "model": "Find N6", "release_date": "2026/2/28", "first_sale_date": "2026/3/17", "starting_price": "¥9,999", "series_type": "large_fold" }], "03": [{ "brand": "HONOR", "model": "Magic V6", "release_date": "2026/3/10", "first_sale_date": "2026/3/13", "starting_price": "¥8,999", "series_type": "large_fold" }] }
};

const YEARS = ["2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];

// --- Helper Functions ---
const getBaseData = (): PhoneData[] => {
  const base: PhoneData[] = [];
  for (const year in RAW_DATA) {
    for (const month in RAW_DATA[year]) {
      RAW_DATA[year][month].forEach(item => base.push({ year, month, ...item }));
    }
  }
  return base.sort((a, b) => a.year.localeCompare(b.year) || a.month.localeCompare(b.month));
};

const TARGET_COUNT = 280;
const PROCESSED_DATA = Array.from({ length: TARGET_COUNT }, (_, i) => {
  const base = getBaseData();
  const phone = base[i % base.length];
  return {
    ...phone,
    scatterOffset: Math.pow(Math.random(), 1.5) * 200,
    depthOpacity: (Math.random() * 0.4 + 0.1).toFixed(2),
    id: `phone-${i}`
  };
});

export default function App() {
  const [activeTab, setActiveTab ] = useState<'home' | 'trends' | 'compare'>('home');
  const [defaultCompareModel, setDefaultCompareModel] = useState<string | undefined>(undefined);
  const [activePhone, setActivePhone] = useState<PhoneData & { id: string } | null>(null);
  const [activeFilterYear, setActiveFilterYear] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const dialLayerRef = useRef<HTMLDivElement>(null);
  const dataLayerRef = useRef<HTMLDivElement>(null);
  const phoneElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const yearLabelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mousePosRef = useRef({ x: 0, y: 0 });
  
  const yearAngleRef = useRef(0);
  const dataAngleRef = useRef(0);
  const startMouseAngleRef = useRef(0);
  const lastYearAngleRef = useRef(0);
  const lastDataAngleRef = useRef(0);
  const isDraggingOperationRef = useRef(false);

  const autoRotateSpeed = 0.015;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayData = useMemo(() => {
    if (isMobile) {
      // Further reduce density to 20% (keep 1 item every 5)
      return PROCESSED_DATA.filter((_, i) => i % 5 === 0);
    }
    return PROCESSED_DATA;
  }, [isMobile]);

  // --- De-duplication Logic ---
  const filteredUniqueModels = useMemo(() => {
    if (!activeFilterYear) return [];
    const seenModels = new Set();
    const unique: typeof PROCESSED_DATA = [];
    displayData.forEach(p => {
      if (p.year === activeFilterYear && !seenModels.has(p.model)) {
        seenModels.add(p.model);
        unique.push(p);
      }
    });
    return unique;
  }, [activeFilterYear, displayData]);

  const uniqueModelIds = useMemo(() => new Set(filteredUniqueModels.map(p => p.id)), [filteredUniqueModels]);

  // --- Animation Loop ---
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (!isHovering && !isDragging) {
        yearAngleRef.current += autoRotateSpeed;
        dataAngleRef.current = yearAngleRef.current * 3;
      }

      if (dialLayerRef.current) dialLayerRef.current.style.transform = `rotate(${yearAngleRef.current}deg)`;
      if (dataLayerRef.current) dataLayerRef.current.style.transform = `rotate(${dataAngleRef.current}deg)`;
      
      const { centerX, centerY, radius } = getDialConfig();
      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;
      const isMobileLayout = window.innerWidth <= 768;

      displayData.forEach((phone, index) => {
        const el = phoneElementsRef.current[index];
        if (!el) return;

        const rayContainer = el.parentElement;
        if (!rayContainer) return;

        // 1. Update Rotation
        const currentRayAngle = getRayAngle(index, phone.year);
        rayContainer.style.transform = `rotate(${currentRayAngle}deg)`;

        // 2. Proximity Magnification
        let scale = 1;
        let brightness = 0;

        const dxMouse = mouseX - centerX;
        const dyMouse = mouseY - centerY;
        const mouseDistFromDialCenter = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
        // Use responsive radius for axis logic
        const axisRadius = radius + (isMobileLayout ? 100 : 50);
        const isOnPhoneAxis = mouseDistFromDialCenter > (axisRadius - 100) && mouseDistFromDialCenter < (axisRadius + 100);

        if (isHovering && isOnPhoneAxis && (!activeFilterYear || phone.year === activeFilterYear)) {
          const totalAngleRad = (dataAngleRef.current + currentRayAngle) * (Math.PI / 180);
          
          let px, py;
          if (isMobileLayout) {
             px = centerX + axisRadius * Math.cos(totalAngleRad);
             py = centerY + axisRadius * Math.sin(totalAngleRad);
          } else {
             px = centerX - axisRadius * Math.cos(totalAngleRad);
             py = centerY + axisRadius * Math.sin(totalAngleRad);
          }
          
          const dx = mouseX - px;
          const dy = mouseY - py;
          const d = Math.sqrt(dx * dx + dy * dy);
          
          const effectRadius = isMobileLayout ? 45 : 25; 
          if (d < effectRadius) {
            const power = Math.pow(1 - (d / effectRadius), 2); 
            scale = 1 + power * 1.5; 
            brightness = power;
            const pushX = power * (isMobileLayout ? 20 : 40);
            el.style.transform = `translateY(-50%) translateX(${pushX}px) scale(${scale})`;
          } else {
            el.style.transform = `translateY(-50%) scale(1)`;
          }
        } else {
          el.style.transform = `translateY(-50%) scale(1)`;
        }
        
        // 3. Update Visuals
        const isActive = activePhone?.id === phone.id;
        const isActiveFilter = activeFilterYear === phone.year;

        if (isActive) {
          el.style.opacity = '1';
          el.style.textShadow = `0 0 20px ${BRAND_COLORS[phone.brand] || '#ffffff'}cc`;
        } else if (brightness > 0) {
          el.style.opacity = String(0.8 + brightness * 0.2);
          el.style.textShadow = `0 0 ${10 + brightness * 10}px ${BRAND_COLORS[phone.brand]}aa`;
        } else {
          const isDimmed = activeFilterYear && !isActiveFilter;
          const isDuplicate = activeFilterYear && isActiveFilter && !uniqueModelIds.has(phone.id);
          
          if (isDuplicate) {
            el.style.opacity = '0';
          } else if (isDimmed) {
            // Increased dimmed visibility on mobile to solve "blank sectors" artifacts
            el.style.opacity = isMobileLayout ? '0.12' : '0.05';
          } else if (activeFilterYear) {
            el.style.opacity = '0.8';
          } else {
            el.style.opacity = phone.depthOpacity || '1';
          }
          el.style.textShadow = 'none';
        }
      });

    // 3. Year Labels: 
    yearLabelsRef.current.forEach((el, i) => {
      if (!el) return;
      if (isMobileLayout) {
        // Tangential (perpendicular to ticks) - flipped 180 as requested
        el.style.transform = `rotate(-90deg)`;
      } else {
        // Horizontal on PC
        const tickAngle = i * 45;
        const totalRotation = yearAngleRef.current + tickAngle;
        el.style.transform = `rotate(${-totalRotation}deg)`;
      }
    });

    animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovering, isDragging, activeFilterYear, activePhone, displayData, uniqueModelIds]);

  // --- Touch/Mouse Helpers ---
  const getDialConfig = () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      return {
        centerX: window.innerWidth * 0.5,
        centerY: window.innerHeight * 1.15 - 60,
        radius: window.innerWidth * 0.8
      };
    }
    return {
      centerX: window.innerWidth * 1.15,
      centerY: window.innerHeight / 2,
      radius: (window.innerWidth * 0.65) - 120
    };
  };

  const getMouseAngle = (clientX: number, clientY: number) => {
    const { centerX, centerY } = getDialConfig();
    const x = clientX - centerX;
    const y = clientY - centerY;
    return Math.atan2(y, x) * (180 / Math.PI);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    const { centerX, centerY, radius } = getDialConfig();
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Hot zone is 100px around the dial radius
    if (Math.abs(distance - radius) > 100) {
      return;
    }

    setIsDragging(true);
    isDraggingOperationRef.current = false;
    startMouseAngleRef.current = getMouseAngle(clientX, clientY);
    lastYearAngleRef.current = yearAngleRef.current;
    lastDataAngleRef.current = dataAngleRef.current;
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const currentMouseAngle = getMouseAngle(clientX, clientY);
    let deltaAngle = currentMouseAngle - startMouseAngleRef.current;

    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    if (Math.abs(deltaAngle) > 1) {
      isDraggingOperationRef.current = true;
    }

    yearAngleRef.current = lastYearAngleRef.current + deltaAngle;
    dataAngleRef.current = lastDataAngleRef.current + (deltaAngle * 3);

    if (dialLayerRef.current) dialLayerRef.current.style.transform = `rotate(${yearAngleRef.current}deg)`;
    if (dataLayerRef.current) dataLayerRef.current.style.transform = `rotate(${dataAngleRef.current}deg)`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  }, [isDragging, handleDragMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [isDragging, handleDragMove]);

  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => {
        isDraggingOperationRef.current = false;
      }, 50);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove, handleDragEnd]);

  // --- Initial Selection ---
  useEffect(() => {
    if (displayData.length > 0) {
      setActivePhone(displayData[0] as any);
    }
  }, [displayData]);

  const handleYearClick = (year: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDraggingOperationRef.current) return;

    if (activeFilterYear === year) {
      setActiveFilterYear(null);
    } else {
      setActiveFilterYear(year);
      // Clear active phone if it doesn't match the filtered year
      if (activePhone && activePhone.year !== year) {
        setActivePhone(null);
      }
    }
  };

  const handlePhoneClick = (phone: any) => {
    if (isDraggingOperationRef.current) return;
    // If filtering is active, only allow clicking models from that year
    if (activeFilterYear && phone.year !== activeFilterYear) return;
    setActivePhone(phone);
  };

  const handleGoToCompare = (model: string) => {
    setDefaultCompareModel(model);
    setActiveTab('compare');
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    if (isDraggingOperationRef.current) return;
    const target = e.target as HTMLElement;
    if (target.classList.contains('right-panel') || target.classList.contains('star-trails-layer')) {
      setActiveFilterYear(null);
    }
  };

  // --- Calculate Ray Angles ---
  const getRayAngle = (index: number, phoneYear: string) => {
    const totalItems = displayData.length;
    const defaultAngle = index * (360 / totalItems);
    if (!activeFilterYear) return defaultAngle;

    if (phoneYear === activeFilterYear) {
      const yearIndex = YEARS.indexOf(activeFilterYear);
      const baseAngle = yearIndex * 45 - (yearAngleRef.current * 2);
      
      // Find matching items to distribute them in the arc (de-duplicated)
      const itemIndexInMatch = filteredUniqueModels.findIndex(p => p.id === displayData[index].id);
      
      if (itemIndexInMatch !== -1) {
        const arcWidth = isMobile ? 60 : 40; // Wider sector on mobile to reduce crowding
        const step = arcWidth / Math.max(1, filteredUniqueModels.length - 1);
        return baseAngle - (arcWidth / 2) + (itemIndexInMatch * step);
      }
    }
    
    return defaultAngle;
  };

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#020203] text-white font-sans overflow-hidden">
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full z-[100] py-6 px-[6%] flex items-center bg-transparent">
        {/* Logo */}
        <div className="flex items-center mr-16 group cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="relative flex items-center h-6">
            <img 
              src={logoImg} 
              alt="Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          <span className="ml-4 text-[14px] font-bold tracking-[0.4em] text-white uppercase pt-0.5 hidden sm:block opacity-90">
            FoldHub
          </span>
        </div>

        <div className="flex space-x-12">
          {['Home', 'Trends', 'Compare'].map((item) => {
            const id = item.toLowerCase() as typeof activeTab;
            return (
              <button
                key={item}
                onClick={() => setActiveTab(id)}
                className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-light transition-colors duration-300 ${
                  activeTab === id ? 'text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col md:flex-row relative"
          >
            {/* Phone Info Panel (Top on mobile, Left on desktop) */}
      <div className="w-full h-[40%] md:w-[40%] md:h-full px-[6%] flex flex-col justify-center bg-[radial-gradient(circle_at_50%_0%,#0d0d14_0%,#020203_70%)] md:bg-[radial-gradient(circle_at_0%_50%,#0d0d14_0%,#020203_70%)] z-50 relative">
        <ParticleWave 
          color={activePhone ? BRAND_COLORS[activePhone.brand] : "#ffffff"} 
          triggerId={activePhone?.id} 
        />
        <AnimatePresence mode="wait">
          {activePhone && (
              <motion.div
                key={activePhone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="max-w-md mx-auto md:mx-0 text-left"
              >
                <div 
                  className="text-lg md:text-2xl tracking-[4px] md:tracking-[6px] mb-[5px] md:mb-[15px] uppercase font-medium"
                  style={{ 
                    color: BRAND_COLORS[activePhone.brand] || "#ffffff",
                    textShadow: `0 0 15px ${BRAND_COLORS[activePhone.brand] || "#ffffff"}66`
                  }}
                >
                  {activePhone.brand}
                </div>
                
                <div 
                  className="mb-[20px] md:mb-[60px]"
                  title={activePhone.model}
                >
                  <TextTransition 
                    text={activePhone.model} 
                    className="text-[32px] md:text-[64px] font-extralight tracking-[1px] md:tracking-[2px] leading-tight whitespace-nowrap bg-gradient-to-r from-white to-[#888] bg-clip-text text-transparent"
                  />
                </div>

              <div className="grid grid-cols-2 gap-x-[10px] md:gap-x-[15px] gap-y-[15px] md:gap-y-[25px] mb-[20px] md:mb-[40px] border-t border-white/5 pt-[20px] md:pt-[40px] justify-items-center md:justify-items-start">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[11px] md:text-[13px] text-[#666] mb-1 md:mb-2 tracking-[1px]">发布时间</span>
                  <span className="text-sm md:text-base text-[#ccc] font-light">{activePhone.release_date}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[11px] md:text-[13px] text-[#666] mb-1 md:mb-2 tracking-[1px]">首销时间</span>
                  <span className="text-sm md:text-base text-[#ccc] font-light">{activePhone.first_sale_date}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[11px] md:text-[13px] text-[#666] mb-1 md:mb-2 tracking-[1px]">折叠类型</span>
                  <span className="text-sm md:text-base text-[#ccc] font-light">{TYPE_TRANSLATION[activePhone.series_type] || activePhone.series_type}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[11px] md:text-[13px] text-[#666] mb-1 md:mb-2 tracking-[1px]">发售价格</span>
                  <span className="text-sm md:text-base text-[#ccc] font-light">{activePhone.starting_price} 起</span>
                </div>
              </div>

              {/* Compare Link for Large Fold */}
              {activePhone.series_type === 'large_fold' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ x: 5 }}
                  onClick={() => handleGoToCompare(activePhone.model)}
                  className="flex items-center space-x-2 text-[10px] md:text-xs text-white/40 hover:text-white transition-colors group tracking-[0.2em] uppercase font-light"
                >
                  <span>参数对比详情</span>
                  <motion.span className="text-white/20 group-hover:text-white">→</motion.span>
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dial Panel (Bottom on mobile, Right on desktop) */}
      <div 
        className="right-panel w-full h-[60%] md:w-[60%] md:h-full relative overflow-hidden shadow-[inset_0_150px_150px_-150px_rgba(0,0,0,1)] md:shadow-[inset_150px_0_150px_-150px_rgba(0,0,0,1)]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseMove={(e) => {
          mousePosRef.current = { x: e.clientX, y: e.clientY };
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          setIsDragging(false);
        }}
        onClick={handlePanelClick}
      >
        <div className="circle-center absolute right-[var(--circle-center-right)] top-[var(--circle-center-top)] w-0 h-0 z-[1]">
          {/* Drag Handle Ring (Strictly limited to year axis: ticks and labels) */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10] pointer-events-none"
                  style={{ 
                    width: 'calc(var(--dial-radius) * 2 + 200px)', 
                    height: 'calc(var(--dial-radius) * 2 + 200px)',
                  }}
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="46" 
                      fill="none" 
                      stroke="transparent" 
                      strokeWidth="12" 
                      style={{ pointerEvents: 'stroke' }}
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={handleMouseDown}
                      onTouchStart={handleTouchStart}
                    />
                  </svg>
                </div>

          {/* Dial Layer (Years) */}
          <div ref={dialLayerRef} className="dial-layer absolute w-full h-full z-[20] pointer-events-none">
            {Array.from({ length: 360 }).map((_, i) => {
              const isLong = i % 45 === 0;
              const isMedium = i % 5 === 0;
              const yearIndex = i / 45;
              const year = YEARS[yearIndex];

              return (
                <div 
                  key={`tick-${i}`}
                  className="tick-container absolute right-0 top-0 w-[100vw] h-[2px] -mt-[1px] origin-right pointer-events-none"
                  style={{ transform: `rotate(${i}deg)` }}
                >
                  <div className={`tick-line absolute right-[var(--dial-radius)] h-full ${
                    isLong ? 'w-[35px] bg-[#777] shadow-[0_0_10px_rgba(255,255,255,0.1)]' : 
                    isMedium ? 'w-[18px] bg-[#444]' : 
                    'w-[8px] bg-[#222]'
                  }`}></div>
                  
                  {isLong && yearIndex < YEARS.length && (
                    <div 
                      ref={el => yearLabelsRef.current[yearIndex] = el}
                      className={`year-label absolute right-[calc(var(--dial-radius)+50px)] -top-[14px] text-xs md:text-[22px] font-extralight tracking-[2px] cursor-pointer transition-all duration-300 hover:text-white hover:scale-110 pointer-events-auto z-[60] ${
                        activeFilterYear === year ? 'text-white font-bold [text-shadow:0_0_15px_rgba(255,255,255,0.8)]' : 'text-[#666]'
                      }`}
                      style={{ transformOrigin: 'center center' }}
                      onClick={(e) => handleYearClick(year, e)}
                    >
                      {year}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Data Layer (Phones) */}
          <div ref={dataLayerRef} className="data-layer absolute w-full h-full z-[30] pointer-events-none">
            {displayData.map((phone, index) => {
              const isDimmed = activeFilterYear && phone.year !== activeFilterYear;
              const isActiveFilter = activeFilterYear === phone.year;
              const isDuplicateInFilter = activeFilterYear && isActiveFilter && !uniqueModelIds.has(phone.id);
              const isActivePhone = activePhone?.id === phone.id;
              const currentAngle = getRayAngle(index, phone.year);

              return (
                <div 
                  key={phone.id}
                  className={`ray absolute right-0 top-0 w-[100vw] h-[20px] -mt-[10px] origin-right transition-all duration-500 pointer-events-none ${
                    isDuplicateInFilter ? 'opacity-0' : isDimmed ? 'opacity-[0.05]' : 'opacity-100'
                  } ${isActiveFilter ? 'ray-active-filter' : ''}`}
                  style={{ transform: `rotate(${currentAngle}deg)` }}
                  data-year={phone.year}
                  data-index={index}
                >
                  <div 
                    ref={el => phoneElementsRef.current[index] = el}
                    className={`ray-text absolute top-1/2 -translate-y-1/2 text-base cursor-pointer whitespace-nowrap transition-all duration-400 p-[5px] before:content-[''] before:absolute before:-left-[5px] before:top-1/2 before:-translate-y-1/2 before:w-0 before:h-[2px] before:bg-current before:transition-all before:duration-400 hover:opacity-100 hover:text-xl hover:z-[100] ${
                      (!activeFilterYear || (isActiveFilter && !isDuplicateInFilter)) ? 'pointer-events-auto' : 'pointer-events-none'
                    } ${
                      isActivePhone 
                        ? 'opacity-100 font-bold text-2xl z-[200] brightness-125 before:w-[calc(20px+var(--scatter-offset))] before:-left-[calc(25px+var(--scatter-offset))] before:[box-shadow:0_0_8px_currentColor]' 
                        : isActiveFilter 
                          ? (activePhone ? 'opacity-30 font-light' : 'opacity-80 font-medium z-[150]') 
                          : 'opacity-[var(--depth-opacity)]'
                    }`}
                    style={{ 
                      left: `calc(var(--data-base-left) + ${phone.scatterOffset}px)`,
                      color: BRAND_COLORS[phone.brand] || "#ffffff",
                      // @ts-ignore
                      '--scatter-offset': `${phone.scatterOffset}px`,
                      '--depth-opacity': phone.depthOpacity,
                      textShadow: isActiveFilter && !activePhone
                          ? `0 0 12px ${BRAND_COLORS[phone.brand]}aa` 
                          : 'none',
                      willChange: 'transform, opacity',
                      transformOrigin: 'left center'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePhoneClick(phone);
                    }}
                  >
                    {phone.brand} {phone.model}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  ) : activeTab === 'trends' ? (
    <TrendsDashboard key="trends" />
  ) : (
    <ComparePage key="compare" defaultModel={defaultCompareModel} />
  )}
</AnimatePresence>

      {/* Footer Signature (PC only) */}
      <div className="hidden md:block absolute bottom-6 left-10 text-[#555] text-xs tracking-wider z-[100] font-light">
        © 2026 Jessie. All rights reserved. Designed by Zander.
      </div>
    </div>
  );
}
