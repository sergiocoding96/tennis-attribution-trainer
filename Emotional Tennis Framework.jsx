import React, { useState, useEffect } from 'react';

const TennisEmotionalFrameworks = () => {
  const [activeView, setActiveView] = useState('overview');
  const [hoveredEmotion, setHoveredEmotion] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const emotions = {
    disappointment: {
      name: 'Disappointment',
      icon: '😞',
      color: '#6B7280',
      gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
      arousal: 3,
      valence: 2,
      timeline: 'Past',
      ego: 'Ego-Threatened',
      controllability: 'Internal + Uncontrollable',
      danger: 'Critical',
      description: 'Low energy withdrawal from challenge'
    },
    frustration: {
      name: 'Frustration',
      icon: '😤',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      arousal: 6,
      valence: 3,
      timeline: 'Past/Present',
      ego: 'Task → Ego-Pressured',
      controllability: 'Internal + Controllable',
      danger: 'Moderate',
      description: 'Productive tension seeking solution'
    },
    anger: {
      name: 'Anger',
      icon: '😠',
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      arousal: 8,
      valence: 2,
      timeline: 'Past/Present',
      ego: 'Ego-Defensive',
      controllability: 'Internal + Uncontrollable',
      danger: 'Moderate-High',
      description: 'Explosive reaction to perceived injustice'
    },
    anxiety: {
      name: 'Anxiety',
      icon: '😰',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      arousal: 7,
      valence: 3,
      timeline: 'Future',
      ego: 'Ego-Pressured',
      controllability: 'Internal + Uncontrollable',
      danger: 'High',
      description: 'Anticipatory fear of failure'
    },
    calmness: {
      name: 'Calmness',
      icon: '😌',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      arousal: 4,
      valence: 7,
      timeline: 'Present',
      ego: 'Task-Focused',
      controllability: 'Internal + Controllable',
      danger: 'Low',
      description: 'Centered presence and clarity'
    },
    excitement: {
      name: 'Excitement',
      icon: '😄',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      arousal: 7,
      valence: 8,
      timeline: 'Present/Future',
      ego: 'Task-Focused',
      controllability: 'Internal + Controllable',
      danger: 'Low',
      description: 'Energized engagement with challenge'
    }
  };

  const SectionTitle = ({ icon, title, subtitle }) => (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{icon}</div>
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 4vw, 2rem)', 
        fontWeight: 700, 
        color: '#1F2937',
        marginBottom: '8px',
        letterSpacing: '-0.02em'
      }}>
        {title}
      </h2>
      <p style={{ 
        fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', 
        color: '#6B7280',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: 1.6,
        padding: '0 16px'
      }}>
        {subtitle}
      </p>
    </div>
  );

  // Overview View
  const OverviewView = () => (
    <div>
      <SectionTitle 
        icon="🎾"
        title="Your Emotional Toolkit"
        subtitle="Understanding these six emotions will help you stay in control on court"
      />

      {/* Emotion Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {Object.entries(emotions).map(([key, emotion]) => (
          <div
            key={key}
            onMouseEnter={() => setHoveredEmotion(key)}
            onMouseLeave={() => setHoveredEmotion(null)}
            style={{
              background: hoveredEmotion === key ? emotion.gradient : 'white',
              borderRadius: '20px',
              padding: '24px',
              border: `2px solid ${emotion.color}20`,
              boxShadow: hoveredEmotion === key 
                ? `0 20px 40px ${emotion.color}30`
                : '0 4px 20px rgba(0,0,0,0.06)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: hoveredEmotion === key ? 'translateY(-8px)' : 'none',
              cursor: 'pointer'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                filter: hoveredEmotion === key ? 'brightness(1.1)' : 'none',
                transition: 'all 0.3s'
              }}>
                {emotion.icon}
              </div>
              <div>
                <h3 style={{ 
                  fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
                  fontWeight: 700,
                  color: hoveredEmotion === key ? 'white' : emotion.color,
                  marginBottom: '4px',
                  transition: 'color 0.3s'
                }}>
                  {emotion.name}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: hoveredEmotion === key ? 'rgba(255,255,255,0.85)' : '#6B7280',
                  transition: 'color 0.3s'
                }}>
                  {emotion.description}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              {[
                { label: 'Energy', value: `${emotion.arousal}/10` },
                { label: 'Timeline', value: emotion.timeline },
                { label: 'Risk Level', value: emotion.danger },
                { label: 'Focus', value: emotion.ego.split(' ')[0] }
              ].map((item, i) => (
                <div key={i} style={{
                  background: hoveredEmotion === key ? 'rgba(255,255,255,0.2)' : `${emotion.color}08`,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  transition: 'all 0.3s'
                }}>
                  <div style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: hoveredEmotion === key ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                    marginBottom: '2px'
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: hoveredEmotion === key ? 'white' : '#374151'
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights - Player Focused */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {[
          {
            icon: '🔴',
            title: 'Watch Out For',
            emotion: 'Disappointment',
            desc: 'It makes you want to give up',
            color: '#EF4444',
            bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
          },
          {
            icon: '🎯',
            title: 'Your Target Zone',
            emotion: 'Calm + Excited',
            desc: 'This is where you play your best',
            color: '#10B981',
            bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
          },
          {
            icon: '⚡',
            title: 'Act Fast',
            emotion: 'Frustration Building',
            desc: 'You have 2-3 points to reset',
            color: '#F59E0B',
            bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
          }
        ].map((insight, i) => (
          <div key={i} style={{
            background: insight.bg,
            borderRadius: '16px',
            padding: '20px',
            border: `2px solid ${insight.color}30`
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{insight.icon}</div>
            <h4 style={{ 
              color: insight.color, 
              fontWeight: 700, 
              fontSize: '1rem',
              marginBottom: '4px'
            }}>
              {insight.title}
            </h4>
            <div style={{ 
              fontWeight: 600, 
              color: '#374151',
              marginBottom: '4px',
              fontSize: '0.95rem'
            }}>
              {insight.emotion}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
              {insight.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference - Player Language */}
      <div style={{
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 32px)',
        color: 'white'
      }}>
        <h3 style={{ 
          fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', 
          fontWeight: 700, 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span>🎯</span> Quick Reset Guide
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {[
            { state: '😞 Feeling flat?', action: 'Jump, pump your fist, stand tall', color: '#6B7280' },
            { state: '😤 Getting frustrated?', action: 'Pick ONE thing to focus on', color: '#F59E0B' },
            { state: '😠 😰 Too intense?', action: 'Walk to towel, breathe deep', color: '#EF4444' },
            { state: '😌 😄 Feeling good?', action: 'Stay in the moment, trust it', color: '#10B981' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              borderLeft: `4px solid ${item.color}`
            }}>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.95rem' }}>{item.state}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                {item.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Circumplex View
  const CircumplexView = () => {
    const getPosition = (arousal, valence) => {
      const x = ((valence - 1) / 9) * 100;
      const y = 100 - ((arousal - 1) / 9) * 100;
      return { left: `${x}%`, top: `${y}%` };
    };

    return (
      <div>
        <SectionTitle 
          icon="🎯"
          title="The Emotion Map"
          subtitle="Find where you are, then move toward the Peak Zone"
        />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(0, 1fr)', 
          gap: '32px',
        }}>
          {/* Main Grid */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '100%',
              background: 'linear-gradient(135deg, #FEE2E2 0%, #FEF3C7 25%, #D1FAE5 50%, #DBEAFE 75%, #E0E7FF 100%)',
              borderRadius: '20px',
              border: '3px solid #E5E7EB',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.05)'
            }}>
              {/* Grid Lines */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                  linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
                  linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '10% 10%',
                borderRadius: '20px'
              }} />

              {/* Axes */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '5%',
                bottom: '5%',
                width: '2px',
                background: 'linear-gradient(to bottom, #9CA3AF, #D1D5DB, #9CA3AF)',
                transform: 'translateX(-50%)'
              }} />
              <div style={{
                position: 'absolute',
                left: '5%',
                right: '5%',
                top: '50%',
                height: '2px',
                background: 'linear-gradient(to right, #9CA3AF, #D1D5DB, #9CA3AF)',
                transform: 'translateY(-50%)'
              }} />

              {/* Peak Zone */}
              <div style={{
                position: 'absolute',
                left: '55%',
                top: '30%',
                width: '35%',
                height: '35%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '3px dashed #10B981',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  background: '#10B981',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}>
                  PEAK ZONE
                </span>
              </div>

              {/* Emotions */}
              {Object.entries(emotions).map(([key, emotion]) => (
                <div
                  key={key}
                  onMouseEnter={() => setHoveredEmotion(key)}
                  onMouseLeave={() => setHoveredEmotion(null)}
                  style={{
                    position: 'absolute',
                    ...getPosition(emotion.arousal, emotion.valence),
                    transform: `translate(-50%, -50%) scale(${hoveredEmotion === key ? 1.15 : 1})`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: hoveredEmotion === key ? 10 : 1,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: 'clamp(6px, 2vw, 12px) clamp(8px, 2vw, 16px)',
                    boxShadow: hoveredEmotion === key 
                      ? `0 12px 24px ${emotion.color}40`
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    border: `2px solid ${emotion.color}`,
                    textAlign: 'center',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', marginBottom: '2px' }}>{emotion.icon}</div>
                    <div style={{
                      fontSize: 'clamp(0.55rem, 1.5vw, 0.75rem)',
                      fontWeight: 700,
                      color: emotion.color,
                      whiteSpace: 'nowrap'
                    }}>
                      {emotion.name}
                    </div>
                  </div>
                </div>
              ))}

              {/* Labels */}
              <div style={{
                position: 'absolute',
                top: '2%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                fontWeight: 700,
                color: '#6B7280',
                letterSpacing: '0.1em'
              }}>
                HIGH ENERGY
              </div>
              <div style={{
                position: 'absolute',
                bottom: '2%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                fontWeight: 700,
                color: '#6B7280',
                letterSpacing: '0.1em'
              }}>
                LOW ENERGY
              </div>
              <div style={{
                position: 'absolute',
                left: '2%',
                top: '50%',
                transform: 'translateY(-50%) rotate(-90deg)',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                fontWeight: 700,
                color: '#6B7280',
                letterSpacing: '0.1em'
              }}>
                NEGATIVE
              </div>
              <div style={{
                position: 'absolute',
                right: '2%',
                top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                fontSize: 'clamp(0.5rem, 1.5vw, 0.7rem)',
                fontWeight: 700,
                color: '#6B7280',
                letterSpacing: '0.1em'
              }}>
                POSITIVE
              </div>
            </div>
          </div>

          {/* Legend - Player Tips */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '20px',
              background: '#D1FAE5',
              borderRadius: '16px',
              borderLeft: '4px solid #10B981'
            }}>
              <div style={{ fontWeight: 700, color: '#047857', marginBottom: '8px', fontSize: '1rem' }}>
                ✓ Your Target: Peak Zone
              </div>
              <div style={{ fontSize: '0.9rem', color: '#065F46', lineHeight: 1.6 }}>
                Medium energy (4-7) + feeling good = your best tennis. This is where you want to be!
              </div>
            </div>
            
            <div style={{
              padding: '20px',
              background: '#FEE2E2',
              borderRadius: '16px',
              borderLeft: '4px solid #EF4444'
            }}>
              <div style={{ fontWeight: 700, color: '#B91C1C', marginBottom: '8px', fontSize: '1rem' }}>
                ✗ Danger Zones
              </div>
              <div style={{ fontSize: '0.9rem', color: '#7F1D1D', lineHeight: 1.6 }}>
                Too high + negative (anger/anxiety) or too low + negative (disappointment) = trouble. Time to reset!
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              borderRadius: '16px',
              gridColumn: 'span 1'
            }}>
              <div style={{ fontWeight: 700, color: '#4F46E5', marginBottom: '8px', fontSize: '1rem' }}>
                🧭 How to Move
              </div>
              <div style={{ fontSize: '0.9rem', color: '#3730A3', lineHeight: 1.7 }}>
                • <strong>Too high?</strong> → Diaphragmatic breathing at the towel<br/>
                • <strong>Too low?</strong> → Physical activation (jump, fist pump)<br/>
                • <strong>Too negative?</strong> → Deal with it, let it go, next point
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Timeline View
  const TimelineView = () => (
    <div>
      <SectionTitle 
        icon="⏰"
        title="Where Is Your Mind?"
        subtitle="Champions stay in the present. Are you stuck in the past or worried about the future?"
      />

      {/* Timeline Visual */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        marginBottom: '40px',
        padding: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { label: 'PAST', sub: 'Mistakes', icon: '⏮️', color: '#EF4444', bad: true },
          { label: 'PRESENT', sub: 'This Point', icon: '⏺️', color: '#10B981', bad: false },
          { label: 'FUTURE', sub: 'What If...', icon: '⏭️', color: '#F59E0B', bad: true }
        ].map((item, i) => (
          <React.Fragment key={i}>
            <div style={{
              textAlign: 'center',
              padding: 'clamp(16px, 4vw, 30px) clamp(20px, 5vw, 40px)',
              background: item.bad ? `${item.color}10` : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
              borderRadius: '16px',
              border: `3px solid ${item.color}${item.bad ? '40' : ''}`,
              boxShadow: !item.bad ? `0 8px 30px ${item.color}30` : 'none',
              transform: !item.bad ? 'scale(1.05)' : 'none',
              zIndex: !item.bad ? 2 : 1,
              position: 'relative',
              margin: '8px 0'
            }}>
              <div style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ 
                fontSize: 'clamp(1rem, 3vw, 1.3rem)', 
                fontWeight: 700, 
                color: item.color,
                marginBottom: '4px'
              }}>
                {item.label}
              </div>
              <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', color: '#6B7280' }}>{item.sub}</div>
              {!item.bad && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: item.color,
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  fontSize: '0.65rem',
                  fontWeight: 700
                }}>
                  BE HERE
                </div>
              )}
            </div>
            {i < 2 && (
              <div style={{
                width: 'clamp(20px, 8vw, 60px)',
                height: '4px',
                background: `linear-gradient(90deg, ${['#EF4444', '#10B981', '#F59E0B'][i]} 0%, ${['#10B981', '#F59E0B'][i] || '#F59E0B'} 100%)`,
                margin: '0 -8px',
                zIndex: 0,
                flexShrink: 0
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Emotion Timeline Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px'
      }}>
        {/* Past Column */}
        <div>
          <h4 style={{
            textAlign: 'center',
            color: '#EF4444',
            fontWeight: 700,
            marginBottom: '12px',
            fontSize: '1rem'
          }}>
            ⬅️ Stuck in the Past
          </h4>
          {Object.entries(emotions)
            .filter(([_, e]) => e.timeline.includes('Past') && !e.timeline.includes('Present'))
            .map(([key, emotion]) => (
              <div key={key} style={{
                background: 'white',
                borderRadius: '14px',
                padding: '16px',
                border: `2px solid ${emotion.color}30`,
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{emotion.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: emotion.color }}>{emotion.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>"I can't believe I missed that"</div>
                  </div>
                </div>
              </div>
            ))}
          <div style={{
            background: '#FEF2F2',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '0.85rem',
            color: '#991B1B',
            lineHeight: 1.5
          }}>
            <strong>The trap:</strong> Replaying errors steals energy from the next point
          </div>
        </div>

        {/* Present Column */}
        <div>
          <h4 style={{
            textAlign: 'center',
            color: '#10B981',
            fontWeight: 700,
            marginBottom: '12px',
            fontSize: '1rem'
          }}>
            🎯 In the Present
          </h4>
          {Object.entries(emotions)
            .filter(([_, e]) => e.timeline.includes('Present'))
            .map(([key, emotion]) => (
              <div key={key} style={{
                background: emotion.valence >= 6 
                  ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)'
                  : `${emotion.color}10`,
                borderRadius: '14px',
                padding: '16px',
                border: `2px solid ${emotion.color}`,
                marginBottom: '10px',
                boxShadow: emotion.valence >= 6 ? '0 4px 15px rgba(16, 185, 129, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{emotion.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: emotion.color }}>{emotion.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                      {emotion.valence >= 6 ? '"This point, right now"' : '"What just happened?"'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <div style={{
            background: '#ECFDF5',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '0.85rem',
            color: '#065F46',
            lineHeight: 1.5
          }}>
            <strong>The goal:</strong> All your attention on what you can control RIGHT NOW
          </div>
        </div>

        {/* Future Column */}
        <div>
          <h4 style={{
            textAlign: 'center',
            color: '#F59E0B',
            fontWeight: 700,
            marginBottom: '12px',
            fontSize: '1rem'
          }}>
            Future Worry ➡️
          </h4>
          {Object.entries(emotions)
            .filter(([_, e]) => e.timeline.includes('Future') && !e.timeline.includes('Present'))
            .map(([key, emotion]) => (
              <div key={key} style={{
                background: 'white',
                borderRadius: '14px',
                padding: '16px',
                border: `2px solid ${emotion.color}30`,
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{emotion.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: emotion.color }}>{emotion.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>"What if I lose this?"</div>
                  </div>
                </div>
              </div>
            ))}
          <div style={{
            background: '#FFFBEB',
            borderRadius: '12px',
            padding: '14px',
            fontSize: '0.85rem',
            color: '#92400E',
            lineHeight: 1.5
          }}>
            <strong>The trap:</strong> You can't control the future—only this moment
          </div>
        </div>
      </div>

      {/* Reset Cue */}
      <div style={{
        marginTop: '32px',
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 30px)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '8px' }}>
          YOUR RESET PHRASE
        </div>
        <div style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '8px' }}>
          "NEXT POINT" or "THIS BALL ONLY"
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
          Say it out loud when you catch yourself in the past or future
        </p>
      </div>
    </div>
  );

  // Arousal View - Player Focused
  const ArousalView = () => (
    <div>
      <SectionTitle 
        icon="⚡"
        title="Your Energy Level"
        subtitle="Too low and you'll go flat. Too high and you'll lose control. Find your sweet spot at 4-7."
      />

      {/* Main Scale */}
      <div style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
        <div style={{ position: 'relative', marginBottom: '50px' }}>
          {/* Scale Bar */}
          <div style={{
            height: '50px',
            background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 35%, #10B981 65%, #F59E0B 80%, #EF4444 100%)',
            borderRadius: '25px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            {/* Peak Zone Overlay */}
            <div style={{
              position: 'absolute',
              left: '30%',
              width: '40%',
              top: '-6px',
              bottom: '-6px',
              border: '4px solid #10B981',
              borderRadius: '32px',
              background: 'transparent'
            }} />
            
            {/* Peak Label */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '-35px',
              transform: 'translateX(-50%)',
              background: '#10B981',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
              whiteSpace: 'nowrap'
            }}>
              YOUR SWEET SPOT
            </div>
          </div>

          {/* Scale Numbers */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            padding: '0 4px'
          }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} style={{
                width: 'clamp(24px, 4vw, 32px)',
                height: 'clamp(24px, 4vw, 32px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: n >= 4 && n <= 7 ? '#10B981' : '#E5E7EB',
                color: n >= 4 && n <= 7 ? 'white' : '#6B7280',
                borderRadius: '50%',
                fontWeight: 700,
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)'
              }}>
                {n}
              </div>
            ))}
          </div>

          {/* Zone Labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
            color: '#6B7280'
          }}>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <strong style={{ color: '#3B82F6' }}>Too Low</strong><br/>Flat, giving up
            </div>
            <div style={{ textAlign: 'center', width: '40%' }}>
              <strong style={{ color: '#10B981' }}>Just Right</strong><br/>Alert & focused
            </div>
            <div style={{ textAlign: 'center', width: '30%' }}>
              <strong style={{ color: '#EF4444' }}>Too High</strong><br/>Out of control
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {Object.entries(emotions)
          .sort((a, b) => a[1].arousal - b[1].arousal)
          .map(([key, emotion]) => (
            <div key={key} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(10px, 3vw, 20px)',
              background: 'white',
              padding: 'clamp(10px, 2vw, 16px) clamp(12px, 3vw, 24px)',
              borderRadius: '14px',
              border: `2px solid ${emotion.color}20`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              flexWrap: 'wrap'
            }}>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>{emotion.icon}</div>
              <div style={{ minWidth: '90px' }}>
                <div style={{ fontWeight: 700, color: emotion.color, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>{emotion.name}</div>
                <div style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)', color: '#9CA3AF' }}>Level {emotion.arousal}/10</div>
              </div>
              <div style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                <div style={{
                  height: '20px',
                  background: '#F3F4F6',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* Peak Zone Indicator */}
                  <div style={{
                    position: 'absolute',
                    left: '30%',
                    width: '40%',
                    height: '100%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderLeft: '2px dashed #10B981',
                    borderRight: '2px dashed #10B981'
                  }} />
                  
                  {/* Fill Bar */}
                  <div style={{
                    width: `${emotion.arousal * 10}%`,
                    height: '100%',
                    background: emotion.gradient,
                    borderRadius: '10px',
                    transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '100px',
                background: emotion.arousal >= 4 && emotion.arousal <= 7 
                  ? '#D1FAE5' 
                  : emotion.arousal < 4 ? '#DBEAFE' : '#FEE2E2',
                color: emotion.arousal >= 4 && emotion.arousal <= 7 
                  ? '#059669' 
                  : emotion.arousal < 4 ? '#2563EB' : '#DC2626',
                fontSize: '0.7rem',
                fontWeight: 700,
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {emotion.arousal >= 4 && emotion.arousal <= 7 ? 'GOOD' : emotion.arousal < 4 ? 'LOW' : 'HIGH'}
              </div>
            </div>
          ))}
      </div>

      {/* Player Regulation Tips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
          borderRadius: '16px',
          padding: '20px',
          borderLeft: '5px solid #3B82F6'
        }}>
          <h4 style={{ color: '#1D4ED8', marginBottom: '12px', fontWeight: 700, fontSize: '1rem' }}>
            ⬆️ Energy Too Low? (1-3)
          </h4>
          <ul style={{ color: '#1E40AF', lineHeight: 1.8, paddingLeft: '18px', margin: 0, fontSize: '0.9rem' }}>
            <li>Jump up and down, pump your fist</li>
            <li>Stand tall with power pose</li>
            <li>Say something strong to yourself</li>
            <li>Quick feet, stay moving</li>
            <li>Deep breath OUT with energy</li>
          </ul>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
          borderRadius: '16px',
          padding: '20px',
          borderLeft: '5px solid #EF4444'
        }}>
          <h4 style={{ color: '#DC2626', marginBottom: '12px', fontWeight: 700, fontSize: '1rem' }}>
            ⬇️ Energy Too High? (8-10)
          </h4>
          <ul style={{ color: '#991B1B', lineHeight: 1.8, paddingLeft: '18px', margin: 0, fontSize: '0.9rem' }}>
            <li><strong>Walk to your towel</strong> (take your time)</li>
            <li><strong>Diaphragmatic breathing</strong> (belly expands)</li>
            <li><strong>Tighten muscles, then relax</strong></li>
            <li>Soft eyes, drop your shoulders</li>
            <li>Deal with the emotion, then let it go</li>
          </ul>
        </div>
      </div>

      {/* The Towel Ritual */}
      <div style={{
        marginTop: '24px',
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        borderRadius: '16px',
        padding: 'clamp(16px, 4vw, 24px)',
        color: 'white'
      }}>
        <h4 style={{ marginBottom: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧺</span> The Towel Reset (When You're Too High)
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px',
          fontSize: '0.9rem'
        }}>
          {[
            { step: '1', text: 'Walk slowly to towel' },
            { step: '2', text: 'Wipe face deliberately' },
            { step: '3', text: 'Deep belly breaths' },
            { step: '4', text: 'Let the emotion go' },
            { step: '5', text: 'Back to present' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center'
            }}>
              <div style={{ 
                background: '#10B981', 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {item.step}
              </div>
              <div style={{ fontSize: '0.8rem' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Controllability View - Player Focused
  const ControllabilityView = () => (
    <div>
      <SectionTitle 
        icon="🎮"
        title="What Can You Control?"
        subtitle="Frustration is useful when you believe you CAN fix it. It becomes destructive when you feel helpless."
      />

      {/* The Critical Pathway */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 36px)',
        color: 'white',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: 'clamp(1rem, 3vw, 1.3rem)', fontWeight: 600 }}>
          🚨 The Danger Zone: When Frustration Turns to Anger
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(10px, 3vw, 20px)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: 'clamp(14px, 3vw, 20px) clamp(18px, 4vw, 30px)',
            borderRadius: '14px'
          }}>
            <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '6px' }}>😤</div>
            <div style={{ fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>FRUSTRATION</div>
            <div style={{
              background: '#10B981',
              padding: '4px 10px',
              borderRadius: '100px',
              fontSize: '0.7rem',
              marginTop: '6px'
            }}>
              "I can fix this"
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>⚡</div>
            <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', opacity: 0.8 }}>2-3 bad<br/>points</div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: 'clamp(14px, 3vw, 20px) clamp(18px, 4vw, 30px)',
            borderRadius: '14px'
          }}>
            <div style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '6px' }}>😠</div>
            <div style={{ fontWeight: 700, fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>ANGER</div>
            <div style={{
              background: '#EF4444',
              padding: '4px 10px',
              borderRadius: '100px',
              fontSize: '0.7rem',
              marginTop: '6px'
            }}>
              "I can't do this"
            </div>
          </div>
        </div>
        
        <p style={{ 
          marginTop: '20px', 
          opacity: 0.9,
          maxWidth: '500px',
          margin: '20px auto 0',
          lineHeight: 1.6,
          fontSize: 'clamp(0.85rem, 2vw, 1rem)'
        }}>
          You have <strong>2-3 points</strong> to reset before frustration becomes destructive. Act fast!
        </p>
      </div>

      {/* Two States - Player Language */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '3px solid #10B981'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px'
          }}>
            <span style={{
              background: '#10B981',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              ✓ USEFUL
            </span>
          </div>
          
          <h4 style={{ color: '#047857', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 700 }}>
            "I Can Fix This"
          </h4>
          
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>😤</div>
            <div style={{ fontWeight: 700, color: '#F59E0B' }}>Frustration</div>
            <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '4px' }}>
              "I know what to do, I'm just not doing it"
            </div>
          </div>
          
          <div style={{ color: '#047857', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <strong>Stay here!</strong> This feeling drives improvement. Pick ONE thing to adjust and commit to it.
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
          borderRadius: '16px',
          padding: '24px',
          border: '3px solid #EF4444'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px'
          }}>
            <span style={{
              background: '#EF4444',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              ✗ DESTRUCTIVE
            </span>
          </div>
          
          <h4 style={{ color: '#B91C1C', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 700 }}>
            "I Can't Do This"
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            {[emotions.anger, emotions.anxiety, emotions.disappointment].map((e, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flex: '1 1 auto'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{e.icon}</span>
                <span style={{ fontWeight: 600, color: e.color, fontSize: '0.8rem' }}>{e.name}</span>
              </div>
            ))}
          </div>
          
          <div style={{ color: '#B91C1C', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <strong>Danger!</strong> When you feel helpless, you stop trying. Time for a full reset at the towel.
          </div>
        </div>
      </div>

      {/* Player Action Steps */}
      <div style={{
        background: '#FFFBEB',
        borderRadius: '16px',
        padding: 'clamp(16px, 4vw, 24px)',
        border: '3px solid #F59E0B'
      }}>
        <h4 style={{ color: '#D97706', marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>
          ⚡ Your 2-3 Point Action Plan
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px',
          color: '#92400E',
          fontSize: '0.9rem'
        }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px' }}>
            <strong>1. Notice it early</strong><br/>
            "I'm getting frustrated"
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px' }}>
            <strong>2. Pick ONE thing</strong><br/>
            "I'll focus on my toss"
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px' }}>
            <strong>3. Commit fully</strong><br/>
            "Just this one adjustment"
          </div>
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px' }}>
            <strong>4. Let results go</strong><br/>
            "Process over outcome"
          </div>
        </div>
      </div>
    </div>
  );

  // Ego View - Player Focused
  const EgoView = () => (
    <div>
      <SectionTitle 
        icon="🧠"
        title="Judging vs Doing"
        subtitle="When you're evaluating yourself, you're not playing tennis. When you're playing tennis, there's no room for judgment."
      />

      {/* Two Modes Comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 28px)',
          color: 'white'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: '14px'
          }}>
            ✓ WHERE YOU WANT TO BE
          </div>
          
          <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 700, marginBottom: '6px' }}>
            DOING Mode
          </h3>
          <p style={{ opacity: 0.85, marginBottom: '16px', fontSize: '0.9rem' }}>
            Your mind is on the ball, not on yourself
          </p>
          
          <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '14px', textAlign: 'center' }}>
            😌 😄
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Your mind is asking:</div>
            <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.9, fontSize: '0.9rem' }}>
              <li>"Where's my target?"</li>
              <li>"Split step, ready"</li>
              <li>"Watch the ball"</li>
              <li>"Next ball, next point"</li>
            </ul>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          borderRadius: '20px',
          padding: 'clamp(20px, 4vw, 28px)',
          color: 'white'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-block',
            marginBottom: '14px'
          }}>
            ✗ THE TRAP
          </div>
          
          <h3 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 700, marginBottom: '6px' }}>
            JUDGING Mode
          </h3>
          <p style={{ opacity: 0.85, marginBottom: '16px', fontSize: '0.9rem' }}>
            Your mind is on yourself, not on the ball
          </p>
          
          <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '14px', textAlign: 'center' }}>
            😰 😠 😞
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '10px', fontSize: '0.9rem' }}>Your mind is asking:</div>
            <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.9, fontSize: '0.9rem' }}>
              <li>"Am I playing well?"</li>
              <li>"What's the score?"</li>
              <li>"What do they think of me?"</li>
              <li>"Why can't I do this?"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Self-Check */}
      <div style={{
        background: '#F9FAFB',
        borderRadius: '16px',
        padding: 'clamp(16px, 4vw, 24px)',
        marginBottom: '24px'
      }}>
        <h4 style={{ color: '#374151', marginBottom: '16px', fontWeight: 700, fontSize: '1.1rem' }}>
          🔍 Quick Self-Check Between Points
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: '#FEE2E2',
            borderRadius: '12px',
            padding: '14px',
            borderLeft: '4px solid #EF4444'
          }}>
            <div style={{ fontWeight: 700, color: '#B91C1C', marginBottom: '6px', fontSize: '0.9rem' }}>
              🚫 If you're thinking about...
            </div>
            <div style={{ color: '#7F1D1D', fontSize: '0.85rem', lineHeight: 1.5 }}>
              The score, yourself, your opponent, what others think
            </div>
          </div>
          <div style={{
            background: '#D1FAE5',
            borderRadius: '12px',
            padding: '14px',
            borderLeft: '4px solid #10B981'
          }}>
            <div style={{ fontWeight: 700, color: '#047857', marginBottom: '6px', fontSize: '0.9rem' }}>
              ✓ You should be thinking about...
            </div>
            <div style={{ color: '#065F46', fontSize: '0.85rem', lineHeight: 1.5 }}>
              The ball, your target, your feet, your breath
            </div>
          </div>
        </div>
      </div>

      {/* The Reset */}
      <div style={{
        background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
        borderRadius: '20px',
        padding: 'clamp(20px, 4vw, 32px)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', marginBottom: '10px' }}>
          THE SIMPLE QUESTION
        </div>
        <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '14px' }}>
          "Am I JUDGING or DOING?"
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '500px', margin: '0 auto 20px', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
          Ask yourself this between points. If you're judging, say "NEXT BALL" and get back to doing.
        </p>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'clamp(12px, 3vw, 24px)',
          background: 'rgba(255,255,255,0.1)',
          padding: '14px clamp(16px, 4vw, 32px)',
          borderRadius: '14px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div>
            <div style={{ color: '#EF4444', fontWeight: 700 }}>JUDGING</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Score, self, others</div>
          </div>
          <div style={{ color: 'white', fontSize: '1.5rem' }}>→</div>
          <div>
            <div style={{ color: '#10B981', fontWeight: 700 }}>DOING</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Ball, target, feet</div>
          </div>
        </div>
      </div>
      
      {/* The Full Reset Process */}
      <div style={{
        marginTop: '24px',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        borderRadius: '16px',
        padding: 'clamp(16px, 4vw, 24px)',
        border: '2px solid #818CF8'
      }}>
        <h4 style={{ color: '#4F46E5', marginBottom: '16px', fontWeight: 700, fontSize: '1.1rem' }}>
          🔄 The Complete Reset Process
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          fontSize: '0.9rem'
        }}>
          {[
            { num: '1', title: 'Notice', desc: 'Catch yourself judging' },
            { num: '2', title: 'Accept', desc: 'Feel the emotion fully' },
            { num: '3', title: 'Release', desc: 'Let it go at the towel' },
            { num: '4', title: 'Refocus', desc: 'Back to THIS point' }
          ].map((step, i) => (
            <div key={i} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{
                background: '#4F46E5',
                color: 'white',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {step.num}
              </div>
              <div style={{ fontWeight: 700, color: '#4F46E5', marginBottom: '4px' }}>{step.title}</div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const views = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'circumplex', label: 'Map', icon: '🎯' },
    { id: 'timeline', label: 'Time', icon: '⏰' },
    { id: 'arousal', label: 'Energy', icon: '⚡' },
    { id: 'controllability', label: 'Control', icon: '🎮' },
    { id: 'ego', label: 'Focus', icon: '🧠' }
  ];

  const viewComponents = {
    overview: OverviewView,
    circumplex: CircumplexView,
    timeline: TimelineView,
    arousal: ArousalView,
    controllability: ControllabilityView,
    ego: EgoView
  };

  const ActiveComponent = viewComponents[activeView];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      minHeight: '100vh',
      padding: 'clamp(12px, 3vw, 24px)'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 16px',
            borderRadius: '100px',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '1.3rem' }}>🎾</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' }}>
              Tennis Mental Game
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            fontWeight: 800,
            color: 'white',
            marginBottom: '6px',
            letterSpacing: '-0.03em'
          }}>
            Master Your Emotions
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.15rem)'
          }}>
            Control your mind, control the match
          </p>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          padding: '0 8px'
        }}>
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 20px)',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: activeView === view.id 
                  ? 'white'
                  : 'rgba(255,255,255,0.08)',
                color: activeView === view.id 
                  ? '#1F2937'
                  : 'rgba(255,255,255,0.7)',
                transform: activeView === view.id ? 'scale(1.05)' : 'scale(1)',
                boxShadow: activeView === view.id 
                  ? '0 10px 30px rgba(0,0,0,0.3)'
                  : 'none'
              }}
            >
              <span>{view.icon}</span>
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 'clamp(16px, 4vw, 28px)',
          padding: 'clamp(20px, 5vw, 48px)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
          minHeight: '500px'
        }}>
          <ActiveComponent />
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)'
        }}>
          Based on sports psychology research: Attribution Theory • Circumplex Model • IZOF • Achievement Goal Theory
        </div>
      </div>
    </div>
  );
};

export default TennisEmotionalFrameworks;
