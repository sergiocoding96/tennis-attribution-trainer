/**
 * Tennis Emotional Framework - Interactive Views
 * Vanilla JavaScript implementation of the emotional toolkit for tennis players
 */

// Emotion data
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

// Navigation views
const views = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'circumplex', label: 'Map', icon: '🎯' },
    { id: 'timeline', label: 'Time', icon: '⏰' },
    { id: 'arousal', label: 'Energy', icon: '⚡' },
    { id: 'controllability', label: 'Control', icon: '🎮' },
    { id: 'ego', label: 'Focus', icon: '🧠' }
];

let activeView = 'overview';
let hoveredEmotion = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderAllViews();
    showView('overview');

    // Trigger load animation
    setTimeout(() => {
        document.getElementById('mainContainer').classList.add('loaded');
    }, 100);
});

function initNavigation() {
    const navContainer = document.getElementById('navContainer');
    navContainer.innerHTML = views.map(view => `
        <button class="nav-btn ${view.id === activeView ? 'active' : ''}"
                data-view="${view.id}"
                onclick="showView('${view.id}')">
            <span>${view.icon}</span>
            <span>${view.label}</span>
        </button>
    `).join('');
}

function showView(viewId) {
    activeView = viewId;

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });

    // Show/hide views
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${viewId}View`).classList.add('active');
}

function renderAllViews() {
    renderOverviewView();
    renderCircumplexView();
    renderTimelineView();
    renderArousalView();
    renderControllabilityView();
    renderEgoView();
}

// Overview View
function renderOverviewView() {
    const container = document.getElementById('overviewView');

    container.innerHTML = `
        <div class="section-title">
            <div class="icon">🎾</div>
            <h2>Your Emotional Toolkit</h2>
            <p>Understanding these six emotions will help you stay in control on court</p>
        </div>

        <div class="emotion-grid" id="emotionGrid">
            ${Object.entries(emotions).map(([key, emotion]) => `
                <div class="emotion-card"
                     data-emotion="${key}"
                     onmouseenter="handleEmotionHover('${key}')"
                     onmouseleave="handleEmotionLeave('${key}')"
                     style="--emotion-color: ${emotion.color};">
                    <div class="emotion-card-header">
                        <div class="emotion-icon">${emotion.icon}</div>
                        <div>
                            <div class="emotion-name" style="color: ${emotion.color};">${emotion.name}</div>
                            <div class="emotion-desc">${emotion.description}</div>
                        </div>
                    </div>
                    <div class="emotion-stats">
                        <div class="emotion-stat" style="background: ${emotion.color}08;">
                            <div class="emotion-stat-label">Energy</div>
                            <div class="emotion-stat-value">${emotion.arousal}/10</div>
                        </div>
                        <div class="emotion-stat" style="background: ${emotion.color}08;">
                            <div class="emotion-stat-label">Timeline</div>
                            <div class="emotion-stat-value">${emotion.timeline}</div>
                        </div>
                        <div class="emotion-stat" style="background: ${emotion.color}08;">
                            <div class="emotion-stat-label">Risk Level</div>
                            <div class="emotion-stat-value">${emotion.danger}</div>
                        </div>
                        <div class="emotion-stat" style="background: ${emotion.color}08;">
                            <div class="emotion-stat-label">Focus</div>
                            <div class="emotion-stat-value">${emotion.ego.split(' ')[0]}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="insights-grid">
            <div class="insight-card" style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border: 2px solid #EF444430;">
                <div class="insight-icon">🔴</div>
                <div class="insight-title" style="color: #EF4444;">Watch Out For</div>
                <div class="insight-emotion">Disappointment</div>
                <div class="insight-desc">It makes you want to give up</div>
            </div>
            <div class="insight-card" style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border: 2px solid #10B98130;">
                <div class="insight-icon">🎯</div>
                <div class="insight-title" style="color: #10B981;">Your Target Zone</div>
                <div class="insight-emotion">Calm + Excited</div>
                <div class="insight-desc">This is where you play your best</div>
            </div>
            <div class="insight-card" style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #F59E0B30;">
                <div class="insight-icon">⚡</div>
                <div class="insight-title" style="color: #F59E0B;">Act Fast</div>
                <div class="insight-emotion">Frustration Building</div>
                <div class="insight-desc">You have 2-3 points to reset</div>
            </div>
        </div>

        <div class="reset-guide">
            <h3><span>🎯</span> Quick Reset Guide</h3>
            <div class="reset-actions">
                <div class="reset-action" style="border-left-color: #6B7280;">
                    <div class="reset-state">😞 Feeling flat?</div>
                    <div class="reset-instruction">Jump, pump your fist, stand tall</div>
                </div>
                <div class="reset-action" style="border-left-color: #F59E0B;">
                    <div class="reset-state">😤 Getting frustrated?</div>
                    <div class="reset-instruction">Pick ONE thing to focus on</div>
                </div>
                <div class="reset-action" style="border-left-color: #EF4444;">
                    <div class="reset-state">😠 😰 Too intense?</div>
                    <div class="reset-instruction">Walk to towel, breathe deep</div>
                </div>
                <div class="reset-action" style="border-left-color: #10B981;">
                    <div class="reset-state">😌 😄 Feeling good?</div>
                    <div class="reset-instruction">Stay in the moment, trust it</div>
                </div>
            </div>
        </div>
    `;
}

function handleEmotionHover(key) {
    hoveredEmotion = key;
    const card = document.querySelector(`.emotion-card[data-emotion="${key}"]`);
    const emotion = emotions[key];
    if (card) {
        card.style.background = emotion.gradient;
        card.querySelector('.emotion-name').style.color = 'white';
        card.querySelector('.emotion-desc').style.color = 'rgba(255,255,255,0.85)';
        card.querySelectorAll('.emotion-stat').forEach(stat => {
            stat.style.background = 'rgba(255,255,255,0.2)';
        });
        card.querySelectorAll('.emotion-stat-label').forEach(label => {
            label.style.color = 'rgba(255,255,255,0.7)';
        });
        card.querySelectorAll('.emotion-stat-value').forEach(value => {
            value.style.color = 'white';
        });
        card.style.boxShadow = `0 20px 40px ${emotion.color}30`;
    }
}

function handleEmotionLeave(key) {
    hoveredEmotion = null;
    const card = document.querySelector(`.emotion-card[data-emotion="${key}"]`);
    const emotion = emotions[key];
    if (card) {
        card.style.background = 'white';
        card.querySelector('.emotion-name').style.color = emotion.color;
        card.querySelector('.emotion-desc').style.color = '#6B7280';
        card.querySelectorAll('.emotion-stat').forEach(stat => {
            stat.style.background = `${emotion.color}08`;
        });
        card.querySelectorAll('.emotion-stat-label').forEach(label => {
            label.style.color = '#9CA3AF';
        });
        card.querySelectorAll('.emotion-stat-value').forEach(value => {
            value.style.color = '#374151';
        });
        card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
    }
}

// Circumplex View
function renderCircumplexView() {
    const container = document.getElementById('circumplexView');

    const getPosition = (arousal, valence) => {
        const x = ((valence - 1) / 9) * 100;
        const y = 100 - ((arousal - 1) / 9) * 100;
        return { left: `${x}%`, top: `${y}%` };
    };

    container.innerHTML = `
        <div class="section-title">
            <div class="icon">🎯</div>
            <h2>The Emotion Map</h2>
            <p>Find where you are, then move toward the Peak Zone</p>
        </div>

        <div class="circumplex-container">
            <div class="circumplex-grid">
                <div class="peak-zone">
                    <span class="peak-zone-label">PEAK ZONE</span>
                </div>

                ${Object.entries(emotions).map(([key, emotion]) => {
                    const pos = getPosition(emotion.arousal, emotion.valence);
                    return `
                        <div class="emotion-point" style="left: ${pos.left}; top: ${pos.top};">
                            <div class="emotion-point-inner" style="border-color: ${emotion.color};">
                                <div class="emotion-point-icon">${emotion.icon}</div>
                                <div class="emotion-point-name" style="color: ${emotion.color};">${emotion.name}</div>
                            </div>
                        </div>
                    `;
                }).join('')}

                <div class="axis-label top">HIGH ENERGY</div>
                <div class="axis-label bottom">LOW ENERGY</div>
                <div class="axis-label left">NEGATIVE</div>
                <div class="axis-label right">POSITIVE</div>
            </div>
        </div>

        <div class="legend-grid">
            <div class="legend-item" style="background: #D1FAE5; border-left-color: #10B981;">
                <div class="legend-title" style="color: #047857;">✓ Your Target: Peak Zone</div>
                <div class="legend-desc" style="color: #065F46;">Medium energy (4-7) + feeling good = your best tennis. This is where you want to be!</div>
            </div>
            <div class="legend-item" style="background: #FEE2E2; border-left-color: #EF4444;">
                <div class="legend-title" style="color: #B91C1C;">✗ Danger Zones</div>
                <div class="legend-desc" style="color: #7F1D1D;">Too high + negative (anger/anxiety) or too low + negative (disappointment) = trouble. Time to reset!</div>
            </div>
            <div class="legend-item" style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border-left-color: transparent;">
                <div class="legend-title" style="color: #4F46E5;">🧭 How to Move</div>
                <div class="legend-desc" style="color: #3730A3;">
                    <strong>Too high?</strong> → Diaphragmatic breathing at the towel<br>
                    <strong>Too low?</strong> → Physical activation (jump, fist pump)<br>
                    <strong>Too negative?</strong> → Deal with it, let it go, next point
                </div>
            </div>
        </div>
    `;
}

// Timeline View
function renderTimelineView() {
    const container = document.getElementById('timelineView');

    const pastEmotions = Object.entries(emotions).filter(([_, e]) => e.timeline.includes('Past') && !e.timeline.includes('Present'));
    const presentEmotions = Object.entries(emotions).filter(([_, e]) => e.timeline.includes('Present'));
    const futureEmotions = Object.entries(emotions).filter(([_, e]) => e.timeline.includes('Future') && !e.timeline.includes('Present'));

    container.innerHTML = `
        <div class="section-title">
            <div class="icon">⏰</div>
            <h2>Where Is Your Mind?</h2>
            <p>Champions stay in the present. Are you stuck in the past or worried about the future?</p>
        </div>

        <div class="timeline-visual">
            <div class="timeline-item" style="background: #EF444410; border-color: #EF444440;">
                <div class="timeline-icon">⏮️</div>
                <div class="timeline-label" style="color: #EF4444;">PAST</div>
                <div class="timeline-sub">Mistakes</div>
            </div>
            <div class="timeline-connector" style="background: linear-gradient(90deg, #EF4444 0%, #10B981 100%);"></div>
            <div class="timeline-item present" style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-color: #10B981;">
                <div class="be-here-badge">BE HERE</div>
                <div class="timeline-icon">⏺️</div>
                <div class="timeline-label" style="color: #10B981;">PRESENT</div>
                <div class="timeline-sub">This Point</div>
            </div>
            <div class="timeline-connector" style="background: linear-gradient(90deg, #10B981 0%, #F59E0B 100%);"></div>
            <div class="timeline-item" style="background: #F59E0B10; border-color: #F59E0B40;">
                <div class="timeline-icon">⏭️</div>
                <div class="timeline-label" style="color: #F59E0B;">FUTURE</div>
                <div class="timeline-sub">What If...</div>
            </div>
        </div>

        <div class="timeline-columns">
            <div>
                <h4 style="color: #EF4444;">⬅️ Stuck in the Past</h4>
                ${pastEmotions.map(([key, emotion]) => `
                    <div class="timeline-emotion-card" style="border-color: ${emotion.color}30;">
                        <div class="timeline-emotion-header">
                            <span class="timeline-emotion-icon">${emotion.icon}</span>
                            <div>
                                <div class="timeline-emotion-name" style="color: ${emotion.color};">${emotion.name}</div>
                                <div class="timeline-emotion-quote">"I can't believe I missed that"</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="timeline-trap" style="background: #FEF2F2; color: #991B1B;">
                    <strong>The trap:</strong> Replaying errors steals energy from the next point
                </div>
            </div>

            <div>
                <h4 style="color: #10B981;">🎯 In the Present</h4>
                ${presentEmotions.map(([key, emotion]) => `
                    <div class="timeline-emotion-card" style="background: ${emotion.valence >= 6 ? 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' : `${emotion.color}10`}; border-color: ${emotion.color}; ${emotion.valence >= 6 ? 'box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);' : ''}">
                        <div class="timeline-emotion-header">
                            <span class="timeline-emotion-icon">${emotion.icon}</span>
                            <div>
                                <div class="timeline-emotion-name" style="color: ${emotion.color};">${emotion.name}</div>
                                <div class="timeline-emotion-quote" style="color: #6B7280;">${emotion.valence >= 6 ? '"This point, right now"' : '"What just happened?"'}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="timeline-trap" style="background: #ECFDF5; color: #065F46;">
                    <strong>The goal:</strong> All your attention on what you can control RIGHT NOW
                </div>
            </div>

            <div>
                <h4 style="color: #F59E0B;">Future Worry ➡️</h4>
                ${futureEmotions.map(([key, emotion]) => `
                    <div class="timeline-emotion-card" style="border-color: ${emotion.color}30;">
                        <div class="timeline-emotion-header">
                            <span class="timeline-emotion-icon">${emotion.icon}</span>
                            <div>
                                <div class="timeline-emotion-name" style="color: ${emotion.color};">${emotion.name}</div>
                                <div class="timeline-emotion-quote">"What if I lose this?"</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
                <div class="timeline-trap" style="background: #FFFBEB; color: #92400E;">
                    <strong>The trap:</strong> You can't control the future—only this moment
                </div>
            </div>
        </div>

        <div class="reset-phrase-box">
            <div class="reset-phrase-label">YOUR RESET PHRASE</div>
            <div class="reset-phrase-text">"NEXT POINT" or "THIS BALL ONLY"</div>
            <p class="reset-phrase-desc">Say it out loud when you catch yourself in the past or future</p>
        </div>
    `;
}

// Arousal View
function renderArousalView() {
    const container = document.getElementById('arousalView');

    const sortedEmotions = Object.entries(emotions).sort((a, b) => a[1].arousal - b[1].arousal);

    container.innerHTML = `
        <div class="section-title">
            <div class="icon">⚡</div>
            <h2>Your Energy Level</h2>
            <p>Too low and you'll go flat. Too high and you'll lose control. Find your sweet spot at 4-7.</p>
        </div>

        <div class="arousal-scale-container">
            <div class="arousal-scale">
                <div class="arousal-bar">
                    <div class="arousal-peak-overlay"></div>
                    <div class="arousal-peak-label">YOUR SWEET SPOT</div>
                </div>
                <div class="arousal-numbers">
                    ${[1,2,3,4,5,6,7,8,9,10].map(n => `
                        <div class="arousal-number ${n >= 4 && n <= 7 ? 'optimal' : 'neutral'}">${n}</div>
                    `).join('')}
                </div>
                <div class="arousal-zones">
                    <div class="arousal-zone" style="width: 30%;">
                        <strong style="color: #3B82F6;">Too Low</strong><br>Flat, giving up
                    </div>
                    <div class="arousal-zone" style="width: 40%;">
                        <strong style="color: #10B981;">Just Right</strong><br>Alert & focused
                    </div>
                    <div class="arousal-zone" style="width: 30%;">
                        <strong style="color: #EF4444;">Too High</strong><br>Out of control
                    </div>
                </div>
            </div>
        </div>

        <div class="emotion-bars">
            ${sortedEmotions.map(([key, emotion]) => {
                const isOptimal = emotion.arousal >= 4 && emotion.arousal <= 7;
                const isLow = emotion.arousal < 4;
                return `
                    <div class="emotion-bar-item" style="border-color: ${emotion.color}20;">
                        <div class="emotion-bar-icon">${emotion.icon}</div>
                        <div class="emotion-bar-info">
                            <div class="emotion-bar-name" style="color: ${emotion.color};">${emotion.name}</div>
                            <div class="emotion-bar-level">Level ${emotion.arousal}/10</div>
                        </div>
                        <div class="emotion-bar-track">
                            <div class="emotion-bar-bg">
                                <div class="emotion-bar-peak-indicator"></div>
                                <div class="emotion-bar-fill" style="width: ${emotion.arousal * 10}%; background: ${emotion.gradient};"></div>
                            </div>
                        </div>
                        <div class="emotion-bar-badge" style="background: ${isOptimal ? '#D1FAE5' : isLow ? '#DBEAFE' : '#FEE2E2'}; color: ${isOptimal ? '#059669' : isLow ? '#2563EB' : '#DC2626'};">
                            ${isOptimal ? 'GOOD' : isLow ? 'LOW' : 'HIGH'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <div class="regulation-tips">
            <div class="regulation-tip" style="background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); border-left-color: #3B82F6;">
                <h4 style="color: #1D4ED8;">⬆️ Energy Too Low? (1-3)</h4>
                <ul style="color: #1E40AF;">
                    <li>Jump up and down, pump your fist</li>
                    <li>Stand tall with power pose</li>
                    <li>Say something strong to yourself</li>
                    <li>Quick feet, stay moving</li>
                    <li>Deep breath OUT with energy</li>
                </ul>
            </div>
            <div class="regulation-tip" style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-left-color: #EF4444;">
                <h4 style="color: #DC2626;">⬇️ Energy Too High? (8-10)</h4>
                <ul style="color: #991B1B;">
                    <li><strong>Walk to your towel</strong> (take your time)</li>
                    <li><strong>Diaphragmatic breathing</strong> (belly expands)</li>
                    <li><strong>Tighten muscles, then relax</strong></li>
                    <li>Soft eyes, drop your shoulders</li>
                    <li>Deal with the emotion, then let it go</li>
                </ul>
            </div>
        </div>

        <div class="towel-reset">
            <h4><span>🧺</span> The Towel Reset (When You're Too High)</h4>
            <div class="towel-steps">
                ${[
                    { step: '1', text: 'Walk slowly to towel' },
                    { step: '2', text: 'Wipe face deliberately' },
                    { step: '3', text: 'Deep belly breaths' },
                    { step: '4', text: 'Let the emotion go' },
                    { step: '5', text: 'Back to present' }
                ].map(item => `
                    <div class="towel-step">
                        <div class="towel-step-num">${item.step}</div>
                        <div class="towel-step-text">${item.text}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Controllability View
function renderControllabilityView() {
    const container = document.getElementById('controllabilityView');

    container.innerHTML = `
        <div class="section-title">
            <div class="icon">🎮</div>
            <h2>What Can You Control?</h2>
            <p>Frustration is useful when you believe you CAN fix it. It becomes destructive when you feel helpless.</p>
        </div>

        <div class="danger-pathway">
            <h3>🚨 The Danger Zone: When Frustration Turns to Anger</h3>
            <div class="pathway-visual">
                <div class="pathway-state">
                    <div class="pathway-state-icon">😤</div>
                    <div class="pathway-state-name">FRUSTRATION</div>
                    <div class="pathway-state-badge" style="background: #10B981;">"I can fix this"</div>
                </div>
                <div class="pathway-connector">
                    <div class="pathway-connector-icon">⚡</div>
                    <div class="pathway-connector-text">2-3 bad<br>points</div>
                </div>
                <div class="pathway-state">
                    <div class="pathway-state-icon">😠</div>
                    <div class="pathway-state-name">ANGER</div>
                    <div class="pathway-state-badge" style="background: #EF4444;">"I can't do this"</div>
                </div>
            </div>
            <p>You have <strong>2-3 points</strong> to reset before frustration becomes destructive. Act fast!</p>
        </div>

        <div class="states-grid">
            <div class="state-card" style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-color: #10B981;">
                <div class="state-badge" style="background: #10B981;">✓ USEFUL</div>
                <div class="state-title" style="color: #047857;">"I Can Fix This"</div>
                <div class="state-emotion-box">
                    <div class="state-emotion-icon">😤</div>
                    <div class="state-emotion-name" style="color: #F59E0B;">Frustration</div>
                    <div class="state-emotion-quote">"I know what to do, I'm just not doing it"</div>
                </div>
                <div class="state-desc" style="color: #047857;">
                    <strong>Stay here!</strong> This feeling drives improvement. Pick ONE thing to adjust and commit to it.
                </div>
            </div>

            <div class="state-card" style="background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-color: #EF4444;">
                <div class="state-badge" style="background: #EF4444;">✗ DESTRUCTIVE</div>
                <div class="state-title" style="color: #B91C1C;">"I Can't Do This"</div>
                <div class="destructive-emotions">
                    <div class="destructive-emotion">
                        <span class="destructive-emotion-icon">${emotions.anger.icon}</span>
                        <span class="destructive-emotion-name" style="color: ${emotions.anger.color};">${emotions.anger.name}</span>
                    </div>
                    <div class="destructive-emotion">
                        <span class="destructive-emotion-icon">${emotions.anxiety.icon}</span>
                        <span class="destructive-emotion-name" style="color: ${emotions.anxiety.color};">${emotions.anxiety.name}</span>
                    </div>
                    <div class="destructive-emotion">
                        <span class="destructive-emotion-icon">${emotions.disappointment.icon}</span>
                        <span class="destructive-emotion-name" style="color: ${emotions.disappointment.color};">${emotions.disappointment.name}</span>
                    </div>
                </div>
                <div class="state-desc" style="color: #B91C1C;">
                    <strong>Danger!</strong> When you feel helpless, you stop trying. Time for a full reset at the towel.
                </div>
            </div>
        </div>

        <div class="action-plan">
            <h4>⚡ Your 2-3 Point Action Plan</h4>
            <div class="action-steps">
                <div class="action-step">
                    <strong>1. Notice it early</strong><br>
                    "I'm getting frustrated"
                </div>
                <div class="action-step">
                    <strong>2. Pick ONE thing</strong><br>
                    "I'll focus on my toss"
                </div>
                <div class="action-step">
                    <strong>3. Commit fully</strong><br>
                    "Just this one adjustment"
                </div>
                <div class="action-step">
                    <strong>4. Let results go</strong><br>
                    "Process over outcome"
                </div>
            </div>
        </div>
    `;
}

// Ego View
function renderEgoView() {
    const container = document.getElementById('egoView');

    container.innerHTML = `
        <div class="section-title">
            <div class="icon">🧠</div>
            <h2>Judging vs Doing</h2>
            <p>When you're evaluating yourself, you're not playing tennis. When you're playing tennis, there's no room for judgment.</p>
        </div>

        <div class="modes-grid">
            <div class="mode-card" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%);">
                <div class="mode-badge">✓ WHERE YOU WANT TO BE</div>
                <h3 class="mode-title">DOING Mode</h3>
                <p class="mode-subtitle">Your mind is on the ball, not on yourself</p>
                <div class="mode-icons">😌 😄</div>
                <div class="mode-questions">
                    <div class="mode-questions-title">Your mind is asking:</div>
                    <ul>
                        <li>"Where's my target?"</li>
                        <li>"Split step, ready"</li>
                        <li>"Watch the ball"</li>
                        <li>"Next ball, next point"</li>
                    </ul>
                </div>
            </div>

            <div class="mode-card" style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);">
                <div class="mode-badge">✗ THE TRAP</div>
                <h3 class="mode-title">JUDGING Mode</h3>
                <p class="mode-subtitle">Your mind is on yourself, not on the ball</p>
                <div class="mode-icons">😰 😠 😞</div>
                <div class="mode-questions">
                    <div class="mode-questions-title">Your mind is asking:</div>
                    <ul>
                        <li>"Am I playing well?"</li>
                        <li>"What's the score?"</li>
                        <li>"What do they think of me?"</li>
                        <li>"Why can't I do this?"</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="self-check">
            <h4>🔍 Quick Self-Check Between Points</h4>
            <div class="self-check-grid">
                <div class="self-check-item" style="background: #FEE2E2; border-left-color: #EF4444;">
                    <div class="self-check-title" style="color: #B91C1C;">🚫 If you're thinking about...</div>
                    <div class="self-check-desc" style="color: #7F1D1D;">The score, yourself, your opponent, what others think</div>
                </div>
                <div class="self-check-item" style="background: #D1FAE5; border-left-color: #10B981;">
                    <div class="self-check-title" style="color: #047857;">✓ You should be thinking about...</div>
                    <div class="self-check-desc" style="color: #065F46;">The ball, your target, your feet, your breath</div>
                </div>
            </div>
        </div>

        <div class="simple-question-box">
            <div class="simple-question-label">THE SIMPLE QUESTION</div>
            <div class="simple-question-text">"Am I JUDGING or DOING?"</div>
            <p class="simple-question-desc">Ask yourself this between points. If you're judging, say "NEXT BALL" and get back to doing.</p>
            <div class="question-comparison">
                <div class="comparison-side">
                    <div class="comparison-label" style="color: #EF4444;">JUDGING</div>
                    <div class="comparison-desc">Score, self, others</div>
                </div>
                <div class="comparison-arrow">→</div>
                <div class="comparison-side">
                    <div class="comparison-label" style="color: #10B981;">DOING</div>
                    <div class="comparison-desc">Ball, target, feet</div>
                </div>
            </div>
        </div>

        <div class="reset-process">
            <h4>🔄 The Complete Reset Process</h4>
            <div class="reset-process-steps">
                ${[
                    { num: '1', title: 'Notice', desc: 'Catch yourself judging' },
                    { num: '2', title: 'Accept', desc: 'Feel the emotion fully' },
                    { num: '3', title: 'Release', desc: 'Let it go at the towel' },
                    { num: '4', title: 'Refocus', desc: 'Back to THIS point' }
                ].map(step => `
                    <div class="reset-process-step">
                        <div class="reset-process-num">${step.num}</div>
                        <div class="reset-process-title">${step.title}</div>
                        <div class="reset-process-desc">${step.desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}
