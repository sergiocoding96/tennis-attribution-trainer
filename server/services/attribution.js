const { Anthropic } = require('@anthropic-ai/sdk');
const tennisLanguageProcessor = require('./tennisLanguageProcessor');
const authenticReframes = require('./authenticReframes');
const psychologyPatterns = require('./psychologyPatterns');

class AttributionService {
    constructor() {
        // Configure timeout (default 60s, configurable via env)
        const timeout = parseInt(process.env.CLAUDE_API_TIMEOUT) || 60000; // 60 seconds default
        
        this.anthropic = new Anthropic({
            apiKey: process.env.CLAUDE_API_KEY,
            timeoutMs: timeout,
        });
        this.tennisLanguage = tennisLanguageProcessor;
        this.reframes = authenticReframes;
        this.patterns = psychologyPatterns;
        this.defaultModel = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';
        this.maxTokensPerRequest = 8000; // Increased from 4000 to prevent truncation
        this.chunkSize = 4000; // Reduced from 8000 to ensure responses fit within token limits
    }

    /**
     * Attempt to repair truncated JSON
     */
    repairJson(jsonString) {
        try {
            // If valid, return parsed
            return JSON.parse(jsonString);
        } catch (e) {
            console.log('Attempting to repair truncated JSON...');
            let repaired = jsonString.trim();
            
            // Check if it ends with a closing brace
            if (repaired.endsWith('}')) return JSON.parse(repaired); // Should have been caught above

            // Find the last valid closing structure
            const lastObjectEnd = repaired.lastIndexOf('}');
            const lastArrayEnd = repaired.lastIndexOf(']');
            
            // If we have a segments array that was cut off
            if (repaired.includes('"segments": [')) {
                // Try to close the segments array and the main object
                // Remove trailing comma if present
                if (repaired.endsWith(',')) repaired = repaired.slice(0, -1);
                
                // If inside an object in the array (unclosed object)
                if (repaired.lastIndexOf('{') > repaired.lastIndexOf('}')) {
                    // Close the current object
                    repaired += '}]';
                } else if (repaired.lastIndexOf(']') < repaired.lastIndexOf('}')) {
                    // Array open but not closed
                    repaired += ']';
                }
                
                // Close main object
                if (!repaired.endsWith('}')) repaired += '}';
                
                try {
                    const parsed = JSON.parse(repaired);
                    console.log('JSON repaired successfully');
                    return parsed;
                } catch (repairError) {
                    console.error('Failed to repair JSON:', repairError);
                    throw e; // Throw original error
                }
            }
            throw e;
        }
    }

    /**
     * Estimate token count (rough approximation: 1 token ≈ 4 characters)
     */
    estimateTokenCount(text) {
        return Math.ceil(text.length / 4);
    }

    /**
     * Split transcription into chunks if it's too long
     */
    chunkTranscription(transcription) {
        if (transcription.length <= this.chunkSize) {
            return [transcription];
        }

        const chunks = [];
        let currentChunk = '';
        const sentences = transcription.split(/[.!?]\s+/);

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > this.chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + sentence;
            }
        }

        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * Analyze a single chunk of transcription
     */
    async analyzeChunk(chunk, chunkIndex, totalChunks) {
        const isPartial = totalChunks > 1;
        const chunkContext = isPartial 
            ? `\n\nNOTE: This is chunk ${chunkIndex + 1} of ${totalChunks}. Analyze this segment independently.`
            : '';

        const prompt = `Analyze this Spanish tennis player transcription for psychological patterns and attributions. Provide segment-by-segment analysis.${chunkContext}

TRANSCRIPTION: "${chunk}"

For each distinct quote/comment, provide a JSON response with this structure:

{
  "segments": [
    {
      "segment_id": number,
      "quote": "exact quote",
      "timestamp": "time if available",
      "situation": "brief context",
      "helpfulness_score": number (1-10),
      "psychological_patterns": [
        {
          "type": "pattern_type",
          "helpfulness_score": number (1-10),
          "explanation": "concise explanation (max 15 words)",
          "intensity": "low/medium/high"
        }
      ],
      "attribution_analysis": {
        "has_attribution": boolean,
        "attribution_statement": "causal explanation if present",
        "dimensions": {
          "locus": "internal/external/mixed",
          "stability": "stable/unstable/mixed", 
          "controllability": "controllable/uncontrollable/mixed"
        },
        "attribution_quality_score": number (1-10, only if has_attribution is true),
        "attribution_explanation": "concise impact (max 15 words)"
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
- 8-10: Builds confidence, motivates, solution-focused
- 5-7: Neutral impact, mixed elements
- 1-4: Undermines confidence, harsh self-criticism

ATTRIBUTION QUALITY SCORE (1-10, only when causal explanations present):
- 8-10: Internal-Controllable attributions that empower
- 5-7: Mixed or partially helpful attributions 
- 1-4: External-Uncontrollable attributions that create helplessness

PSYCHOLOGICAL PATTERN TYPES:
- positive_reinforcement: Self-praise
- self_criticism: Negative evaluation
- tactical_focus: Strategy
- emotional_regulation: Managing frustration
- forward_focus: Next point mentality
- backward_focus: Dwelling on past
- energy_management: Motivational
- pattern_recognition: Learning

Focus on realistic, observable patterns. Keep explanations concise to save space.`;

        try {
            const response = await this.anthropic.messages.create({
                model: this.defaultModel,
                max_tokens: this.maxTokensPerRequest,
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
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                // Try to parse, using repair logic if needed
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    // If simple parse fails, try to repair (likely truncation)
                    return this.repairJson(jsonMatch[0]);
                }
            } else {
                // Try to repair the raw text if regex failed to find a complete block
                try {
                    return this.repairJson(responseText);
                } catch (e) {
                    throw new Error('No valid JSON found in response');
                }
            }
        } catch (error) {
            console.error(`Error analyzing chunk ${chunkIndex + 1}:`, error);
            
            // Handle timeout errors
            if (error.message && error.message.includes('timeout')) {
                throw new Error(`Request timeout while analyzing chunk ${chunkIndex + 1}. The transcription may be too long.`);
            }
            
            throw error;
        }
    }

    /**
     * Merge multiple chunk analysis results into a single result
     */
    mergeChunkResults(chunkResults) {
        if (chunkResults.length === 0) {
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
                }
            };
        }

        if (chunkResults.length === 1) {
            return chunkResults[0];
        }

        // Merge segments
        let allSegments = [];
        let segmentIdCounter = 1;
        chunkResults.forEach((result, chunkIndex) => {
            if (result.segments && Array.isArray(result.segments)) {
                result.segments.forEach(segment => {
                    allSegments.push({
                        ...segment,
                        segment_id: segmentIdCounter++
                    });
                });
            }
        });

        // Merge pattern distributions
        const mergedPatternDistribution = {};
        const patternKeys = [
            'positive_reinforcement', 'self_criticism', 'tactical_focus',
            'emotional_regulation', 'forward_focus', 'backward_focus',
            'energy_management', 'pattern_recognition'
        ];

        patternKeys.forEach(key => {
            mergedPatternDistribution[key] = chunkResults.reduce((sum, result) => {
                return sum + (result.analysis_summary?.pattern_distribution?.[key] || 0);
            }, 0);
        });

        // Calculate merged summary metrics
        const totalSegments = allSegments.length;
        const helpfulSegments = allSegments.filter(s => s.helpfulness_score >= 7).length;
        const helpfulRatio = totalSegments > 0 ? Math.round((helpfulSegments / totalSegments) * 100) : 0;
        
        const attributionSegments = allSegments.filter(s => s.attribution_analysis?.has_attribution);
        const avgAttributionQuality = attributionSegments.length > 0
            ? Math.round(attributionSegments.reduce((sum, s) => sum + (s.attribution_analysis.attribution_quality_score || 0), 0) / attributionSegments.length)
            : 0;

        // Collect all insights and dominant patterns
        const allInsights = [];
        const allDominantPatterns = [];
        chunkResults.forEach(result => {
            if (result.analysis_summary?.key_insights) {
                allInsights.push(...result.analysis_summary.key_insights);
            }
            if (result.analysis_summary?.dominant_patterns) {
                allDominantPatterns.push(...result.analysis_summary.dominant_patterns);
            }
        });

        return {
            segments: allSegments,
            analysis_summary: {
                total_segments: totalSegments,
                helpful_thought_ratio: `${helpfulRatio}%`,
                average_intensity: "medium", // Could be calculated from segments
                focus_direction_ratio: `${Math.round((allSegments.filter(s => s.focus_direction === 'forward').length / totalSegments) * 100)}% forward`,
                attribution_count: attributionSegments.length,
                average_attribution_quality: avgAttributionQuality,
                pattern_distribution: mergedPatternDistribution,
                key_insights: [...new Set(allInsights)].slice(0, 5), // Unique insights, max 5
                dominant_patterns: [...new Set(allDominantPatterns)].slice(0, 3) // Unique patterns, max 3
            }
        };
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

            // Check if transcription needs chunking
            const chunks = this.chunkTranscription(transcription);
            console.log(`Processing ${chunks.length} chunk(s) for analysis (transcription length: ${transcription.length} characters)`);

            if (chunks.length > 1) {
                console.log('Transcription is long, processing in chunks to prevent timeouts...');
            }

            // Process chunks sequentially to avoid overwhelming the API
            const chunkResults = [];
            for (let i = 0; i < chunks.length; i++) {
                console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
                try {
                    const chunkResult = await this.analyzeChunk(chunks[i], i, chunks.length);
                    chunkResults.push(chunkResult);
                } catch (chunkError) {
                    console.error(`Failed to process chunk ${i + 1}:`, chunkError);
                    // Continue with other chunks even if one fails
                    if (chunkResults.length === 0) {
                        throw chunkError; // Only throw if all chunks fail
                    }
                }
            }

            // Merge results from all chunks
            const analysisResult = this.mergeChunkResults(chunkResults);
            console.log('Claude API response received and merged');

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
            } else if (error.message && error.message.includes('timeout')) {
                throw new Error('Request timeout. The transcription may be too long. Try breaking it into smaller segments.');
            }

            // Re-throw the error for generic handling
            throw new Error(`Attribution analysis failed: ${error.message}`);
        }
    }

    /**
 * Process transcription and return attribution analysis
 */
    async processTranscription(transcription) {
        try {
            const result = await this.analyzeAttributions(transcription);

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
                model: this.defaultModel,
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

            // Handle timeout errors specifically
            if (error.message && error.message.includes('timeout')) {
                return {
                    helpfulness_score: 5,
                    attribution_analysis: {
                        has_attribution: false,
                        attribution_quality_score: null
                    },
                    feedback: 'Request timeout. Please try again with a shorter reframe.',
                    improvements: ['Keep your reframe concise', 'Focus on one key improvement'],
                    overall_score: 5
                };
            }

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