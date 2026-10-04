import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { computeInvestmentMetrics } from '../utils/investmentCalculator';
import {
  TrendingUp, Building, Plane, HelpCircle, ChevronDown, ChevronUp,
  Percent, DollarSign, Clock, ShieldCheck, ArrowRightLeft, Sparkles
} from 'lucide-react';

interface InvestmentYieldCardProps {
  property: Property;
}

export const InvestmentYieldCard: React.FC<InvestmentYieldCardProps> = ({ property }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeStrategy, setActiveStrategy] = useState<'short_term' | 'long_term' | 'compare'>('short_term');
  const [occupancyRate, setOccupancyRate] = useState<number>(0.68);
  const [customAdr, setCustomAdr] = useState<number | undefined>(undefined);
  const [customMonthlyRent, setCustomMonthlyRent] = useState<number | undefined>(undefined);

  const metrics = useMemo(() => {
    return computeInvestmentMetrics(property, {
      customOccupancyRate: occupancyRate,
      customAdr: customAdr,
      customMonthlyRent: customMonthlyRent,
    });
  }, [property, occupancyRate, customAdr, customMonthlyRent]);

  const formatNum = (num: number) => num.toLocaleString();

  const isSt = activeStrategy === 'short_term';
  const isLt = activeStrategy === 'long_term';
  const isComp = activeStrategy === 'compare';

  return (
    <div
      data-testid="investment-yield-card"
      style={{
        flexShrink: 0,
        backgroundColor: 'var(--bg-surface-card)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header Accordion Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.02)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={14} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-primary)' }}>
                Investment & Yield Engine
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  letterSpacing: '0.4px',
                }}
              >
                {metrics.comparison.investmentScorecard}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Short-Term: <strong style={{ color: 'var(--success)' }}>{metrics.shortTerm.netRoiPercent}% ROI</strong> • Long-Term: <strong style={{ color: 'var(--accent-light)' }}>{metrics.longTerm.netCapRatePercent}% Cap</strong>
            </div>
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)' }}>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Strategy Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '3px',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => setActiveStrategy('short_term')}
              style={{
                backgroundColor: isSt ? 'var(--accent)' : 'transparent',
                color: isSt ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 4px',
                fontSize: '10px',
                fontWeight: isSt ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <Plane size={11} />
              <span>Short-Term</span>
            </button>

            <button
              onClick={() => setActiveStrategy('long_term')}
              style={{
                backgroundColor: isLt ? 'var(--accent)' : 'transparent',
                color: isLt ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 4px',
                fontSize: '10px',
                fontWeight: isLt ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <Building size={11} />
              <span>Long-Term</span>
            </button>

            <button
              onClick={() => setActiveStrategy('compare')}
              style={{
                backgroundColor: isComp ? 'var(--accent)' : 'transparent',
                color: isComp ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 4px',
                fontSize: '10px',
                fontWeight: isComp ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowRightLeft size={11} />
              <span>Compare</span>
            </button>
          </div>

          {/* TAB 1: SHORT-TERM AIRBNB RENTAL */}
          {isSt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Top Key Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Net ROI</div>
                  <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                    {metrics.shortTerm.netRoiPercent}%
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Net NOI / yr</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-light)', marginTop: '4px' }}>
                    {formatNum(metrics.shortTerm.netOperatingIncome)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Payback</div>
                  <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                    {metrics.shortTerm.paybackYears} yrs
                  </div>
                </div>
              </div>

              {/* Occupancy Rate Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tourism Occupancy Rate:</span>
                  <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    {metrics.shortTerm.occupancyPercent}% ({metrics.shortTerm.bookedNightsYear} nights)
                  </strong>
                </div>
                <input
                  type="range"
                  min="0.35"
                  max="0.95"
                  step="0.01"
                  value={occupancyRate}
                  onChange={(e) => setOccupancyRate(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '5px' }}
                />
              </div>

              {/* ADR Slider / Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Average Daily Rate (ADR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                      {formatNum(metrics.shortTerm.adrMad)} MAD
                    </strong>
                    {customAdr && (
                      <button
                        onClick={() => setCustomAdr(undefined)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-light)', fontSize: '9px', cursor: 'pointer' }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="400"
                  max="12000"
                  step="50"
                  value={metrics.shortTerm.adrMad}
                  onChange={(e) => setCustomAdr(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '5px' }}
                />
              </div>

              {/* Waterfall Breakdown */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gross Annual Revenue:</span>
                  <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    +{formatNum(metrics.shortTerm.grossAnnualRevenue)} MAD
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>OTA / Platform Fees (14%):</span>
                  <span className="font-mono">-{formatNum(metrics.shortTerm.platformOtaFees)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Turnover, Linens & Concierge (15%):</span>
                  <span className="font-mono">-{formatNum(metrics.shortTerm.cleaningTurnoverCosts + metrics.shortTerm.localTourismTax + metrics.shortTerm.utilitiesMaintenanceCosts)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', marginTop: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Net Operating Income (NOI):</span>
                  <strong className="font-mono" style={{ color: 'var(--success)' }}>
                    +{formatNum(metrics.shortTerm.netOperatingIncome)} MAD
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LONG-TERM RESIDENTIAL LEASE */}
          {isLt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Key Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <div style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Net Cap Rate</div>
                  <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-light)', marginTop: '2px' }}>
                    {metrics.longTerm.netCapRatePercent}%
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Net Income / yr</div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {formatNum(metrics.longTerm.netAnnualIncome)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Payback</div>
                  <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '3px' }}>
                    {metrics.longTerm.paybackYears} yrs
                  </div>
                </div>
              </div>

              {/* Monthly Rent Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Estimated Monthly Rent:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                      {formatNum(metrics.longTerm.monthlyRentMad)} MAD / mo
                    </strong>
                    {customMonthlyRent && (
                      <button
                        onClick={() => setCustomMonthlyRent(undefined)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--accent-light)', fontSize: '9px', cursor: 'pointer' }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="60000"
                  step="250"
                  value={metrics.longTerm.monthlyRentMad}
                  onChange={(e) => setCustomMonthlyRent(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '5px' }}
                />
              </div>

              {/* Waterfall Breakdown */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gross Annual Rent (12 mo):</span>
                  <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>
                    +{formatNum(metrics.longTerm.grossAnnualRent)} MAD
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Vacancy Reserve (4%):</span>
                  <span className="font-mono">-{formatNum(metrics.longTerm.vacancyReserve)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Syndic, Mgmt & Maintenance (8%):</span>
                  <span className="font-mono">-{formatNum(metrics.longTerm.syndicManagementFees + metrics.longTerm.maintenanceReserve)} MAD</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '4px', marginTop: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Net Rental Income:</span>
                  <strong className="font-mono" style={{ color: 'var(--accent-light)' }}>
                    +{formatNum(metrics.longTerm.netAnnualIncome)} MAD
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STRATEGY COMPARISON */}
          {isComp && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={13} style={{ color: 'var(--accent-light)' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    Strategy Verdict
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {metrics.comparison.recommendationReason}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginTop: '4px' }}>
                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Annual Spread</div>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: metrics.comparison.annualCashFlowSpread >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      {metrics.comparison.annualCashFlowSpread >= 0 ? '+' : ''}{formatNum(metrics.comparison.annualCashFlowSpread)} MAD
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '6px 8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Breakeven Occupancy</div>
                    <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {metrics.comparison.breakevenOccupancyPercent}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
