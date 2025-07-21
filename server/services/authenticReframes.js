class AuthenticReframes {
    constructor() {
        this.REFRAME_STYLES = {
            "spanish_tennis": {
                "mistake_recovery": [
                    "No pasa nada, la próxima con más {adjustment}",
                    "Ya está, {tactical_change} y seguimos",
                    "Vale, {specific_fix} y vamos a por el siguiente",
                    "Tranquilo, {technical_fix} y a por la siguiente bola",
                    "Se acabó, ahora {tactical_adjustment} y vamos"
                ],
                "confidence_building": [
                    "Vamos, que {positive_aspect} estuvo bien",
                    "Ahí está, seguimos con {what_working}",
                    "Grande, eso es lo que quiero, más {specific_technique}",
                    "Perfecto, así {positive_element}, vamos por más",
                    "Genial, {strength} está funcionando, seguimos"
                ],
                "pressure_management": [
                    "Tranquilo, uno a uno, {process_focus}",
                    "Respira, {tactical_reminder} y vamos",
                    "Punto a punto, {focus_area}",
                    "Despacio, {technical_cue} y seguimos",
                    "Vale, {breathing_cue} y {tactical_focus}"
                ],
                "tactical_adjustment": [
                    "Vale, {adjustment} y vamos",
                    "Ahora {tactical_change}, vamos a por el siguiente",
                    "Bien, {technical_fix} y seguimos",
                    "Perfecto, {strategy_change} y dale",
                    "{tactical_element} y vamos a machacarlo"
                ],
                "celebration_enhancement": [
                    "Grande! Así {what_worked}, más de eso",
                    "Perfecto! {technique} está brutal, seguimos",
                    "Vamos! {positive_element} funcionando, dale",
                    "Eso es! {strength} al máximo, vamos por más",
                    "Brutal! {technique} perfecto, a por el siguiente"
                ]
            }
        };

        this.TACTICAL_ADJUSTMENTS = {
            "serve": ["más efecto", "más profundo", "al cuerpo", "abierto", "por el centro"],
            "forehand": ["más cross", "más profundo", "con efecto", "más plano", "subiendo"],
            "backhand": ["más paralelo", "cortado", "con efecto", "profundo", "corto"],
            "volley": ["más firme", "cortada", "profunda", "al hueco", "con ángulo"],
            "movement": ["más rápido", "mejor posición", "más equilibrio", "mejores apoyos", "más agresivo"],
            "general": ["más concentración", "mejor timing", "más paciencia", "más agresivo", "más consistente"]
        };

        this.ENERGY_LEVELS = {
            "high": ["dale", "vamos", "a machacarlo", "brutal", "grande"],
            "medium": ["seguimos", "vamos", "perfecto", "bien", "vale"],
            "controlled": ["tranquilo", "despacio", "uno a uno", "punto a punto", "respira"]
        };
    }

    /**
     * Generate authentic reframe based on original attribution
     */
    generateReframe(originalQuote, situation, attributionType, energyLevel = "medium") {
        const lowerOriginal = originalQuote.toLowerCase();
        const lowerSituation = situation.toLowerCase();

        // Determine reframe category
        let category = this.determineReframeCategory(lowerOriginal, lowerSituation, attributionType);

        // Get appropriate template
        const templates = this.REFRAME_STYLES.spanish_tennis[category];
        const template = this.selectTemplate(templates, energyLevel);

        // Fill in the template with appropriate content
        return this.fillTemplate(template, originalQuote, situation, category);
    }

    /**
     * Determine which reframe category to use
     */
    determineReframeCategory(lowerOriginal, lowerSituation, attributionType) {
        // Check for error context
        if (lowerSituation.includes("error") || lowerSituation.includes("fallo") ||
            lowerOriginal.includes("mal") || lowerOriginal.includes("fallo")) {
            return "mistake_recovery";
        }

        // Check for winner context  
        if (lowerSituation.includes("winner") || lowerSituation.includes("bueno") ||
            lowerOriginal.includes("bien") || lowerOriginal.includes("perfecto")) {
            return "celebration_enhancement";
        }

        // Check for pressure context
        if (lowerOriginal.includes("nervios") || lowerOriginal.includes("presión") ||
            lowerSituation.includes("pressure") || lowerSituation.includes("importante")) {
            return "pressure_management";
        }

        // Check for tactical context
        if (lowerOriginal.includes("técnica") || lowerOriginal.includes("golpe") ||
            this.containsTacticalTerms(lowerOriginal)) {
            return "tactical_adjustment";
        }

        // Default to confidence building
        return "confidence_building";
    }

    /**
     * Check if text contains tactical tennis terms
     */
    containsTacticalTerms(text) {
        const tacticalTerms = ["revés", "derecha", "saque", "volea", "cross", "paralela", "efecto", "profundo"];
        return tacticalTerms.some(term => text.includes(term));
    }

    /**
     * Select appropriate template based on energy level
     */
    selectTemplate(templates, energyLevel) {
        // For now, select randomly from available templates
        // Could be enhanced to match energy level more precisely
        return templates[Math.floor(Math.random() * templates.length)];
    }

    /**
     * Fill template with contextually appropriate content
     */
    fillTemplate(template, originalQuote, situation, category) {
        const lowerOriginal = originalQuote.toLowerCase();
        const lowerSituation = situation.toLowerCase();

        let filledTemplate = template;

        // Replace placeholders based on category and context
        if (template.includes("{adjustment}")) {
            const adjustment = this.getAdjustment(lowerOriginal, lowerSituation);
            filledTemplate = filledTemplate.replace("{adjustment}", adjustment);
        }

        if (template.includes("{tactical_change}")) {
            const tacticalChange = this.getTacticalChange(lowerOriginal, lowerSituation);
            filledTemplate = filledTemplate.replace("{tactical_change}", tacticalChange);
        }

        if (template.includes("{specific_fix}")) {
            const specificFix = this.getSpecificFix(lowerOriginal, lowerSituation);
            filledTemplate = filledTemplate.replace("{specific_fix}", specificFix);
        }

        if (template.includes("{positive_aspect}")) {
            const positiveAspect = this.getPositiveAspect(lowerOriginal, lowerSituation);
            filledTemplate = filledTemplate.replace("{positive_aspect}", positiveAspect);
        }

        if (template.includes("{process_focus}")) {
            const processFocus = this.getProcessFocus(lowerOriginal, lowerSituation);
            filledTemplate = filledTemplate.replace("{process_focus}", processFocus);
        }

        // Replace any remaining generic placeholders
        filledTemplate = this.replaceGenericPlaceholders(filledTemplate, lowerOriginal, lowerSituation);

        return filledTemplate;
    }

    /**
     * Get specific adjustment based on context
     */
    getAdjustment(lowerOriginal, lowerSituation) {
        if (lowerOriginal.includes("saque") || lowerSituation.includes("serve")) {
            return this.getRandomFromArray(this.TACTICAL_ADJUSTMENTS.serve);
        }
        if (lowerOriginal.includes("derecha") || lowerSituation.includes("forehand")) {
            return this.getRandomFromArray(this.TACTICAL_ADJUSTMENTS.forehand);
        }
        if (lowerOriginal.includes("revés") || lowerSituation.includes("backhand")) {
            return this.getRandomFromArray(this.TACTICAL_ADJUSTMENTS.backhand);
        }
        return this.getRandomFromArray(this.TACTICAL_ADJUSTMENTS.general);
    }

    /**
     * Get tactical change suggestion
     */
    getTacticalChange(lowerOriginal, lowerSituation) {
        const changes = ["más profundo", "cambio de ritmo", "más agresivo", "al revés", "cross profundo"];
        return this.getRandomFromArray(changes);
    }

    /**
     * Get specific technical fix
     */
    getSpecificFix(lowerOriginal, lowerSituation) {
        const fixes = ["mejor preparación", "más efecto", "mejor timing", "más equilibrio", "más concentración"];
        return this.getRandomFromArray(fixes);
    }

    /**
     * Get positive aspect to reinforce
     */
    getPositiveAspect(lowerOriginal, lowerSituation) {
        const aspects = ["el movimiento", "la intención", "la preparación", "la agresividad", "el timing"];
        return this.getRandomFromArray(aspects);
    }

    /**
     * Get process focus suggestion
     */
    getProcessFocus(lowerOriginal, lowerSituation) {
        const processes = ["bola a bola", "preparación temprana", "pies quietos", "respirar bien", "vista en la bola"];
        return this.getRandomFromArray(processes);
    }

    /**
     * Replace any remaining generic placeholders
     */
    replaceGenericPlaceholders(template, lowerOriginal, lowerSituation) {
        const genericReplacements = {
            "{what_working}": "lo que está funcionando",
            "{specific_technique}": "de esa técnica",
            "{tactical_reminder}": "recuerda la táctica",
            "{focus_area}": "mantén el foco",
            "{technical_cue}": "técnica limpia",
            "{breathing_cue}": "respira bien",
            "{tactical_focus}": "foco en el plan",
            "{what_worked}": "como has hecho",
            "{technique}": "esa técnica",
            "{positive_element}": "eso",
            "{strength}": "tu fuerte",
            "{tactical_element}": "esa táctica"
        };

        let result = template;
        for (const [placeholder, replacement] of Object.entries(genericReplacements)) {
            result = result.replace(placeholder, replacement);
        }

        return result;
    }

    /**
     * Get random item from array
     */
    getRandomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Score reframe for authenticity and effectiveness
     */
    scoreReframe(originalQuote, reframe, situation, playerStyle = "spanish_tennis") {
        const score = {
            authenticity: this.scoreAuthenticity(reframe, playerStyle),
            emotional_match: this.scoreEmotionalMatch(originalQuote, reframe),
            tactical_value: this.scoreTacticalValue(reframe),
            cultural_fit: this.scoreCulturalFit(reframe, playerStyle),
            psychological_effectiveness: this.scorePsychologicalEffectiveness(originalQuote, reframe)
        };

        // Calculate overall score
        score.overall = Math.round(
            (score.authenticity + score.emotional_match + score.tactical_value +
                score.cultural_fit + score.psychological_effectiveness) / 5
        );

        return score;
    }

    scoreAuthenticity(reframe, playerStyle) {
        const spanishExpressions = ["vamos", "vale", "tranquilo", "grande", "perfecto", "brutal", "dale"];
        const hasSpanishExpressions = spanishExpressions.some(expr => reframe.toLowerCase().includes(expr));

        if (hasSpanishExpressions) return 8;
        if (reframe.includes("más") || reframe.includes("siguiente")) return 6;
        return 4;
    }

    scoreEmotionalMatch(original, reframe) {
        // This would be enhanced with more sophisticated emotional analysis
        return 7; // placeholder
    }

    scoreTacticalValue(reframe) {
        const tacticalTerms = ["profundo", "efecto", "cross", "paralela", "técnica", "timing", "equilibrio"];
        const hasTactical = tacticalTerms.some(term => reframe.toLowerCase().includes(term));
        return hasTactical ? 8 : 5;
    }

    scoreCulturalFit(reframe, playerStyle) {
        if (playerStyle === "spanish_tennis") {
            const spanishMarkers = ["vamos", "vale", "tranquilo", "no pasa nada", "la próxima"];
            const hasMarkers = spanishMarkers.some(marker => reframe.toLowerCase().includes(marker));
            return hasMarkers ? 9 : 6;
        }
        return 7;
    }

    scorePsychologicalEffectiveness(original, reframe) {
        // Enhanced scoring based on psychological principles
        const lowerReframe = reframe.toLowerCase();

        let score = 5; // baseline

        // Forward focus
        if (lowerReframe.includes("próxima") || lowerReframe.includes("siguiente")) score += 2;

        // Process focus
        if (lowerReframe.includes("uno a uno") || lowerReframe.includes("punto a punto")) score += 2;

        // Specific vs. general
        if (lowerReframe.includes("más") && (lowerReframe.includes("profundo") || lowerReframe.includes("efecto"))) score += 1;

        return Math.min(score, 10);
    }
}

module.exports = new AuthenticReframes(); 