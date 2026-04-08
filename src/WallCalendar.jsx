import { useState, useEffect, useCallback, useRef } from "react"

// ─── Utility ─────────────────────────────────────────────────────────────────
function cn(...classes) { return classes.filter(Boolean).join(" ") }

// ─── Per-Month Themes ─────────────────────────────────────────────────────────
const MONTH_THEMES = [
  { accent:"#4F93CE", light:"#4F93CE18", glow:"#4F93CE40", season:"Winter", emoji:"❄️"  },
  { accent:"#E879A0", light:"#E879A018", glow:"#E879A040", season:"Winter", emoji:"💕"  },
  { accent:"#34C78A", light:"#34C78A18", glow:"#34C78A40", season:"Spring", emoji:"🌱"  },
  { accent:"#F4A623", light:"#F4A62318", glow:"#F4A62340", season:"Spring", emoji:"🌸"  },
  { accent:"#6AC42E", light:"#6AC42E18", glow:"#6AC42E40", season:"Spring", emoji:"🌿"  },
  { accent:"#0DB9D7", light:"#0DB9D718", glow:"#0DB9D740", season:"Summer", emoji:"☀️"  },
  { accent:"#FF6B35", light:"#FF6B3518", glow:"#FF6B3540", season:"Summer", emoji:"🏖️" },
  { accent:"#E8C132", light:"#E8C13218", glow:"#E8C13240", season:"Summer", emoji:"🌻"  },
  { accent:"#9B59B6", light:"#9B59B618", glow:"#9B59B640", season:"Autumn", emoji:"🍂"  },
  { accent:"#D4611A", light:"#D4611A18", glow:"#D4611A40", season:"Autumn", emoji:"🎃"  },
  { accent:"#7C6BBA", light:"#7C6BBA18", glow:"#7C6BBA40", season:"Autumn", emoji:"🍁"  },
  { accent:"#40B3E0", light:"#40B3E018", glow:"#40B3E040", season:"Winter", emoji:"🎄"  },
]

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS_OF_WEEK       = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const DAYS_OF_WEEK_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
const DAYS_OF_WEEK_TINY  = ["S","M","T","W","T","F","S"]
const HERO_IMAGE         = "/mountain.jpg"

const MONTHS_2022 = [
  { name:"January",   year:2022, daysCount:31, startDay:6 },
  { name:"February",  year:2022, daysCount:28, startDay:2 },
  { name:"March",     year:2022, daysCount:31, startDay:2 },
  { name:"April",     year:2022, daysCount:30, startDay:5 },
  { name:"May",       year:2022, daysCount:31, startDay:0 },
  { name:"June",      year:2022, daysCount:30, startDay:3 },
  { name:"July",      year:2022, daysCount:31, startDay:5 },
  { name:"August",    year:2022, daysCount:31, startDay:1 },
  { name:"September", year:2022, daysCount:30, startDay:4 },
  { name:"October",   year:2022, daysCount:31, startDay:6 },
  { name:"November",  year:2022, daysCount:30, startDay:2 },
  { name:"December",  year:2022, daysCount:31, startDay:4 },
]

const HOLIDAYS_2022 = {
  "1-1":"New Year's Day","1-17":"MLK Day","2-21":"Presidents' Day",
  "5-30":"Memorial Day","6-19":"Juneteenth","7-4":"Independence Day",
  "9-5":"Labor Day","10-10":"Columbus Day","11-11":"Veterans Day",
  "11-24":"Thanksgiving","12-25":"Christmas Day",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCalendarDays(month) {
  const days = []
  for (let i = 0; i < month.startDay; i++) days.push(null)
  for (let d = 1; d <= month.daysCount; d++) days.push(d)
  return days
}

// ─── localStorage keys ────────────────────────────────────────────────────────
const KEY_NOTES      = (idx) => `calendar-notes-${MONTHS_2022[idx].name.toLowerCase()}-2022`
const KEY_DATE_NOTES = ()    => `calendar-date-notes-2022`
const KEY_THEME      = ()    => `calendar-theme-preference`
const KEY_SELECTION  = (idx) => `calendar-selection-${MONTHS_2022[idx].name.toLowerCase()}-2022`

// ─── WallMountingSystem ───────────────────────────────────────────────────────
function WallMountingSystem({ isDark }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-30" style={{ top:"-52px" }}>
      <div className="relative">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-5 rounded-full blur-lg opacity-40"
          style={{ background:"rgba(0,0,0,0.5)" }} />
        <div className="relative w-7 h-7 rounded-full mx-auto"
          style={{
            background: isDark
              ? "conic-gradient(from 45deg,#78716c 0%,#d6d3d1 25%,#78716c 50%,#a8a29e 75%,#78716c 100%)"
              : "conic-gradient(from 45deg,#a8a29e 0%,#f5f5f4 25%,#a8a29e 50%,#d6d3d1 75%,#a8a29e 100%)",
            boxShadow:"0 4px 8px rgba(0,0,0,0.35),inset 0 2px 4px rgba(255,255,255,0.6),inset 0 -2px 4px rgba(0,0,0,0.25)",
          }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full"
            style={{ background: isDark ? "radial-gradient(circle,#57534e 0%,#292524 100%)" : "radial-gradient(circle,#78716c 0%,#44403c 100%)", boxShadow:"inset 0 2px 4px rgba(0,0,0,0.6)" }}>
            <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2 bg-black/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-black/30" />
          </div>
          <div className="absolute top-1 left-1 w-2.5 h-2 rounded-full opacity-60"
            style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.9) 0%,transparent 100%)" }} />
        </div>
        <div className="relative flex justify-center">
          <svg className="absolute top-0 left-1/2" width="44" height="48" style={{ transform:"translateX(-50%)" }}>
            <path d="M 22 0 Q 9 20 16 46"  fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 22 0 Q 35 20 28 46" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 22 0 Q 7 18 16 46"  fill="none" stroke={isDark?"#78716c":"#b5afa9"} strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 22 0 Q 37 18 28 46" fill="none" stroke={isDark?"#78716c":"#b5afa9"} strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 22 0 Q 6 16 16 44"  fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round"/>
            <path d="M 22 0 Q 38 16 28 44" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── CalendarHangingHole ──────────────────────────────────────────────────────
function CalendarHangingHole({ isDark }) {
  return (
    <div className="absolute -top-px left-1/2 -translate-x-1/2 z-20">
      <div className="relative w-9 h-9 rounded-full flex items-center justify-center"
        style={{
          background: isDark ? "linear-gradient(180deg,#52524e 0%,#2d2d2a 100%)" : "linear-gradient(180deg,#e7e5e4 0%,#78716c 100%)",
          boxShadow: isDark ? "0 3px 6px rgba(0,0,0,0.5),inset 0 1px 2px rgba(255,255,255,0.1)" : "0 3px 6px rgba(0,0,0,0.2),inset 0 1px 3px rgba(255,255,255,0.7)",
        }}>
        <div className="w-4 h-4 rounded-full"
          style={{ background: isDark ? "linear-gradient(180deg,#1c1917 0%,#0c0a09 100%)" : "linear-gradient(180deg,#57534e 0%,#1c1917 100%)", boxShadow:"inset 0 2px 6px rgba(0,0,0,0.9)" }} />
        <div className="absolute top-1 left-1.5 w-3 h-1.5 rounded-full opacity-40"
          style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)" }} />
      </div>
    </div>
  )
}

// ─── SpiralBinding ────────────────────────────────────────────────────────────
function SpiralBinding({ isDark, isAnimating }) {
  return (
    <div className={cn("relative flex justify-center items-center py-3.5 transition-colors duration-500",
        isDark ? "bg-gradient-to-b from-stone-800 to-stone-900" : "bg-gradient-to-b from-stone-200 to-stone-300")}
      style={{ boxShadow: isDark ? "inset 0 -4px 10px rgba(0,0,0,0.5),inset 0 2px 4px rgba(255,255,255,0.04)" : "inset 0 -4px 10px rgba(0,0,0,0.12),inset 0 2px 6px rgba(255,255,255,0.9)" }}>
      <div className="flex gap-[calc((100%-64px)/12)] px-8 w-full">
        {Array.from({ length:13 }).map((_,i) => (
          <div key={i} className="relative flex-shrink-0"
            style={{ transform: isAnimating ? `translateY(${Math.sin(i*0.6)*4}px) rotate(${Math.sin(i*0.3)*6}deg)` : "translateY(0)", transition:`transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*25}ms` }}>
            <div className={cn("w-5 h-5 md:w-6 md:h-6 rounded-full border-[3px] transition-all duration-300", isDark ? "border-stone-500 bg-stone-700" : "border-stone-400 bg-stone-200")}
              style={{ boxShadow: isDark ? "0 3px 6px rgba(0,0,0,0.5),inset 0 1px 3px rgba(255,255,255,0.1)" : "0 3px 6px rgba(0,0,0,0.2),inset 0 1px 3px rgba(255,255,255,0.95)" }}>
              <div className={cn("absolute inset-1 rounded-full", isDark ? "bg-stone-950" : "bg-stone-700")}
                style={{ boxShadow: isDark ? "inset 0 2px 4px rgba(0,0,0,0.9)" : "inset 0 2px 4px rgba(0,0,0,0.7)" }} />
              <div className="absolute top-0.5 left-1 w-2.5 h-1.5 rounded-full opacity-50"
                style={{ background:"radial-gradient(ellipse,rgba(255,255,255,0.8) 0%,transparent 100%)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HeroImageSection ─────────────────────────────────────────────────────────
function HeroImageSection({ isDark, isFlipping, currentMonth, flipDirection, monthIdx }) {
  const containerRef   = useRef(null)
  const [mousePos,     setMousePos]     = useState({ x:0, y:0 })
  const [isHovering,   setIsHovering]   = useState(false)
  const [ripples,      setRipples]      = useState([])
  const [spotlightPos, setSpotlightPos] = useState({ x:50, y:50 })
  const theme = MONTH_THEMES[monthIdx]

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    setMousePos({ x:e.clientX-r.left, y:e.clientY-r.top })
    setSpotlightPos({ x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 })
  }
  const handleClick = (e) => {
    if (!containerRef.current) return
    const r = containerRef.current.getBoundingClientRect()
    const id = Date.now()
    setRipples(p => [...p, { id, x:e.clientX-r.left, y:e.clientY-r.top }])
    setTimeout(() => setRipples(p => p.filter(x => x.id !== id)), 1200)
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden group cursor-crosshair"
      style={{ aspectRatio:"16/9" }}
      onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)} onClick={handleClick}>

      <div className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          transform: isFlipping ? `perspective(1800px) rotateX(${flipDirection==="next"?"-10":"10"}deg) scale(0.96)` : "perspective(1800px) rotateX(0deg) scale(1)",
          transformOrigin: flipDirection==="next" ? "bottom center" : "top center",
        }}>
        <img src={HERO_IMAGE} alt={`${currentMonth.name} ${currentMonth.year}`}
          className={cn("w-full h-full object-cover transition-all duration-700 ease-out", isFlipping && "brightness-75 blur-sm")}
          style={{ transform: isHovering ? `scale(1.05) translate(${(spotlightPos.x-50)*-0.02}%,${(spotlightPos.y-50)*-0.02}%)` : "scale(1)", transition:"transform 0.4s ease-out" }} />

        {/* Multi-layer overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:"linear-gradient(to bottom,rgba(0,0,0,0.15) 0%,transparent 40%,rgba(0,0,0,0.65) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{ background: isHovering ? `radial-gradient(ellipse 75% 55% at ${spotlightPos.x}% ${spotlightPos.y}%,transparent 0%,rgba(0,0,0,0.5) 100%)` : "radial-gradient(ellipse 75% 55% at 50% 50%,transparent 0%,rgba(0,0,0,0.4) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{ background:`linear-gradient(135deg,${theme.accent}20 0%,transparent 55%)`, opacity:isHovering?0.8:0.5 }} />

        {/* Cursor glow */}
        {isHovering && (
          <div className="absolute pointer-events-none rounded-full"
            style={{ left:mousePos.x-80, top:mousePos.y-80, width:160, height:160,
              background:`radial-gradient(circle,${theme.glow} 0%,${theme.accent}15 40%,transparent 70%)`,
              filter:"blur(12px)", transition:"left 0.08s ease-out,top 0.08s ease-out" }} />
        )}

        {/* Click ripples */}
        {ripples.map(r => (
          <div key={r.id} className="absolute pointer-events-none rounded-full"
            style={{ left:r.x-25, top:r.y-25, width:50, height:50,
              border:`2px solid ${theme.accent}bb`, animation:"heroRipple 1.1s ease-out forwards" }} />
        ))}

        {/* Corner frame on hover */}
        <div className={cn("absolute inset-5 pointer-events-none transition-opacity duration-300", isHovering?"opacity-100":"opacity-0")}>
          {[["top-0 left-0","border-t-2 border-l-2 rounded-tl"],["top-0 right-0","border-t-2 border-r-2 rounded-tr"],["bottom-0 left-0","border-b-2 border-l-2 rounded-bl"],["bottom-0 right-0","border-b-2 border-r-2 rounded-br"]].map(([pos, cls], i) => (
            <div key={i} className={`absolute ${pos} w-10 h-10 ${cls}`} style={{ borderColor:`${theme.accent}cc` }} />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length:8 }).map((_,i) => (
            <div key={i} className="absolute rounded-full"
              style={{ width:`${1.5+(i%3)}px`, height:`${1.5+(i%3)}px`, backgroundColor:`${theme.accent}aa`,
                left:`${10+i*11}%`, animation:`floatUp ${5+i*0.7}s ease-in-out infinite`, animationDelay:`${i*0.5}s` }} />
          ))}
        </div>
      </div>

      {/* Bottom text overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none">
        <div className="flex items-end justify-between">
          <div className="overflow-hidden">
            <p className={cn("text-white/70 text-sm tracking-[0.25em] uppercase font-light transition-all duration-500 delay-75", isFlipping?"translate-y-full opacity-0":"translate-y-0 opacity-100")}
              style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>{currentMonth.year}</p>
            <h2 className={cn("text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight transition-all duration-500", isFlipping?"translate-y-full opacity-0":"translate-y-0 opacity-100")}
              style={{ fontFamily:"'Playfair Display',Georgia,serif", textShadow:"0 2px 20px rgba(0,0,0,0.6),0 0 40px rgba(0,0,0,0.3)" }}>
              {currentMonth.name}
            </h2>
          </div>
          <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md text-white transition-all duration-500", isFlipping?"opacity-0 scale-90":"opacity-100 scale-100")}
            style={{ background:`${theme.accent}55`, border:`1px solid ${theme.accent}77`, boxShadow:`0 0 20px ${theme.glow}` }}>
            <span className="text-base leading-none">{theme.emoji}</span>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ fontFamily:"'DM Sans',sans-serif" }}>{theme.season}</span>
          </div>
        </div>
      </div>

      {/* Year progress bar at bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background:`${theme.accent}25` }}>
        <div className="h-full transition-all duration-1000 ease-out" style={{ width:`${(monthIdx+1)/12*100}%`, background:theme.accent, boxShadow:`0 0 8px ${theme.glow}` }} />
      </div>
    </div>
  )
}

// ─── SimpleTooltip ────────────────────────────────────────────────────────────
function SimpleTooltip({ children, content, accent }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && content && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg shadow-2xl text-xs whitespace-nowrap pointer-events-none"
          style={{ background:"rgba(12,10,9,0.95)", color:"#f5f5f4", border:`1px solid ${accent}55`,
            boxShadow:`0 8px 24px rgba(0,0,0,0.5),0 0 0 1px ${accent}22`, backdropFilter:"blur(8px)", animation:"tooltipIn 0.15s ease-out",
            fontFamily:"'DM Sans',sans-serif" }}>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor:"rgba(12,10,9,0.95)" }} />
          {content}
        </div>
      )}
    </div>
  )
}

// ─── CalendarDay ──────────────────────────────────────────────────────────────
function CalendarDay({ day, isDark, inRange, isStart, isEnd, isFocused, holiday, hasNote, onClick, currentMonth, dateNote, isWeekend, animDelay, accent, accentGlow, accentLight }) {
  const [isPressed, setIsPressed] = useState(false)
  const isEdge = isStart || isEnd

  if (day === null) {
    return (
      <div className={cn("w-full aspect-square border-b border-r", isDark ? "border-stone-700/40 bg-stone-900/20" : "border-stone-100 bg-stone-50/30")}
        style={{ animation:"cellFadeIn 0.4s ease-out both", animationDelay:`${animDelay}ms` }} />
    )
  }

  const tooltipContent = (holiday || hasNote) ? (
    <div>
      {holiday && <div style={{ color:"#f87171", fontWeight:700 }}>{holiday}</div>}
      {hasNote  && <div style={{ color:"#a8a29e", marginTop:holiday?3:0 }}>{dateNote}</div>}
    </div>
  ) : null

  return (
    <SimpleTooltip content={tooltipContent} accent={accent}>
      <button role="gridcell" onClick={onClick}
        onMouseDown={() => setIsPressed(true)} onMouseUp={() => setIsPressed(false)} onMouseLeave={() => setIsPressed(false)}
        tabIndex={isFocused?0:-1} aria-selected={inRange}
        aria-label={`${currentMonth.name} ${day}${holiday?`, ${holiday}`:""}${inRange?", selected":""}`}
        className={cn(
          "w-full aspect-square flex flex-col items-center justify-center relative overflow-hidden group",
          "border-b border-r focus:outline-none focus:ring-2 focus:ring-inset",
          isDark  ? "border-stone-700/40" : "border-stone-100",
          !inRange && !isWeekend && (isDark ? "text-stone-200" : "text-stone-700"),
          !inRange && isWeekend  && (isDark ? "text-stone-500" : "text-stone-400"),
          holiday && !inRange && "text-red-400",
        )}
        style={{
          animation:"cellFadeIn 0.4s ease-out both",
          animationDelay:`${animDelay}ms`,
          backgroundColor: inRange ? (isEdge ? accent : `${accent}30`) : undefined,
          color: inRange ? "white" : undefined,
          transform: isPressed ? "scale(0.85)" : "scale(1)",
          boxShadow: isEdge ? `inset 0 0 20px ${accentGlow}` : "none",
          transition:"transform 0.15s cubic-bezier(0.34,1.56,0.64,1),background-color 0.2s,box-shadow 0.2s",
        }}>

        {/* Hover shimmer */}
        {!inRange && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            style={{ background:`radial-gradient(circle at center,${accentLight} 0%,transparent 75%)` }} />
        )}

        {/* Start/end pulse */}
        {isEdge && (
          <div className="absolute inset-0 animate-pulse pointer-events-none opacity-30"
            style={{ background:`radial-gradient(circle,white 0%,transparent 65%)` }} />
        )}

        <span className={cn("relative z-10 font-semibold transition-transform duration-200 text-sm md:text-base lg:text-lg group-hover:scale-110")}
          style={{ fontFamily:"'DM Sans',sans-serif" }}>
          {day}
        </span>

        {/* Indicator dots */}
        {(holiday || hasNote) && (
          <div className="absolute bottom-1 flex gap-0.5 z-10">
            {holiday && <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-transform group-hover:scale-150"
              style={{ backgroundColor: inRange ? "rgba(255,255,255,0.9)" : "#f87171" }} />}
            {hasNote  && <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-transform group-hover:scale-150"
              style={{ backgroundColor: inRange ? "rgba(255,255,255,0.9)" : accent }} />}
          </div>
        )}
      </button>
    </SimpleTooltip>
  )
}

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value }) {
  const [displayed, setDisplayed] = useState(value)
  useEffect(() => {
    if (value === displayed) return
    const step = value > displayed ? 1 : -1
    const timer = setTimeout(() => setDisplayed(d => d + step), 40)
    return () => clearTimeout(timer)
  }, [value, displayed])
  return <>{displayed}</>
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconChevronLeft  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
const IconSun  = ({ active }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:active?"#fcd34d":"rgba(252,211,77,0.35)" }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
const IconMoon = ({ active }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:active?"#93c5fd":"rgba(147,197,253,0.35)" }}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
const IconDownload = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IconX        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconNote     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z"/><polyline points="15 3 15 9 21 9"/></svg>
const IconSparkles = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
const IconShield   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WallCalendar() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const [startDate,    setStartDate]    = useState(null)
  const [endDate,      setEndDate]      = useState(null)
  const [monthlyNotes, setMonthlyNotes] = useState("")
  const [dateNotes,    setDateNotes]    = useState([])
  const [isDark,       setIsDark]       = useState(false)
  const [isFlipping,   setIsFlipping]   = useState(false)
  const [flipDirection,setFlipDirection]= useState("next")
  const [focusedDay,   setFocusedDay]   = useState(null)
  const [hydrated,     setHydrated]     = useState(false)
  const [animKey,      setAnimKey]      = useState(0)

  const calendarRef = useRef(null)
  const touchStartX = useRef(null)
  const currentMonth = MONTHS_2022[currentMonthIndex]
  const calendarDays = getCalendarDays(currentMonth)
  const theme        = MONTH_THEMES[currentMonthIndex]

  // ── Hydration ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const savedTheme = localStorage.getItem(KEY_THEME())
    if (savedTheme) setIsDark(savedTheme === "dark")
    const savedDateNotes = localStorage.getItem(KEY_DATE_NOTES())
    if (savedDateNotes) { try { setDateNotes(JSON.parse(savedDateNotes)) } catch {} }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const savedNotes = localStorage.getItem(KEY_NOTES(currentMonthIndex))
    setMonthlyNotes(savedNotes || "")
    const savedSel = localStorage.getItem(KEY_SELECTION(currentMonthIndex))
    if (savedSel) {
      try { const { start, end } = JSON.parse(savedSel); setStartDate(start); setEndDate(end) }
      catch { setStartDate(null); setEndDate(null) }
    } else { setStartDate(null); setEndDate(null) }
  }, [currentMonthIndex, hydrated])

  useEffect(() => { if (hydrated) localStorage.setItem(KEY_NOTES(currentMonthIndex), monthlyNotes) },           [monthlyNotes, currentMonthIndex, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem(KEY_DATE_NOTES(), JSON.stringify(dateNotes)) },          [dateNotes, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem(KEY_THEME(), isDark ? "dark" : "light") },               [isDark, hydrated])
  useEffect(() => { if (hydrated) localStorage.setItem(KEY_SELECTION(currentMonthIndex), JSON.stringify({ start:startDate, end:endDate })) }, [startDate, endDate, currentMonthIndex, hydrated])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigateMonth = useCallback((direction) => {
    const newIndex = direction === "next" ? Math.min(currentMonthIndex+1,11) : Math.max(currentMonthIndex-1,0)
    if (newIndex === currentMonthIndex) return
    setFlipDirection(direction)
    setIsFlipping(true)
    setTimeout(() => { setCurrentMonthIndex(newIndex); setAnimKey(k => k+1); setTimeout(() => setIsFlipping(false), 120) }, 300)
  }, [currentMonthIndex])

  const jumpToMonth = (idx) => {
    if (idx === currentMonthIndex) return
    setFlipDirection(idx > currentMonthIndex ? "next" : "prev")
    setIsFlipping(true)
    setTimeout(() => { setCurrentMonthIndex(idx); setAnimKey(k => k+1); setTimeout(() => setIsFlipping(false), 120) }, 300)
  }

  // ── Date selection ─────────────────────────────────────────────────────────
  const handleDateClick = (day) => {
    if (startDate === null) { setStartDate(day); setEndDate(null) }
    else if (endDate === null) {
      if (day < startDate)       { setEndDate(startDate); setStartDate(day) }
      else if (day === startDate){ setStartDate(null) }
      else                       { setEndDate(day) }
    } else { setStartDate(day); setEndDate(null) }
    setFocusedDay(day)
  }

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!calendarRef.current?.contains(document.activeElement)) return
      const cur = focusedDay || 1
      let next = null
      switch(e.key) {
        case "ArrowRight": next = Math.min(cur+1,currentMonth.daysCount); break
        case "ArrowLeft":  next = Math.max(cur-1,1); break
        case "ArrowDown":  next = Math.min(cur+7,currentMonth.daysCount); break
        case "ArrowUp":    next = Math.max(cur-7,1); break
        case "Enter": case " ": e.preventDefault(); if (cur) handleDateClick(cur); break
      }
      if (next) { e.preventDefault(); setFocusedDay(next) }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [focusedDay, currentMonth.daysCount])

  // ── Helpers ────────────────────────────────────────────────────────────────
  const isInRange   = (day) => { if (!startDate) return false; if (!endDate) return day===startDate; return day>=startDate && day<=endDate }
  const getHoliday  = (day) => HOLIDAYS_2022[`${currentMonthIndex+1}-${day}`] || null
  const hasDateNote = (day) => { const k=`${currentMonth.name}-${day}-2022`; return dateNotes.some(n=>n.date===k) }
  const getDateNote = (day) => { const k=`${currentMonth.name}-${day}-2022`; return dateNotes.find(n=>n.date===k)?.note||"" }
  const setDateNote = (day, note) => {
    const k=`${currentMonth.name}-${day}-2022`
    setDateNotes(p => { const f=p.filter(n=>n.date!==k); return note.trim() ? [...f,{date:k,note}] : f })
  }
  const getRangeLength = () => { if (!startDate) return 0; if (!endDate) return 1; return endDate-startDate+1 }

  const exportCalendar = () => {
    const data = { month:currentMonth.name, year:currentMonth.year, selection:startDate&&endDate?{start:startDate,end:endDate}:null, monthlyNotes, dateNotes:dateNotes.filter(n=>n.date.startsWith(currentMonth.name)) }
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"})
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement("a"),{href:url,download:`calendar-${currentMonth.name.toLowerCase()}-2022.json`})
    a.click(); URL.revokeObjectURL(url)
  }

  // ── Touch ──────────────────────────────────────────────────────────────────
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) navigateMonth(diff>0?"next":"prev")
    touchStartX.current = null
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("min-h-screen transition-colors duration-700 flex items-start md:items-center justify-center p-3 md:p-6 lg:p-10 relative overflow-hidden",
        isDark ? "bg-stone-950" : "bg-stone-100")}>

      {/* Global keyframes + fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes heroRipple  { 0%{transform:scale(0);opacity:1} 100%{transform:scale(8);opacity:0} }
        @keyframes floatUp     { 0%,100%{transform:translateY(100%) scale(0);opacity:0} 10%{opacity:.9;transform:translateY(80%) scale(1)} 90%{opacity:.6;transform:translateY(5%) scale(1)} }
        @keyframes cellFadeIn  { from{opacity:0;transform:translateY(8px) scale(0.94)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes tooltipIn   { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes selectionIn { from{opacity:0;transform:translateY(-6px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes noteIn      { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer     { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ambientPulse{ 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes bgFloat     { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.02)} }
      `}</style>

      {/* Ambient background glow blobs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute rounded-full blur-[130px] transition-all duration-1000"
          style={{ top:"-15%", left:"-10%", width:"55vw", height:"55vw", background:`${theme.accent}10`, animation:"bgFloat 8s ease-in-out infinite,ambientPulse 5s ease-in-out infinite" }} />
        <div className="absolute rounded-full blur-[100px] transition-all duration-1000"
          style={{ bottom:"-15%", right:"-10%", width:"45vw", height:"45vw", background:`${theme.accent}0c`, animation:"bgFloat 10s ease-in-out infinite reverse,ambientPulse 5s ease-in-out infinite 2.5s" }} />
      </div>

      {/* ── Calendar wrapper ─────────────────────────────────────────────── */}
      <div className="w-full max-w-3xl relative pt-14 transition-all duration-500" style={{ perspective:"2400px" }}>
        <WallMountingSystem isDark={isDark} />

        {/* Depth shadow layers */}
        <div className="absolute inset-0 top-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: isDark
            ? "0 12px 24px rgba(0,0,0,0.4),0 48px 96px rgba(0,0,0,0.4),0 70px 110px -20px rgba(0,0,0,0.6)"
            : "0 12px 24px rgba(0,0,0,0.07),0 48px 96px rgba(0,0,0,0.1),0 70px 110px -20px rgba(0,0,0,0.18)" }} />

        {/* Calendar paper */}
        <div className={cn("rounded-2xl overflow-hidden transition-all duration-500 relative", isDark ? "bg-stone-900" : "bg-white")}
          style={{
            transform: isFlipping ? `rotateX(${flipDirection==="next"?"-4":"4"}deg) scale(0.99)` : "rotateX(0deg) scale(1)",
            transformOrigin:"center top",
            transition:"transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
            backgroundImage: isDark
              ? "radial-gradient(ellipse at 20% 0%,rgba(255,255,255,0.02) 0%,transparent 50%)"
              : "radial-gradient(ellipse at 20% 0%,rgba(255,255,255,0.9) 0%,transparent 50%),url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E\")",
          }}>

          <CalendarHangingHole isDark={isDark} />
          <SpiralBinding isDark={isDark} isAnimating={isFlipping} />

          {/* Hero + nav controls */}
          <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <HeroImageSection isDark={isDark} isFlipping={isFlipping} flipDirection={flipDirection} currentMonth={currentMonth} monthIdx={currentMonthIndex} />

            {/* Prev / Next arrows */}
            {[
              { dir:"prev", side:"left-3",  icon:<IconChevronLeft/>,  disabled:currentMonthIndex===0  },
              { dir:"next", side:"right-3", icon:<IconChevronRight/>, disabled:currentMonthIndex===11 },
            ].map(({ dir, side, icon, disabled }) => (
              <button key={dir} onClick={() => navigateMonth(dir)} disabled={disabled}
                className={cn(`absolute ${side} top-1/2 -translate-y-1/2 p-2.5 md:p-3 rounded-full backdrop-blur-md text-white`,
                  "transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed")}
                style={{ background:"rgba(0,0,0,0.4)", boxShadow:"0 4px 14px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.1)" }}
                aria-label={`${dir==="prev"?"Previous":"Next"} month`}>
                {icon}
              </button>
            ))}

            {/* Theme toggle */}
            <div className="absolute top-3 right-3 flex items-center gap-2 backdrop-blur-md rounded-full px-3 py-1.5"
              style={{ background:"rgba(0,0,0,0.4)", boxShadow:"0 4px 14px rgba(0,0,0,0.35),0 0 0 1px rgba(255,255,255,0.1)" }}>
              <IconSun active={!isDark} />
              <button role="switch" aria-checked={isDark} onClick={() => setIsDark(d => !d)}
                className="relative inline-flex h-5 w-9 items-center rounded-full focus:outline-none"
                style={{ backgroundColor: isDark ? theme.accent : "#d6d3d1", transition:"background-color 0.3s", boxShadow:`0 0 ${isDark?10:0}px ${theme.glow}` }}>
                <span className="inline-block h-4 w-4 rounded-full bg-white shadow-md"
                  style={{ transform:isDark?"translateX(18px)":"translateX(2px)", transition:"transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
              </button>
              <IconMoon active={isDark} />
            </div>
          </div>

          {/* ── Grid section ──────────────────────────────────────────────── */}
          <div className={cn("px-4 pb-5 pt-5 md:px-6 md:pb-6 transition-colors duration-500", isDark ? "bg-stone-900" : "bg-white")}>

            {/* Month quick-nav */}
            <div className="flex items-center justify-center gap-1 mb-5 flex-wrap">
              {MONTHS_2022.map((month, idx) => (
                <button key={month.name} onClick={() => jumpToMonth(idx)}
                  className="px-2 py-1 text-xs rounded-md transition-all duration-200"
                  style={idx === currentMonthIndex
                    ? { backgroundColor:theme.accent, color:"white", fontFamily:"'DM Sans',sans-serif", fontWeight:600, boxShadow:`0 0 12px ${theme.glow}`, transform:"scale(1.08)" }
                    : { color:isDark?"#78716c":"#a8a29e", fontFamily:"'DM Sans',sans-serif", fontWeight:500 }}>
                  {month.name.slice(0,3)}
                </button>
              ))}
            </div>

            {/* Year progress strip */}
            <div className="mb-5">
              <div className={cn("flex items-center justify-between mb-1.5 text-xs", isDark?"text-stone-600":"text-stone-400")}
                style={{ fontFamily:"'DM Sans',sans-serif" }}>
                <span>2022 Progress</span>
                <span style={{ color:theme.accent, fontWeight:600 }}>{Math.round((currentMonthIndex+1)/12*100)}%</span>
              </div>
              <div className={cn("relative h-1.5 rounded-full overflow-hidden", isDark?"bg-stone-800":"bg-stone-100")}>
                <div className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width:`${(currentMonthIndex+1)/12*100}%`, background:`linear-gradient(90deg,${theme.accent}88,${theme.accent})`, boxShadow:`0 0 8px ${theme.glow}` }}>
                  <div className="absolute inset-0 opacity-50"
                    style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)", backgroundSize:"200% 100%", animation:"shimmer 2s linear infinite" }} />
                </div>
              </div>
            </div>

            {/* Selection info bar */}
            {startDate && (
              <div className="mb-4 px-3.5 py-2.5 rounded-xl border flex items-center justify-between"
                style={{ backgroundColor:`${theme.accent}10`, borderColor:`${theme.accent}28`, animation:"selectionIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <span style={{ color:theme.accent, flexShrink:0 }}><IconSparkles /></span>
                  <span className={cn("text-sm font-medium truncate", isDark?"text-stone-200":"text-stone-700")}
                    style={{ fontFamily:"'DM Sans',sans-serif" }}>
                    {endDate ? `${currentMonth.name} ${startDate} – ${endDate}` : `${currentMonth.name} ${startDate}`}
                  </span>
                  <span className="flex-shrink-0 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold tabular-nums"
                    style={{ background:`linear-gradient(135deg,${theme.accent},${theme.accent}cc)`, boxShadow:`0 0 12px ${theme.glow}`, fontFamily:"'DM Sans',sans-serif" }}>
                    <AnimatedCounter value={getRangeLength()} /> {getRangeLength()===1?"day":"days"}
                  </span>
                </div>
                <button onClick={() => { setStartDate(null); setEndDate(null) }}
                  className={cn("p-1.5 rounded-lg ml-2 transition-all hover:scale-110 active:scale-90 flex-shrink-0", isDark?"hover:bg-stone-700/60":"hover:bg-stone-100")}
                  aria-label="Clear selection" style={{ color:isDark?"#78716c":"#a8a29e" }}>
                  <IconX />
                </button>
              </div>
            )}

            {/* Calendar grid */}
            <div ref={calendarRef} role="grid" aria-label="Calendar" className="mb-5">

              {/* Day headers */}
              <div className={cn("grid grid-cols-7 mb-1 border-b-2", isDark?"border-stone-800":"border-stone-100")}>
                {DAYS_OF_WEEK.map((day, idx) => (
                  <div key={day} role="columnheader"
                    className={cn("text-center text-xs font-semibold py-2 hidden lg:block uppercase tracking-widest",
                      (idx===0||idx===6)?(isDark?"text-stone-700":"text-stone-300"):(isDark?"text-stone-400":"text-stone-500"))}
                    style={{ fontFamily:"'DM Sans',sans-serif" }}>{day}</div>
                ))}
                {DAYS_OF_WEEK_SHORT.map((day, idx) => (
                  <div key={`s${idx}`} role="columnheader"
                    className={cn("text-center text-xs font-semibold py-2 hidden md:block lg:hidden uppercase tracking-wider",
                      (idx===0||idx===6)?(isDark?"text-stone-700":"text-stone-300"):(isDark?"text-stone-400":"text-stone-500"))}
                    style={{ fontFamily:"'DM Sans',sans-serif" }}>{day}</div>
                ))}
                {DAYS_OF_WEEK_TINY.map((day, idx) => (
                  <div key={`t${idx}`} role="columnheader"
                    className={cn("text-center text-xs font-semibold py-2 md:hidden uppercase",
                      (idx===0||idx===6)?(isDark?"text-stone-700":"text-stone-300"):(isDark?"text-stone-400":"text-stone-500"))}
                    style={{ fontFamily:"'DM Sans',sans-serif" }}>{day}</div>
                ))}
              </div>

              {/* Day cells */}
              <div key={`grid-${animKey}`}
                className={cn("grid grid-cols-7 border-l border-t overflow-hidden rounded-b-lg",
                  isDark?"border-stone-700/40":"border-stone-100")}>
                {calendarDays.map((day, index) => {
                  const dow   = index % 7
                  const col   = index % 7
                  const row   = Math.floor(index / 7)
                  const delay = col * 28 + row * 12
                  return (
                    <CalendarDay key={index} day={day} isDark={isDark}
                      inRange={day ? isInRange(day) : false}
                      isStart={day ? day===startDate : false}
                      isEnd={day   ? day===endDate   : false}
                      isFocused={day===focusedDay}
                      holiday={day ? getHoliday(day) : null}
                      hasNote={day ? hasDateNote(day) : false}
                      dateNote={day ? getDateNote(day) : ""}
                      onClick={() => day && handleDateClick(day)}
                      currentMonth={currentMonth}
                      isWeekend={dow===0||dow===6}
                      animDelay={delay}
                      accent={theme.accent}
                      accentGlow={theme.glow}
                      accentLight={theme.light}
                    />
                  )
                })}
              </div>
            </div>

            {/* Legend + Export row */}
            <div className={cn("flex flex-wrap items-center gap-3 text-xs pb-5 mb-5 border-b", isDark?"text-stone-600 border-stone-800":"text-stone-400 border-stone-100")}>
              {[
                { color:"#f87171", label:"Holiday" },
                { color:theme.accent, label:"Has note" },
                { color:`${theme.accent}55`, label:"In range" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor:color }} />
                  <span style={{ fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
                </div>
              ))}
              <div className="flex-1" />
              <span className="flex items-center gap-1" style={{ color:theme.accent, fontFamily:"'DM Sans',sans-serif" }}>
                {dateNotes.filter(n=>n.date.startsWith(currentMonth.name)).length} notes
              </span>
              <button onClick={exportCalendar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                style={{ background:`${theme.accent}15`, color:theme.accent, border:`1px solid ${theme.accent}28`, fontFamily:"'DM Sans',sans-serif" }}>
                <IconDownload /> Export
              </button>
            </div>

            {/* Notes area */}
            <div style={{ animation:"noteIn 0.4s ease-out" }}>

              {/* Monthly notes */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg" style={{ background:`${theme.accent}18` }}>
                    <span style={{ color:theme.accent }}><IconNote /></span>
                  </div>
                  <label htmlFor="calendar-notes" className={cn("text-sm font-semibold", isDark?"text-stone-200":"text-stone-700")}
                    style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
                    {currentMonth.name} Notes
                  </label>
                  <span className="ml-auto text-xs tabular-nums"
                    style={{ color:monthlyNotes.length>270?"#f87171":isDark?"#57534e":"#c7c3bd", fontFamily:"'DM Sans',sans-serif" }}>
                    {monthlyNotes.length}/300
                  </span>
                </div>
                <div className="relative">
                  {/* Ruled lines */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                    style={{ backgroundImage:`repeating-linear-gradient(to bottom,transparent,transparent 27px,${theme.accent}20 27px,${theme.accent}20 28px)`, backgroundPositionY:"13px", opacity:0.6 }} />
                  <textarea id="calendar-notes"
                    placeholder={`Thoughts and plans for ${currentMonth.name}…`}
                    value={monthlyNotes}
                    onChange={e => setMonthlyNotes(e.target.value.slice(0,300))}
                    rows={4} maxLength={300}
                    className="w-full rounded-xl border px-4 py-3 text-sm resize-none transition-all duration-300 focus:outline-none relative"
                    style={{
                      fontFamily:"'DM Sans',sans-serif", lineHeight:"1.95",
                      background: isDark ? `radial-gradient(ellipse at top left,${theme.accent}08,transparent 55%),rgb(24,22,20)` : `radial-gradient(ellipse at top left,${theme.accent}06,transparent 55%),rgb(252,251,250)`,
                      borderColor: isDark ? `${theme.accent}28` : `${theme.accent}22`,
                      color: isDark ? "#e7e5e4" : "#292524",
                    }}
                    onFocus={e => { e.target.style.borderColor=theme.accent; e.target.style.boxShadow=`0 0 0 3px ${theme.light},inset 0 2px 6px rgba(0,0,0,${isDark?0.15:0.04})` }}
                    onBlur={e => { e.target.style.borderColor=isDark?`${theme.accent}28`:`${theme.accent}22`; e.target.style.boxShadow="none" }}
                  />
                </div>
              </div>

              {/* Date-specific note */}
              {startDate  && (
                <div className="rounded-xl border p-4 mb-4" style={{ background:`${theme.accent}08`, borderColor:`${theme.accent}22`, animation:"noteIn 0.3s ease-out" }}>
                  <label htmlFor="date-note" className={cn("text-xs font-semibold block mb-2.5 flex items-center gap-2", isDark?"text-stone-300":"text-stone-600")}
                    style={{ fontFamily:"'DM Sans',sans-serif" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor:theme.accent }} />
                 {endDate 
    ? `Note for Range: ${currentMonth.name} ${startDate} - ${endDate}` 
    : `Note for ${currentMonth.name} ${startDate}`}
                  </label>
                  <textarea id="date-note"
                    placeholder="What's happening on this day?"
                    value={getDateNote(startDate)}
                    onChange={e => setDateNote(startDate, e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border px-3 py-2 text-sm resize-none transition-all duration-300 focus:outline-none"
                    style={{
                      fontFamily:"'DM Sans',sans-serif",
                      background: isDark ? "rgba(12,10,9,0.6)" : "rgba(255,255,255,0.85)",
                      borderColor: isDark ? `${theme.accent}28` : `${theme.accent}20`,
                      color: isDark ? "#e7e5e4" : "#292524",
                    }}
                    onFocus={e => { e.target.style.borderColor=theme.accent; e.target.style.boxShadow=`0 0 0 3px ${theme.light}` }}
                    onBlur={e => { e.target.style.borderColor=isDark?`${theme.accent}28`:`${theme.accent}20`; e.target.style.boxShadow="none" }}
                  />
                </div>
              )}

              <p className={cn("text-xs flex items-center gap-1.5", isDark?"text-stone-700":"text-stone-400")}
                style={{ fontFamily:"'DM Sans',sans-serif" }}>
                <IconShield />
                Auto-saved to browser · {dateNotes.length} total note{dateNotes.length!==1?"s":""} stored
              </p>
            </div>
          </div>

          {/* Accent footer bar with shimmer animation */}
          <div className="h-2 relative overflow-hidden" style={{ background:theme.accent }}>
            <div className="absolute inset-0"
              style={{ background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)", backgroundSize:"200% 100%", animation:"shimmer 2.5s linear infinite" }} />
          </div>
        </div>
      </div>
    </div>
  )
}
