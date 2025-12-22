import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import Tooltip from '../Tooltip/Tooltip';
import './SunburstChart.css';

const SunburstChart = ({ data = [] }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [activeTooltipContent, setActiveTooltipContent] = useState(null);
  const [activeTooltipPosition, setActiveTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (activeTooltipContent && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = 16;

      // Prefiere colocar el tooltip a los lados del cursor y centrado verticalmente
      const fitsRight = activeTooltipPosition.x + gap + tooltipRect.width <= viewportWidth;
      const finalLeft = fitsRight
        ? activeTooltipPosition.x + gap
        : activeTooltipPosition.x - tooltipRect.width - gap;

      // Centrar respecto al cursor pero evitando que se salga por arriba/abajo
      const desiredTop = activeTooltipPosition.y - tooltipRect.height / 2;
      const minTop = 10;
      const maxTop = viewportHeight - tooltipRect.height - 10;
      const finalTop = Math.max(minTop, Math.min(desiredTop, maxTop));

      setTooltipStyle({
        position: 'fixed',
        left: `${finalLeft}px`,
        top: `${finalTop}px`,
        transform: 'none',
        visibility: 'visible',
      });
    } else {
      setTooltipStyle({
        visibility: 'hidden',
      });
    }
  }, [activeTooltipContent, activeTooltipPosition]);
  
  const sistemasConFarmacos = useMemo(() => data.filter(item => item.drugs && item.drugs.length > 0), [data]);
  const cantidadSistemas = sistemasConFarmacos.length;

  const getImpactLevel = (magnitud) => {
    if (magnitud >= 3) return 'alto';
    if (magnitud >= 2) return 'medio';
    return 'bajo';
  };

  const dataWithPercentages = useMemo(() => {
    if (cantidadSistemas === 0) return [];
    return sistemasConFarmacos.map(sistema => {
      const impactCounts = { alto: 0, medio: 0, bajo: 0 };
      (sistema.drugs || []).forEach(drug => {
        const impact = getImpactLevel(drug.magnitud);
        impactCounts[impact]++;
      });
      return {
        ...sistema,
        porcentajeTotal: (1 / cantidadSistemas) * 100,
        impactCounts,
      };
    });
  }, [sistemasConFarmacos, cantidadSistemas]);

  const generateSegmentTooltipContent = (item) => {
    const { name, porcentajeTotal, impactCounts } = item;
    let content = `<strong>${name}</strong>: ${porcentajeTotal.toFixed(0)}% del total`;
    const impactParts = [];
    if (impactCounts.alto > 0) impactParts.push(`${impactCounts.alto} fármaco${impactCounts.alto > 1 ? 's' : ''} de Impacto Alto`);
    if (impactCounts.medio > 0) impactParts.push(`${impactCounts.medio} fármaco${impactParts.medio > 1 ? 's' : ''} de Impacto Medio`);
    if (impactCounts.bajo > 0) impactParts.push(`${impactCounts.bajo} fármaco${impactParts.bajo > 1 ? 's' : ''} de Impacto Bajo`);

    if (impactParts.length > 0) {
        content += ` con ${impactParts.join(', ')}`;
    } else {
        content += ` (sin fármacos asignados)`;
    }
    return content;
  };

  const getImpactColor = (magnitud) => {
    if (magnitud >= 3) return '#EF5350'; // Alto
    if (magnitud >= 2) return '#FFA726'; // Medio
    return '#66BB6A'; // Bajo
  };

  const getSegmentPath = (startAngle, endAngle, innerRadius, outerRadius) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = 200 + innerRadius * Math.cos(startRad);
    const y1 = 200 + innerRadius * Math.sin(startRad);
    const x2 = 200 + outerRadius * Math.cos(startRad);
    const y2 = 200 + outerRadius * Math.sin(startRad);
    const x3 = 200 + outerRadius * Math.cos(endRad);
    const y3 = 200 + outerRadius * Math.sin(endRad);
    const x4 = 200 + innerRadius * Math.cos(endRad);
    const y4 = 200 + innerRadius * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  let currentAngle = 0;

  return (
    <div className="sunburst-card">
        <div className="sunburst-title-container">
          <h2 className="sunburst-title">Resumen de Fármacos/Impacto por Sistema</h2>
          <Tooltip content="Este gráfico muestra los sistemas a los que pertenecen los fármacos que influyen en tu genética y su nivel de impacto. Si un impacto es alto, indica una mayor predisposición genética a una afección relacionada.">
              <HelpCircle size={16} className="text-gray-400 hover:text-gray-600 transition-colors" />
          </Tooltip>
        </div>

        <div className="sunburst-svg-container">
          <svg width="400" height="400" viewBox="0 0 400 400">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="rgba(0,0,0,0.1)"/>
                </filter>
            </defs>

            {/* Anillo interior - Sistemas */}
            {dataWithPercentages.map((item, index) => {
              const startAngle = currentAngle;
              const sweepAngle = (item.porcentajeTotal / 100) * 360;
              const endAngle = currentAngle + sweepAngle;
              currentAngle = endAngle;

              const path = getSegmentPath(startAngle, endAngle, 90, 160);
              const isHovered = hoveredSegment === index;

              return (
                <path
                  key={`sistema-${index}`}
                  d={path}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  className={`sunburst-segment ${hoveredSegment === null || isHovered ? 'full-opacity' : 'dimmed-opacity'}`}
                  onMouseEnter={(e) => {
                    setHoveredSegment(index);
                    setActiveTooltipContent(generateSegmentTooltipContent(item));
                    setActiveTooltipPosition({
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseMove={(e) => {
                    // Seguir el cursor para mantener el tooltip alineado lateralmente
                    setActiveTooltipPosition({
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredSegment(null);
                    setActiveTooltipContent(null);
                  }}
                  style={{ 
                    filter: isHovered ? 'url(#shadow)' : 'none',
                    animationDelay: `${index * 120}ms`,
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    fillOpacity: isHovered ? 1 : 0.6
                  }}
                />
              );
            })}

            {/* Anillo exterior - Fármacos (solo se muestra en hover) */}
            {hoveredSegment !== null && (() => {
              const hoveredData = dataWithPercentages[hoveredSegment];
              let farmacoAngle = dataWithPercentages.slice(0, hoveredSegment).reduce((acc, seg) => acc + (seg.porcentajeTotal / 100) * 360, 0);
              // const sistemaAngleStart = farmacoAngle; // Removed as unused
              const sistemaAngleTotal = (hoveredData.porcentajeTotal / 100) * 360;
              
              const totalFarmacos = hoveredData.drugs.length;
              if (totalFarmacos === 0) return null;

              return hoveredData.drugs.map((farmaco, fIndex) => {
                const farmacoStartAngle = farmacoAngle;
                const farmacoSweep = (1 / totalFarmacos) * sistemaAngleTotal;
                const farmacoEndAngle = farmacoAngle + farmacoSweep;
                farmacoAngle = farmacoEndAngle;

                const farmacoPath = getSegmentPath(farmacoStartAngle, farmacoEndAngle, 160, 190);

                return (
                  <g key={`farmaco-${fIndex}`}>
                    <path
                      d={farmacoPath}
                      fill={getImpactColor(farmaco.magnitud)}
                      stroke="white"
                      strokeWidth="2"
                      className="sunburst-farmaco-segment"
                    />
                  </g>
                );
              });
            })()}
            
            <circle cx="200" cy="200" r="90" fill="white" />
            
            <text x="200" y="200" textAnchor="middle" className="sunburst-text-label">Sistemas de Fármacos</text>
          </svg>
        </div>
        <div className="sunburst-info">
          <p className="sunburst-info-text">
            Pasa el cursor sobre cada sistema para ver tus fármacos expandidos en el anillo exterior. 
            Los colores del anillo exterior indican el nivel de impacto por cada sistema del organismo.
          </p>
        </div>
        
        {/* Leyenda de Sistemas */}
        <div className="sunburst-legend-card" style={{ boxShadow: 'none', padding: '20px 0 0 0' }}>
          <h3 className="sunburst-legend-title">Sistemas Médicos</h3>
          <div className="sunburst-systems-grid">
            {sistemasConFarmacos.map((item, index) => (
              <div key={index} className="sunburst-legend-item">
                <div className="sunburst-legend-color-box" style={{ backgroundColor: item.color }} />
                <span className="sunburst-legend-label">{item.name}</span>
                <span className="sunburst-legend-percentage">
                  {Math.round(100 / cantidadSistemas)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {activeTooltipContent && (
          <div
            ref={tooltipRef}
            className="custom-sunburst-tooltip"
            style={tooltipStyle}
            dangerouslySetInnerHTML={{ __html: activeTooltipContent }}
          />
        )}
      </div>
  );
};

export default SunburstChart;
