/**
 * Emotion Framework Service
 * Based on sports psychology research: Circumplex Model, IZOF, Achievement Goal Theory
 * Designed to help tennis players understand and regulate their emotions during play
 */

class EmotionFramework {
    constructor() {
        // Core emotions with psychological dimensions
        this.EMOTIONS = {
            disappointment: {
                name: 'Disappointment',
                nameEs: 'Decepcion',
                icon: '😞',
                color: '#6B7280',
                gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
                arousal: 3,          // 1-10 energy level
                valence: 2,          // 1-10 positive/negative feeling
                timeline: 'Past',    // Past, Present, Future focus
                ego: 'Ego-Threatened',
                controllability: 'Internal + Uncontrollable',
                danger: 'Critical',
                description: 'Low energy withdrawal from challenge',
                descriptionEs: 'Retirada de baja energia del desafio',
                triggerPhrases: [
                    'no puedo', 'es imposible', 'ya no', 'me rindo', 'para que',
                    'no sirve', 'no vale la pena', 'siempre pierdo', 'nunca gano',
                    'i can\'t', 'it\'s hopeless', 'what\'s the point', 'i give up'
                ],
                resetAction: 'Jump, pump your fist, stand tall',
                resetActionEs: 'Salta, levanta el puno, mantente erguido'
            },
            frustration: {
                name: 'Frustration',
                nameEs: 'Frustracion',
                icon: '😤',
                color: '#F59E0B',
                gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                arousal: 6,
                valence: 3,
                timeline: 'Past/Present',
                ego: 'Task → Ego-Pressured',
                controllability: 'Internal + Controllable',
                danger: 'Moderate',
                description: 'Productive tension seeking solution',
                descriptionEs: 'Tension productiva buscando solucion',
                triggerPhrases: [
                    'otra vez', 'joder', 'mierda', 'vamos', 'por que', 'como es posible',
                    'tengo que', 'no puede ser', 'venga ya', 'pero si lo se hacer',
                    'come on', 'again', 'why', 'i know how to do this'
                ],
                resetAction: 'Pick ONE thing to focus on',
                resetActionEs: 'Elige UNA cosa en la que enfocarte'
            },
            anger: {
                name: 'Anger',
                nameEs: 'Rabia',
                icon: '😠',
                color: '#EF4444',
                gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                arousal: 8,
                valence: 2,
                timeline: 'Past/Present',
                ego: 'Ego-Defensive',
                controllability: 'Internal + Uncontrollable',
                danger: 'Moderate-High',
                description: 'Explosive reaction to perceived injustice',
                descriptionEs: 'Reaccion explosiva a injusticia percibida',
                triggerPhrases: [
                    'es una mierda', 'me cago', 'hostia', 'puta', 'injusto',
                    'no es justo', 'trampa', 'esta ciego', 'el arbitro',
                    'this is bullshit', 'unfair', 'cheating', 'blind ref'
                ],
                resetAction: 'Walk to towel, breathe deep',
                resetActionEs: 'Camina a la toalla, respira profundo'
            },
            anxiety: {
                name: 'Anxiety',
                nameEs: 'Ansiedad',
                icon: '😰',
                color: '#8B5CF6',
                gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                arousal: 7,
                valence: 3,
                timeline: 'Future',
                ego: 'Ego-Pressured',
                controllability: 'Internal + Uncontrollable',
                danger: 'High',
                description: 'Anticipatory fear of failure',
                descriptionEs: 'Miedo anticipatorio al fracaso',
                triggerPhrases: [
                    'y si pierdo', 'que van a pensar', 'no puedo fallar',
                    'tengo que ganar', 'si fallo', 'me van a ver', 'estoy nervioso',
                    'what if', 'they\'re watching', 'i have to win', 'i\'m nervous'
                ],
                resetAction: 'Walk to towel, breathe deep',
                resetActionEs: 'Camina a la toalla, respira profundo'
            },
            calmness: {
                name: 'Calmness',
                nameEs: 'Calma',
                icon: '😌',
                color: '#3B82F6',
                gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                arousal: 4,
                valence: 7,
                timeline: 'Present',
                ego: 'Task-Focused',
                controllability: 'Internal + Controllable',
                danger: 'Low',
                description: 'Centered presence and clarity',
                descriptionEs: 'Presencia centrada y claridad',
                triggerPhrases: [
                    'tranquilo', 'respira', 'uno a uno', 'punto a punto',
                    'esta bien', 'sin prisa', 'calma', 'enfocate',
                    'stay calm', 'breathe', 'one point at a time', 'focus'
                ],
                resetAction: 'Stay in the moment, trust it',
                resetActionEs: 'Mantente en el momento, confía'
            },
            excitement: {
                name: 'Excitement',
                nameEs: 'Entusiasmo',
                icon: '😄',
                color: '#10B981',
                gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                arousal: 7,
                valence: 8,
                timeline: 'Present/Future',
                ego: 'Task-Focused',
                controllability: 'Internal + Controllable',
                danger: 'Low',
                description: 'Energized engagement with challenge',
                descriptionEs: 'Compromiso energizado con el desafio',
                triggerPhrases: [
                    'vamos', 'eso es', 'grande', 'si', 'bien', 'perfecto',
                    'genial', 'increible', 'a por el', 'lo tengo',
                    'yes', 'let\'s go', 'amazing', 'perfect', 'i got this'
                ],
                resetAction: 'Stay in the moment, trust it',
                resetActionEs: 'Mantente en el momento, confía'
            }
        };

        // Peak performance zone definition (based on IZOF theory)
        this.PEAK_ZONE = {
            arousalMin: 4,
            arousalMax: 7,
            valenceMin: 5,
            valenceMax: 10,
            description: 'Optimal arousal with positive emotions',
            targetEmotions: ['calmness', 'excitement']
        };

        // Key insights for players
        this.KEY_INSIGHTS = {
            watchOut: {
                emotion: 'Disappointment',
                reason: 'It makes you want to give up',
                color: '#EF4444'
            },
            targetZone: {
                emotion: 'Calm + Excited',
                reason: 'This is where you play your best',
                color: '#10B981'
            },
            actFast: {
                emotion: 'Frustration Building',
                reason: 'You have 2-3 points to reset',
                color: '#F59E0B'
            }
        };

        // Reset strategies by energy level
        this.RESET_STRATEGIES = {
            lowEnergy: {
                range: [1, 3],
                label: 'Energy Too Low',
                actions: [
                    'Jump up and down, pump your fist',
                    'Stand tall with power pose',
                    'Say something strong to yourself',
                    'Quick feet, stay moving',
                    'Deep breath OUT with energy'
                ],
                actionsEs: [
                    'Salta, levanta el puno',
                    'Mantente erguido con postura de poder',
                    'Dite algo fuerte a ti mismo',
                    'Pies rapidos, sigue moviendote',
                    'Respira profundo HACIA FUERA con energia'
                ]
            },
            optimalEnergy: {
                range: [4, 7],
                label: 'Optimal Zone',
                actions: [
                    'Maintain your rhythm',
                    'Stay present focused',
                    'Trust your preparation'
                ],
                actionsEs: [
                    'Mantén tu ritmo',
                    'Permanece enfocado en el presente',
                    'Confía en tu preparación'
                ]
            },
            highEnergy: {
                range: [8, 10],
                label: 'Energy Too High',
                actions: [
                    'Walk to your towel (take your time)',
                    'Diaphragmatic breathing (belly expands)',
                    'Tighten muscles, then relax',
                    'Soft eyes, drop your shoulders',
                    'Deal with the emotion, then let it go'
                ],
                actionsEs: [
                    'Camina a tu toalla (tomate tu tiempo)',
                    'Respiracion diafragmatica (expande el abdomen)',
                    'Tensa los musculos, luego relajalos',
                    'Ojos suaves, baja los hombros',
                    'Acepta la emocion, luego dejala ir'
                ]
            }
        };

        // The towel reset ritual
        this.TOWEL_RESET = {
            steps: [
                { step: '1', text: 'Walk slowly to towel', textEs: 'Camina lento a la toalla' },
                { step: '2', text: 'Wipe face deliberately', textEs: 'Limpia la cara deliberadamente' },
                { step: '3', text: 'Deep belly breaths', textEs: 'Respiraciones profundas de barriga' },
                { step: '4', text: 'Let the emotion go', textEs: 'Deja ir la emocion' },
                { step: '5', text: 'Back to present', textEs: 'Vuelve al presente' }
            ]
        };
    }

    /**
     * Detect emotions from a text statement
     * @param {string} text - The player's statement
     * @param {string} language - 'es' or 'en'
     * @returns {Object} Detected emotions with confidence scores
     */
    detectEmotions(text, language = 'es') {
        const lowerText = text.toLowerCase();
        const detectedEmotions = [];

        for (const [emotionKey, emotion] of Object.entries(this.EMOTIONS)) {
            let matchCount = 0;
            const matchedPhrases = [];

            for (const phrase of emotion.triggerPhrases) {
                if (lowerText.includes(phrase.toLowerCase())) {
                    matchCount++;
                    matchedPhrases.push(phrase);
                }
            }

            if (matchCount > 0) {
                const confidence = Math.min(matchCount * 30, 100);
                detectedEmotions.push({
                    emotion: emotionKey,
                    name: language === 'es' ? emotion.nameEs : emotion.name,
                    icon: emotion.icon,
                    color: emotion.color,
                    confidence,
                    matchedPhrases,
                    arousal: emotion.arousal,
                    valence: emotion.valence,
                    danger: emotion.danger,
                    timeline: emotion.timeline,
                    resetAction: language === 'es' ? emotion.resetActionEs : emotion.resetAction
                });
            }
        }

        // Sort by confidence
        detectedEmotions.sort((a, b) => b.confidence - a.confidence);

        return {
            detected: detectedEmotions,
            primaryEmotion: detectedEmotions[0] || null,
            isInPeakZone: this.isInPeakZone(detectedEmotions[0]),
            recommendedAction: this.getRecommendedAction(detectedEmotions[0], language)
        };
    }

    /**
     * Check if an emotion is in the peak performance zone
     */
    isInPeakZone(emotion) {
        if (!emotion) return false;
        return emotion.arousal >= this.PEAK_ZONE.arousalMin &&
               emotion.arousal <= this.PEAK_ZONE.arousalMax &&
               emotion.valence >= this.PEAK_ZONE.valenceMin;
    }

    /**
     * Get recommended action based on detected emotion
     */
    getRecommendedAction(emotion, language = 'es') {
        if (!emotion) {
            return language === 'es'
                ? 'Mantente presente y enfocado en el siguiente punto'
                : 'Stay present and focused on the next point';
        }

        // Find appropriate reset strategy based on arousal level
        for (const strategy of Object.values(this.RESET_STRATEGIES)) {
            if (emotion.arousal >= strategy.range[0] && emotion.arousal <= strategy.range[1]) {
                const actions = language === 'es' ? strategy.actionsEs : strategy.actions;
                return actions[0]; // Return primary action
            }
        }

        return emotion.resetAction;
    }

    /**
     * Get circumplex position for visualization
     */
    getCircumplexPosition(arousal, valence) {
        const x = ((valence - 1) / 9) * 100;
        const y = 100 - ((arousal - 1) / 9) * 100;
        return { x, y };
    }

    /**
     * Analyze emotional trajectory across multiple statements
     */
    analyzeEmotionalTrajectory(statements, language = 'es') {
        const trajectory = statements.map((statement, index) => {
            const analysis = this.detectEmotions(statement.text || statement, language);
            return {
                index,
                statement: statement.text || statement,
                ...analysis
            };
        });

        // Calculate emotional trends
        const emotionCounts = {};
        let totalArousal = 0;
        let totalValence = 0;
        let validEmotions = 0;

        trajectory.forEach(item => {
            if (item.primaryEmotion) {
                const emotion = item.primaryEmotion.emotion;
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                totalArousal += item.primaryEmotion.arousal;
                totalValence += item.primaryEmotion.valence;
                validEmotions++;
            }
        });

        const dominantEmotion = Object.entries(emotionCounts)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            trajectory,
            summary: {
                dominantEmotion: dominantEmotion ? dominantEmotion[0] : null,
                emotionDistribution: emotionCounts,
                averageArousal: validEmotions > 0 ? Math.round(totalArousal / validEmotions * 10) / 10 : null,
                averageValence: validEmotions > 0 ? Math.round(totalValence / validEmotions * 10) / 10 : null,
                peakZonePercentage: Math.round(
                    (trajectory.filter(t => t.isInPeakZone).length / trajectory.length) * 100
                ),
                dangerMoments: trajectory.filter(t =>
                    t.primaryEmotion && ['Critical', 'High', 'Moderate-High'].includes(t.primaryEmotion.danger)
                ).length
            }
        };
    }

    /**
     * Get all emotions data for the framework view
     */
    getAllEmotions() {
        return this.EMOTIONS;
    }

    /**
     * Get framework configuration for frontend
     */
    getFrameworkConfig() {
        return {
            emotions: this.EMOTIONS,
            peakZone: this.PEAK_ZONE,
            keyInsights: this.KEY_INSIGHTS,
            resetStrategies: this.RESET_STRATEGIES,
            towelReset: this.TOWEL_RESET
        };
    }
}

module.exports = new EmotionFramework();
