import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Play, Pause, Compass, Clock, Calendar, Sparkles, ChevronDown, ChevronUp, X } from 'lucide-react';
import { computeSolarPosition, Season, SolarTelemetry } from '../utils/solarCalculator';

interface SunSimulationWidgetProps {
  onLightingChange: (telemetry: SolarTelemetry) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SunSimulationWidget: React.FC<SunSimulationWidgetProps> = ({
  onLightingChange,
  isOpen,
  onClose,
}) => {
  const [hour, setHour] = useState<number>(14.0); // 14:00 default (pleasant afternoon lighting)
  const [season, setSeason] = useState<Season>('summer');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Compute telemetry whenever hour or season changes and notify map
  useEffect(() => {
    const telemetry = computeSolarPosition(hour, season);
    onLightingChange(telemetry);
  }, [hour, season, onLightingChange]);

  // Animation loop for dynamic daylight cycle
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTickRef.current = Date.now();
    const tick = () => {
      const now = Date.now();
      const elapsedSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      // Advance 1 simulated hour every 2.5 seconds
      const deltaHours = elapsedSec * 0.4;
      setHour((prev) => {
        let next = prev + deltaHours;
        if (next > 21.0) next = 6.0; // Loop between 06:00 and 21:00
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  if (!isOpen) return null;

  const currentTelemetry = computeSolarPosition(hour, season);

  const presets = [
    { label: 'Dawn', icon: '🌅', hour: 6.75, note: 'Amber' },
    { label: 'Morning', icon: '🌤️', hour: 9.5, note: 'Warm' },
    { label: 'Noon', icon: '☀️', hour: 12.5, note: 'Zenith' },
    { label: 'Golden Hour', icon: '🌇', hour: 18.25, note: 'Crimson' },
    { label: 'Night', icon: '🌙', hour: 21.5, note: 'Moon' },
  ];

  return (
    <div
      data-testid="sun-simulation-widget"
      className="glass-panel-elevated animate-fade-in"
      style={{
        position: 'absolute',
        bottom: '72px',
        left: '360px',
        width: isMinimized ? '280px' : '340px',
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 35,
        color: 'var(--text-primary)',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: currentTelemetry.isGoldenHour
                ? 'rgba(249, 115, 22, 0.2)'
                : currentTelemetry.isNight
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(253, 224, 71, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentTelemetry.isGoldenHour
                ? '#f97316'
                : currentTelemetry.isNight
                ? '#60a5fa'
                : '#fde047',
            }}
          >
            {currentTelemetry.isNight ? <Moon size={14} /> : <Sun size={14} />}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '-0.2px', color: '#f8fafc' }}>
            Daylight & Shadow Simulator
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Close Daylight Simulator"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isMinimized && (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Time & Phase Readout */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#f8fafc',
                  letterSpacing: '-0.5px',
                }}
              >
                {currentTelemetry.formattedTime}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Marrakech Time</span>
            </div>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: currentTelemetry.isGoldenHour
                  ? 'rgba(249, 115, 22, 0.15)'
                  : currentTelemetry.isNight
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(234, 179, 8, 0.15)',
                color: currentTelemetry.isGoldenHour
                  ? '#fb923c'
                  : currentTelemetry.isNight
                  ? '#93c5fd'
                  : '#fde047',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {currentTelemetry.phaseName}
            </span>
          </div>

          {/* Interactive Daylight Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>06:00 Sunrise</span>
              <span>12:30 Noon</span>
              <span>21:00 Dusk</span>
            </div>

            <input
              type="range"
              min="6.0"
              max="22.0"
              step="0.1"
              value={hour}
              onChange={(e) => {
                setIsPlaying(false);
                setHour(parseFloat(e.target.value));
              }}
              style={{
                width: '100%',
                accentColor: 'var(--accent)',
                cursor: 'pointer',
                height: '6px',
                borderRadius: '3px',
              }}
            />
          </div>

          {/* Animation Play/Pause & Presets */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                backgroundColor: isPlaying ? 'var(--warning)' : 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                flexShrink: 0,
                transition: 'background-color 0.15s ease',
              }}
              title={isPlaying ? 'Pause auto-cycle' : 'Auto cycle daylight'}
            >
              {isPlaying ? <Pause size={12} fill="#ffffff" /> : <Play size={12} fill="#ffffff" />}
              <span>{isPlaying ? 'Pause' : 'Cycle'}</span>
            </button>

            <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'auto' }}>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setIsPlaying(false);
                    setHour(p.hour);
                  }}
                  style={{
                    backgroundColor: Math.abs(hour - p.hour) < 0.6 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: Math.abs(hour - p.hour) < 0.6 ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    fontSize: '10px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Season Solstice Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
              Solar Season & Arc
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {(['summer', 'equinox', 'winter'] as Season[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  style={{
                    backgroundColor: season === s ? 'var(--accent)' : 'rgba(255, 255, 255, 0.04)',
                    color: season === s ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '5px 4px',
                    fontSize: '10px',
                    fontWeight: season === s ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {s === 'summer' ? 'Summer Solstice' : s === 'winter' ? 'Winter Solstice' : 'Equinox'}
                </button>
              ))}
            </div>
          </div>

          {/* Real-Time Solar & 3D Shadow Telemetry */}
          <div
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              fontSize: '11px',
            }}
          >
            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>Sun Direction:</span>
              <div className="font-mono" style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontSize: '11px' }}>
                {currentTelemetry.azimuthCompass}
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>Sun Altitude:</span>
              <div className="font-mono" style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontSize: '11px' }}>
                {currentTelemetry.altitudeDeg > 0 ? `${currentTelemetry.altitudeDeg}° above horizon` : 'Below horizon'}
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>3D Shadow Length:</span>
              <div className="font-mono" style={{ fontWeight: 700, color: '#f8fafc', marginTop: '2px', fontSize: '11px' }}>
                {currentTelemetry.isNight ? 'Ambient Only' : `${currentTelemetry.shadowLengthMultiplier}x height`}
              </div>
            </div>

            <div>
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>Light Hue & Temp:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: currentTelemetry.lightColor,
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.2)',
                  }}
                />
                <span className="font-mono" style={{ fontWeight: 700, color: '#f8fafc', fontSize: '11px' }}>
                  {currentTelemetry.lightColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Minimized Quick Bar */}
      {isMinimized && (
        <div
          style={{
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
          }}
        >
          <span className="font-mono" style={{ fontWeight: 700 }}>
            {currentTelemetry.formattedTime}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>{currentTelemetry.azimuthCompass}</span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-light)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      )}
    </div>
  );
};
