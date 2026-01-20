const { Anthropic } = require('@anthropic-ai/sdk');
const tennisLanguageProcessor = require('./tennisLanguageProcessor');
const authenticReframes = require('./authenticReframes');
const psychologyPatterns = require('./psychologyPatterns');
const emotionFramework = require('./emotionFramework');

class AttributionService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
        });
        this.tennisLanguage = tennisLanguageProcessor;
        this.reframes = authenticReframes;
        this.patterns = psychologyPatterns;
    }

    /**
     * Analyze transcription for attribution patterns using Claude API
     */
    async analyzeAttributions(transcription) {
        try {
            console.log('Starting attribution analysis...');

            if (!process.env.CLAUDE_API_KEY) {
                throw new Error('CLAUDE_API_KEY not configured');
            }

            if (!transcription || transcription.trim().length === 0) {
                throw new Error('No transcription provided for analysis');
            }

            const prompt = `Analyze this Spanish tennis player transcription for psychological patterns and attributions. Provide segment-by-segment analysis.

TRANSCRIPTION: "${transcription}"

For each distinct quote/comment, provide a JSON response with this structure:

{
  "segments": [
    {
      "segment_id": number,
      "quote": "exact quote from transcription",
      "timestamp": "time if available",
      "situation": "brief context",
      "helpfulness_score": number (1-10),
      "psychological_patterns": [
        {
          "type": "pattern_type",
          "helpfulness_score": number (1-10),
          "explanation": "brief explanation",
          "intensity": "low/medium/high"
        }
      ],
      "attribution_analysis": {
        "has_attribution": boolean,
        "attribution_statement": "the causal explanation if present",
        "dimensions": {
          "locus": "internal/external/mixed",
          "stability": "stable/unstable/mixed", 
          "controllability": "controllable/uncontrollable/mixed"
        },
        "attribution_quality_score": number (1-10, only if has_attribution is true),
        "attribution_explanation": "why this attribution helps/hurts performance"
      },
      "focus_direction": "forward/backward/present"
    }
  ],
  "analysis_summary": {
    "total_segments": number,
    "helpful_thought_ratio": "X%",
    "average_intensity": "low/medium/high",
    "focus_direction_ratio": "X% forward",
    "attribution_count": number,
    "average_attribution_quality": number,
    "pattern_distribution": {
      "positive_reinforcement": number,
      "self_criticism": number,
      "tactical_focus": number,
      "emotional_regulation": number,
      "forward_focus": number,
      "backward_focus": number,
      "energy_management": number,
      "pattern_recognition": number
    },
    "key_insights": ["insight 1", "insight 2"],
    "dominant_patterns": ["pattern1", "pattern2"]
  }
}

SCORING CRITERIA:

HELPFULNESS SCORE (1-10):
- 8-10: Builds confidence, motivates, solution-focused, forward-looking
- 5-7: Neutral impact, mixed helpful/unhelpful elements
- 1-4: Undermines confidence, dwelling on past, harsh self-criticism

ATTRIBUTION QUALITY SCORE (1-10, only when causal explanations present):
- 8-10: Internal-Controllable attributions that empower improvement ("I need to adjust my grip")
- 5-7: Mixed or partially helpful attributions 
- 1-4: External-Uncontrollable attributions that create helplessness ("The wind always ruins my shots")

PSYCHOLOGICAL PATTERN TYPES:
- positive_reinforcement: Self-praise, confidence building
- self_criticism: Harsh self-judgment, negative evaluation
- tactical_focus: Technical analysis, strategic thinking
- emotional_regulation: Managing frustration, staying calm
- forward_focus: Looking ahead, next point mentality
- backward_focus: Dwelling on past mistakes
- energy_management: Motivational self-talk
- pattern_recognition: Learning from experience

Focus on realistic, observable patterns. Be specific about what makes each comment helpful or unhelpful for tennis performance.`;

            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4000,
                temperature: 0.3,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            console.log('Claude API response received');

            // Extract the response content
            const responseText = response.content[0].text;

            // Try to parse the JSON response
            let analysisResult;
            try {
                // Look for JSON in the response
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysisResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.error('Error parsing Claude response:', parseError);
                console.log('Raw response:', responseText);

                // Return a structured error response
                return {
                    attributions: [],
                    error: 'Failed to parse attribution analysis',
                    raw_response: responseText
                };
            }

            // Validate the response structure
            if (!analysisResult.segments || !Array.isArray(analysisResult.segments)) {
                console.warn('Invalid response structure from Claude');
                return {
                    segments: [],
                    analysis_summary: {
                        total_segments: 0,
                        pattern_distribution: {},
                        helpful_thought_ratio: "0%",
                        average_intensity: "medium",
                        focus_direction_ratio: "0%",
                        dominant_patterns: [],
                        key_insights: []
                    },
                    error: 'Invalid response structure',
                    raw_response: responseText
                };
            }

            // Ensure all expected structures exist
            analysisResult.segments = analysisResult.segments || [];
            analysisResult.analysis_summary = analysisResult.analysis_summary || {
                total_segments: analysisResult.segments.length,
                pattern_distribution: {},
                helpful_thought_ratio: "0%",
                average_intensity: "medium",
                focus_direction_ratio: "0%",
                dominant_patterns: [],
                key_insights: []
            };

            console.log(`Segment-based analysis completed. Found ${analysisResult.segments.length} segments with psychological patterns.`);

            return analysisResult;

        } catch (error) {
            console.error('Attribution analysis error:', error);

            // Handle specific API errors
            if (error.status === 401) {
                throw new Error('Invalid Claude API key');
            } else if (error.status === 429) {
                throw new Error('Claude API rate limit exceeded');
            } else if (error.status === 500) {
                throw new Error('Claude API server error');
            }

            // Re-throw the error for generic handling
            throw new Error(`Attribution analysis failed: ${error.message}`);
        }
    }

    /**
 * Process transcription and return attribution analysis with emotion detection
 */
    async processTranscription(transcription) {
        try {
            const result = await this.analyzeAttributions(transcription);

            // Add emotion detection to each segment
            if (result.segments && Array.isArray(result.segments)) {
                result.segments = result.segments.map(segment => {
                    const emotionAnalysis = emotionFramework.detectEmotions(segment.quote, 'es');
                    return {
                        ...segment,
                        emotion_analysis: {
                            detected_emotions: emotionAnalysis.detected,
                            primary_emotion: emotionAnalysis.primaryEmotion,
                            is_in_peak_zone: emotionAnalysis.isInPeakZone,
                            recommended_action: emotionAnalysis.recommendedAction
                        }
                    };
                });

                // Add emotional trajectory to summary
                const statements = result.segments.map(s => ({ text: s.quote }));
                const trajectoryAnalysis = emotionFramework.analyzeEmotionalTrajectory(statements, 'es');

                result.analysis_summary = {
                    ...result.analysis_summary,
                    emotional_summary: trajectoryAnalysis.summary
                };
            }

            return {
                success: true,
                data: result,
                metadata: {
                    transcription_length: transcription.length,
                    analysis_timestamp: new Date().toISOString(),
                    segments_found: result.segments ? result.segments.length : 0
                }
            };

        } catch (error) {
            console.error('Transcription processing error:', error);
            throw error;
        }
    }

    /**
     * Score a reframe attempt for helpfulness improvement
     */
    async scoreReframe(originalQuote, playerReframe, context) {
        try {
            console.log('Starting reframe scoring...');

            const prompt = `Score this reframe for a Spanish tennis player. Analyze both general helpfulness and attribution quality.

Original: "${originalQuote}"
Player's reframe: "${playerReframe}"
Context: "${context}"

Provide a JSON response with dual scoring:

{
  "helpfulness_score": number (1-10),
  "attribution_analysis": {
    "has_attribution": boolean,
    "attribution_statement": "causal explanation if present",
    "attribution_quality_score": number (1-10, only if has_attribution is true),
    "dimensions": {
      "locus": "internal/external/mixed",
      "stability": "stable/unstable/mixed",
      "controllability": "controllable/uncontrollable/mixed"
    }
  },
  "feedback": "comprehensive explanation covering both scores",
  "improvements": ["specific suggestion 1", "specific suggestion 2"],
  "overall_score": number (average of helpfulness and attribution quality if present, otherwise just helpfulness)
}

SCORING CRITERIA:

HELPFULNESS SCORE (1-10):
- 8-10: Builds confidence, solution-oriented, forward-focused, specific tactical advice
- 5-7: Neutral or mixed impact, somewhat helpful but could be better  
- 1-4: Undermines confidence, dwelling on past, vague, unhelpful

ATTRIBUTION QUALITY SCORE (1-10, only when causal explanations present):
- 8-10: Internal-Controllable attributions that empower ("I need to adjust my grip/strategy")
- 5-7: Mixed attributions with some helpful elements
- 1-4: External-Uncontrollable attributions that create helplessness ("The conditions/opponent caused this")

Focus on practical tennis psychology - what will actually help performance on court. Be specific about attribution dimensions and their impact.`;

            const response = await this.anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                temperature: 0.3,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            });

            const responseText = response.content[0].text;

            // Try to parse the JSON response
            let scoreResult;
            try {
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    scoreResult = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.error('Error parsing score response:', parseError);
                return {
                    helpfulness_score: 5,
                    attribution_analysis: {
                        has_attribution: false,
                        attribution_quality_score: null
                    },
                    feedback: 'Unable to analyze reframe properly. Try making your reframe more specific and forward-focused.',
                    improvements: ['Be more specific about what to do differently', 'Focus on the next point rather than past mistakes'],
                    overall_score: 5
                };
            }

            // Validate scores are within range
            scoreResult.helpfulness_score = Math.max(1, Math.min(10, scoreResult.helpfulness_score || 5));
            if (scoreResult.attribution_analysis.has_attribution) {
                scoreResult.attribution_analysis.attribution_quality_score = Math.max(1, Math.min(10, scoreResult.attribution_analysis.attribution_quality_score || 5));
                scoreResult.overall_score = Math.round((scoreResult.helpfulness_score + scoreResult.attribution_analysis.attribution_quality_score) / 2);
            } else {
                scoreResult.overall_score = scoreResult.helpfulness_score;
            }

            console.log(`Reframe scoring completed. Helpfulness: ${scoreResult.helpfulness_score}/10, Attribution: ${scoreResult.attribution_analysis.attribution_quality_score || 'N/A'}/10`);

            return scoreResult;

        } catch (error) {
            console.error('Reframe scoring error:', error);

            // Return a default response if API fails
            return {
                helpfulness_score: 5,
                attribution_analysis: {
                    has_attribution: false,
                    attribution_quality_score: null
                },
                feedback: 'Unable to analyze reframe due to technical error. Try making your comment more specific and constructive.',
                improvements: ['Focus on specific improvements', 'Use forward-looking language'],
                overall_score: 5
            };
        }
    }
}

module.exports = new AttributionService(); 