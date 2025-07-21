class TennisLanguageProcessor {
    constructor() {
        this.POSITIVE_EXPRESSIONS = {
            "pump_up": ["vamos", "grande", "ahí está", "eso es", "así se hace", "joder sí", "venga", "dale", "vaya"],
            "encouragement": ["bien hecho", "bien jugado", "perfecto", "genial", "brutal", "fenomenal", "increíble", "qué bueno"],
            "forward_focus": ["la próxima", "seguimos", "vamos por el siguiente", "a por el siguiente punto", "el que viene", "siguiente"],
            "mistake_recovery": ["no pasa nada", "tranquilo", "ya está", "se acabó", "página nueva", "borrón y cuenta nueva", "vale"],
            "tactical": ["más profundo", "con efecto", "al revés", "cross", "paralela", "subir", "bajar el ritmo", "corto", "largo"],
            "emotional_release": ["me cago en", "joder", "hostia", "coño", "leche", "mierda"] // when not directed negatively
        };

        this.CONTEXT_PATTERNS = {
            "after_winner": ["grande", "eso es", "ahí está", "brutal", "vamos", "qué bueno", "perfecto"],
            "after_error": ["no pasa nada", "la próxima", "tranquilo", "ya está", "vale", "página nueva"],
            "during_pressure": ["vamos", "respira", "uno a uno", "punto a punto", "tranquilo", "despacio"],
            "celebration": ["grande", "joder sí", "así se hace", "genial", "brutal", "qué bueno"],
            "tactical_adjustment": ["más profundo", "corto", "largo", "cross", "paralela", "con efecto", "subir"]
        };

        this.INTENSITY_MARKERS = {
            "high_energy": ["joder", "hostia", "vamos", "grande", "brutal"],
            "controlled": ["tranquilo", "despacio", "bien", "vale", "perfecto"],
            "tactical": ["profundo", "efecto", "cross", "paralela", "subir", "bajar"]
        };
    }

    /**
     * Analyze if emotional language is constructive vs destructive
     */
    analyzeEmotionalContext(quote, situation = "") {
        const lowerQuote = quote.toLowerCase();
        const lowerSituation = situation.toLowerCase();

        // Check for positive patterns
        const isPumpUp = this.POSITIVE_EXPRESSIONS.pump_up.some(expr => lowerQuote.includes(expr));
        const isEncouragement = this.POSITIVE_EXPRESSIONS.encouragement.some(expr => lowerQuote.includes(expr));
        const isForwardFocus = this.POSITIVE_EXPRESSIONS.forward_focus.some(expr => lowerQuote.includes(expr));
        const isRecovery = this.POSITIVE_EXPRESSIONS.mistake_recovery.some(expr => lowerQuote.includes(expr));

        // Check context appropriateness
        let contextScore = 5; // neutral baseline

        if (lowerSituation.includes("winner") || lowerSituation.includes("bueno")) {
            if (isPumpUp || isEncouragement) contextScore += 3;
        }

        if (lowerSituation.includes("error") || lowerSituation.includes("fallo")) {
            if (isRecovery || isForwardFocus) contextScore += 2;
            if (isPumpUp) contextScore -= 1; // might be inappropriate after error
        }

        // Determine if profanity is constructive
        const hasEmotionalRelease = this.POSITIVE_EXPRESSIONS.emotional_release.some(expr => lowerQuote.includes(expr));
        let profanityContext = "neutral";

        if (hasEmotionalRelease) {
            if (isPumpUp || (lowerSituation.includes("winner"))) {
                profanityContext = "constructive"; // emotional celebration
                contextScore += 1;
            } else if (isRecovery || lowerQuote.includes("vamos")) {
                profanityContext = "release"; // healthy emotional release
            } else {
                profanityContext = "concerning"; // potentially destructive
                contextScore -= 2;
            }
        }

        return {
            constructive: contextScore >= 6,
            culturally_appropriate: contextScore >= 5,
            performance_enhancing: contextScore >= 7,
            profanity_context: profanityContext,
            intensity_level: this.getIntensityLevel(lowerQuote),
            psychological_function: this.getPsychologicalFunction(lowerQuote, lowerSituation)
        };
    }

    /**
     * Get intensity level of expression
     */
    getIntensityLevel(lowerQuote) {
        if (this.INTENSITY_MARKERS.high_energy.some(marker => lowerQuote.includes(marker))) {
            return "high";
        }
        if (this.INTENSITY_MARKERS.controlled.some(marker => lowerQuote.includes(marker))) {
            return "controlled";
        }
        if (this.INTENSITY_MARKERS.tactical.some(marker => lowerQuote.includes(marker))) {
            return "tactical";
        }
        return "medium";
    }

    /**
     * Determine psychological function of the expression
     */
    getPsychologicalFunction(lowerQuote, lowerSituation) {
        if (this.POSITIVE_EXPRESSIONS.pump_up.some(expr => lowerQuote.includes(expr))) {
            return "confidence_boost";
        }
        if (this.POSITIVE_EXPRESSIONS.mistake_recovery.some(expr => lowerQuote.includes(expr))) {
            return "emotional_reset";
        }
        if (this.POSITIVE_EXPRESSIONS.tactical.some(expr => lowerQuote.includes(expr))) {
            return "tactical_focus";
        }
        if (this.POSITIVE_EXPRESSIONS.emotional_release.some(expr => lowerQuote.includes(expr))) {
            return "pressure_release";
        }
        return "general_regulation";
    }

    /**
     * Check if expression matches specific tennis contexts
     */
    matchContext(quote, situation) {
        const lowerQuote = quote.toLowerCase();
        const lowerSituation = situation.toLowerCase();

        for (const [context, expressions] of Object.entries(this.CONTEXT_PATTERNS)) {
            if (expressions.some(expr => lowerQuote.includes(expr))) {
                // Check if context matches situation
                if (context === "after_winner" && (lowerSituation.includes("winner") || lowerSituation.includes("bueno"))) {
                    return { context, match: "perfect", appropriateness: 10 };
                }
                if (context === "after_error" && (lowerSituation.includes("error") || lowerSituation.includes("fallo"))) {
                    return { context, match: "perfect", appropriateness: 10 };
                }
                return { context, match: "possible", appropriateness: 7 };
            }
        }

        return { context: "general", match: "none", appropriateness: 5 };
    }

    /**
     * Extract tennis-specific vocabulary
     */
    extractTennisVocabulary(transcription) {
        const lowerText = transcription.toLowerCase();
        const foundExpressions = [];

        // Check all expression categories
        for (const [category, expressions] of Object.entries(this.POSITIVE_EXPRESSIONS)) {
            for (const expr of expressions) {
                if (lowerText.includes(expr)) {
                    foundExpressions.push({
                        expression: expr,
                        category: category,
                        cultural_significance: this.getCulturalSignificance(expr, category)
                    });
                }
            }
        }

        return foundExpressions;
    }

    /**
     * Get cultural significance of expression
     */
    getCulturalSignificance(expression, category) {
        const significanceMap = {
            "vamos": "Universal Spanish motivational expression",
            "grande": "Common celebration in Spanish tennis",
            "no pasa nada": "Adaptive coping mechanism in Spanish culture",
            "la próxima": "Forward-focused resilience thinking",
            "joder": "Emotional intensity marker (can be positive in sports context)",
            "tranquilo": "Self-regulation cue for pressure management"
        };

        return significanceMap[expression] || `Tennis-specific ${category} expression`;
    }
}

module.exports = new TennisLanguageProcessor(); 