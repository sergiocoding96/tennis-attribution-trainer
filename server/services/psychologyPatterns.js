class PsychologyPatterns {
    constructor() {
        this.PATTERN_CATEGORIES = {
            "emotional_regulation": {
                "positive_patterns": [
                    "pump_up_after_winners",
                    "quick_recovery_from_errors",
                    "maintains_energy",
                    "celebrates_appropriately",
                    "uses_positive_self_talk"
                ],
                "concerning_patterns": [
                    "negative_spirals",
                    "excessive_pressure",
                    "emotional_shutdown",
                    "persistent_frustration",
                    "self_criticism_loops"
                ]
            },

            "self_talk_quality": {
                "constructive": [
                    "forward_focused",
                    "process_oriented",
                    "specific_tactical",
                    "encouraging",
                    "solution_focused"
                ],
                "destructive": [
                    "global_criticism",
                    "past_focused",
                    "vague_negativity",
                    "self_defeating",
                    "catastrophizing"
                ]
            },

            "cultural_competence": {
                "authentic_expression": "uses natural language for emotional regulation",
                "tactical_integration": "combines emotional management with tennis strategy",
                "competitive_mindset": "maintains fighting spirit appropriately"
            },

            "mental_toughness_indicators": {
                "resilience": [
                    "bounces_back_quickly",
                    "learns_from_mistakes",
                    "maintains_perspective",
                    "adapts_strategy"
                ],
                "focus": [
                    "stays_present",
                    "ignores_distractions",
                    "point_by_point_mentality",
                    "process_focused"
                ],
                "confidence": [
                    "believes_in_abilities",
                    "takes_calculated_risks",
                    "positive_body_language",
                    "aggressive_when_needed"
                ]
            }
        };

        this.SPANISH_TENNIS_MARKERS = {
            "positive_emotional_regulation": [
                "vamos", "grande", "ahí está", "eso es", "bien hecho", "perfecto",
                "no pasa nada", "la próxima", "tranquilo", "vale", "seguimos"
            ],
            "tactical_self_talk": [
                "más profundo", "con efecto", "al revés", "cross", "paralela",
                "subir", "bajar", "corto", "largo", "al cuerpo"
            ],
            "competitive_spirit": [
                "vamos por él", "a por todas", "vamos a machacarlo", "dale", "venga"
            ],
            "pressure_management": [
                "uno a uno", "punto a punto", "respira", "despacio", "tranquilo"
            ]
        };
    }

    /**
     * Analyze psychological patterns in transcription
     */
    analyzePatterns(transcription, attributions = [], emotionalRegulation = [], selfTalk = []) {
        const analysis = {
            overall_profile: this.generateOverallProfile(transcription, attributions, emotionalRegulation, selfTalk),
            emotional_regulation_assessment: this.assessEmotionalRegulation(emotionalRegulation),
            self_talk_assessment: this.assessSelfTalk(selfTalk),
            cultural_authenticity: this.assessCulturalAuthenticity(transcription),
            mental_toughness_indicators: this.assessMentalToughness(transcription, attributions, emotionalRegulation, selfTalk),
            recommendations: this.generateRecommendations(transcription, attributions, emotionalRegulation, selfTalk)
        };

        return analysis;
    }

    /**
     * Generate overall psychological profile
     */
    generateOverallProfile(transcription, attributions, emotionalRegulation, selfTalk) {
        const profile = {
            dominant_patterns: [],
            strengths: [],
            areas_for_development: [],
            authenticity_score: 0,
            overall_mental_game_score: 0
        };

        // Analyze dominant patterns
        if (emotionalRegulation.length > attributions.length) {
            profile.dominant_patterns.push("emotion_focused");
        }
        if (selfTalk.length > 0) {
            profile.dominant_patterns.push("self_talk_active");
        }
        if (attributions.filter(a => a.category === "adaptive").length > attributions.length / 2) {
            profile.dominant_patterns.push("adaptive_attributions");
        }

        // Identify strengths
        const positiveEmotions = emotionalRegulation.filter(e => e.effectiveness_score >= 7);
        if (positiveEmotions.length > 0) {
            profile.strengths.push("effective_emotional_regulation");
        }

        const authenticSelfTalk = selfTalk.filter(s => s.authenticity_score >= 7);
        if (authenticSelfTalk.length > 0) {
            profile.strengths.push("authentic_self_talk");
        }

        // Calculate scores
        profile.authenticity_score = this.calculateAuthenticityScore(transcription);
        profile.overall_mental_game_score = this.calculateOverallScore(attributions, emotionalRegulation, selfTalk);

        return profile;
    }

    /**
     * Assess emotional regulation patterns
     */
    assessEmotionalRegulation(emotionalRegulation) {
        const assessment = {
            pattern_quality: "neutral",
            effectiveness_average: 0,
            cultural_appropriateness: "appropriate",
            key_strengths: [],
            areas_to_improve: []
        };

        if (emotionalRegulation.length === 0) {
            assessment.pattern_quality = "insufficient_data";
            return assessment;
        }

        // Calculate average effectiveness
        const totalEffectiveness = emotionalRegulation.reduce((sum, er) => sum + er.effectiveness_score, 0);
        assessment.effectiveness_average = Math.round(totalEffectiveness / emotionalRegulation.length);

        // Determine pattern quality
        if (assessment.effectiveness_average >= 7) {
            assessment.pattern_quality = "strong";
        } else if (assessment.effectiveness_average >= 5) {
            assessment.pattern_quality = "adequate";
        } else {
            assessment.pattern_quality = "needs_improvement";
        }

        // Identify strengths and improvements
        const pumpUpCount = emotionalRegulation.filter(er => er.type === "pump_up").length;
        const recoveryCount = emotionalRegulation.filter(er => er.type === "calm_down").length;

        if (pumpUpCount > 0) {
            assessment.key_strengths.push("uses_positive_energy_effectively");
        }
        if (recoveryCount > 0) {
            assessment.key_strengths.push("good_self_calming_abilities");
        }

        return assessment;
    }

    /**
     * Assess self-talk quality
     */
    assessSelfTalk(selfTalk) {
        const assessment = {
            quality_level: "neutral",
            authenticity_average: 0,
            tactical_value_average: 0,
            dominant_functions: [],
            recommendations: []
        };

        if (selfTalk.length === 0) {
            assessment.quality_level = "insufficient_data";
            return assessment;
        }

        // Calculate averages
        assessment.authenticity_average = Math.round(
            selfTalk.reduce((sum, st) => sum + st.authenticity_score, 0) / selfTalk.length
        );
        assessment.tactical_value_average = Math.round(
            selfTalk.reduce((sum, st) => sum + st.tactical_value, 0) / selfTalk.length
        );

        // Determine quality level
        const overallAverage = (assessment.authenticity_average + assessment.tactical_value_average) / 2;
        if (overallAverage >= 7) {
            assessment.quality_level = "excellent";
        } else if (overallAverage >= 5) {
            assessment.quality_level = "good";
        } else {
            assessment.quality_level = "needs_development";
        }

        // Identify dominant functions
        const functionCounts = {};
        selfTalk.forEach(st => {
            functionCounts[st.function] = (functionCounts[st.function] || 0) + 1;
        });

        assessment.dominant_functions = Object.entries(functionCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([func]) => func);

        return assessment;
    }

    /**
     * Assess cultural authenticity
     */
    assessCulturalAuthenticity(transcription) {
        const lowerText = transcription.toLowerCase();
        const assessment = {
            authenticity_level: "neutral",
            spanish_tennis_markers: 0,
            cultural_appropriateness: "appropriate",
            authentic_expressions: []
        };

        // Count Spanish tennis markers
        let markerCount = 0;
        for (const [category, markers] of Object.entries(this.SPANISH_TENNIS_MARKERS)) {
            for (const marker of markers) {
                if (lowerText.includes(marker)) {
                    markerCount++;
                    assessment.authentic_expressions.push({
                        expression: marker,
                        category: category
                    });
                }
            }
        }

        assessment.spanish_tennis_markers = markerCount;

        // Determine authenticity level
        if (markerCount >= 5) {
            assessment.authenticity_level = "highly_authentic";
        } else if (markerCount >= 2) {
            assessment.authenticity_level = "authentic";
        } else if (markerCount >= 1) {
            assessment.authenticity_level = "somewhat_authentic";
        } else {
            assessment.authenticity_level = "generic";
        }

        return assessment;
    }

    /**
     * Assess mental toughness indicators
     */
    assessMentalToughness(transcription, attributions, emotionalRegulation, selfTalk) {
        const assessment = {
            resilience_score: 0,
            focus_score: 0,
            confidence_score: 0,
            overall_mental_toughness: 0,
            key_indicators: []
        };

        // Resilience indicators
        const forwardFocused = [...emotionalRegulation, ...selfTalk].filter(item =>
            item.quote && (item.quote.toLowerCase().includes("próxima") ||
                item.quote.toLowerCase().includes("siguiente"))
        ).length;

        const quickRecovery = emotionalRegulation.filter(er =>
            er.type === "calm_down" || er.psychological_function === "emotional_reset"
        ).length;

        assessment.resilience_score = Math.min(10, (forwardFocused * 2) + (quickRecovery * 2));

        // Focus indicators
        const processOriented = selfTalk.filter(st =>
            st.function === "process_focus" || st.quote.toLowerCase().includes("uno a uno")
        ).length;

        assessment.focus_score = Math.min(10, processOriented * 3);

        // Confidence indicators
        const confidenceMarkers = emotionalRegulation.filter(er =>
            er.type === "pump_up" || er.psychological_function === "confidence_boost"
        ).length;

        assessment.confidence_score = Math.min(10, confidenceMarkers * 2);

        // Overall mental toughness
        assessment.overall_mental_toughness = Math.round(
            (assessment.resilience_score + assessment.focus_score + assessment.confidence_score) / 3
        );

        return assessment;
    }

    /**
     * Generate personalized recommendations
     */
    generateRecommendations(transcription, attributions, emotionalRegulation, selfTalk) {
        const recommendations = {
            immediate_actions: [],
            long_term_development: [],
            strengths_to_leverage: [],
            cultural_enhancements: []
        };

        // Analyze patterns and generate recommendations
        const lowEffectivenessER = emotionalRegulation.filter(er => er.effectiveness_score < 5);
        if (lowEffectivenessER.length > 0) {
            recommendations.immediate_actions.push(
                "Practicar técnicas de regulación emocional más específicas para situaciones de presión"
            );
        }

        const maladaptiveAttributions = attributions.filter(a => a.category === "maladaptive");
        if (maladaptiveAttributions.length > attributions.length * 0.3) {
            recommendations.long_term_development.push(
                "Trabajar en reestructuración cognitiva para desarrollar patrones de pensamiento más adaptativos"
            );
        }

        const highAuthenticitySelfTalk = selfTalk.filter(st => st.authenticity_score >= 8);
        if (highAuthenticitySelfTalk.length > 0) {
            recommendations.strengths_to_leverage.push(
                "Mantener y expandir el uso de auto-diálogo auténtico que ya funciona bien"
            );
        }

        return recommendations;
    }

    /**
     * Calculate overall authenticity score
     */
    calculateAuthenticityScore(transcription) {
        const lowerText = transcription.toLowerCase();
        let score = 0;

        // Spanish tennis markers
        for (const markers of Object.values(this.SPANISH_TENNIS_MARKERS)) {
            for (const marker of markers) {
                if (lowerText.includes(marker)) {
                    score += 1;
                }
            }
        }

        return Math.min(10, score);
    }

    /**
     * Calculate overall mental game score
     */
    calculateOverallScore(attributions, emotionalRegulation, selfTalk) {
        let score = 5; // baseline

        // Attribution quality
        const adaptiveCount = attributions.filter(a => a.category === "adaptive").length;
        const attributionBonus = (adaptiveCount / Math.max(attributions.length, 1)) * 3;
        score += attributionBonus;

        // Emotional regulation effectiveness
        if (emotionalRegulation.length > 0) {
            const avgEffectiveness = emotionalRegulation.reduce((sum, er) => sum + er.effectiveness_score, 0) / emotionalRegulation.length;
            score += (avgEffectiveness - 5) * 0.5;
        }

        // Self-talk quality
        if (selfTalk.length > 0) {
            const avgAuthenticity = selfTalk.reduce((sum, st) => sum + st.authenticity_score, 0) / selfTalk.length;
            score += (avgAuthenticity - 5) * 0.3;
        }

        return Math.round(Math.max(1, Math.min(10, score)));
    }
}

module.exports = new PsychologyPatterns(); 