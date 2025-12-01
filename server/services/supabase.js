const { createClient } = require('@supabase/supabase-js');

class SupabaseService {
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.warn('⚠️  Supabase credentials not configured. Session storage disabled.');
            this.client = null;
            return;
        }

        // Use service key for server-side operations (bypasses RLS)
        this.client = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('✅ Supabase service initialized');
    }

    /**
     * Check if Supabase is configured
     */
    isConfigured() {
        return this.client !== null;
    }

    /**
     * Save a session with analysis results
     */
    async saveSession(playerId, transcript, analysisData, sessionType = 'practice') {
        if (!this.client) {
            console.warn('Supabase not configured, skipping session save');
            return null;
        }

        try {
            const summary = analysisData.analysis_summary || {};
            
            // Insert session
            const { data: session, error: sessionError } = await this.client
                .from('sessions')
                .insert({
                    player_id: playerId,
                    session_type: sessionType,
                    raw_transcript: transcript,
                    analysis_json: analysisData,
                    helpful_thought_ratio: summary.helpful_thought_ratio,
                    average_attribution_quality: summary.average_attribution_quality,
                    total_segments: summary.total_segments || analysisData.segments?.length || 0
                })
                .select()
                .single();

            if (sessionError) {
                console.error('Error saving session:', sessionError);
                throw sessionError;
            }

            // Insert normalized patterns for trend analysis
            if (analysisData.segments && analysisData.segments.length > 0) {
                const patterns = [];
                
                for (const segment of analysisData.segments) {
                    // Add each psychological pattern
                    if (segment.psychological_patterns) {
                        for (const pattern of segment.psychological_patterns) {
                            patterns.push({
                                session_id: session.id,
                                player_id: playerId,
                                pattern_type: pattern.type,
                                helpfulness_score: pattern.helpfulness_score,
                                quote: segment.quote,
                                explanation: pattern.explanation,
                                intensity: pattern.intensity,
                                focus_direction: segment.focus_direction,
                                has_attribution: segment.attribution_analysis?.has_attribution || false,
                                attribution_quality_score: segment.attribution_analysis?.attribution_quality_score
                            });
                        }
                    }
                }

                if (patterns.length > 0) {
                    const { error: patternsError } = await this.client
                        .from('patterns')
                        .insert(patterns);

                    if (patternsError) {
                        console.error('Error saving patterns:', patternsError);
                        // Don't throw - session was saved successfully
                    }
                }
            }

            console.log(`Session saved: ${session.id} with ${analysisData.segments?.length || 0} segments`);
            return session;

        } catch (error) {
            console.error('Error in saveSession:', error);
            throw error;
        }
    }

    /**
     * Get sessions for a player
     */
    async getPlayerSessions(playerId, limit = 10) {
        if (!this.client) return [];

        try {
            const { data, error } = await this.client
                .from('sessions')
                .select('id, created_at, session_type, helpful_thought_ratio, average_attribution_quality, total_segments')
                .eq('player_id', playerId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];

        } catch (error) {
            console.error('Error fetching sessions:', error);
            return [];
        }
    }

    /**
     * Get a specific session with full analysis
     */
    async getSession(sessionId, playerId) {
        if (!this.client) return null;

        try {
            const { data, error } = await this.client
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .eq('player_id', playerId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error fetching session:', error);
            return null;
        }
    }

    /**
     * Get player's pattern trends over time
     */
    async getPatternTrends(playerId, days = 30) {
        if (!this.client) return null;

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await this.client
                .from('patterns')
                .select('pattern_type, helpfulness_score, created_at')
                .eq('player_id', playerId)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Aggregate by pattern type
            const trends = {};
            for (const pattern of (data || [])) {
                if (!trends[pattern.pattern_type]) {
                    trends[pattern.pattern_type] = {
                        count: 0,
                        totalScore: 0,
                        scores: []
                    };
                }
                trends[pattern.pattern_type].count++;
                trends[pattern.pattern_type].totalScore += pattern.helpfulness_score || 0;
                trends[pattern.pattern_type].scores.push({
                    score: pattern.helpfulness_score,
                    date: pattern.created_at
                });
            }

            // Calculate averages
            for (const type in trends) {
                trends[type].averageScore = trends[type].count > 0 
                    ? Math.round(trends[type].totalScore / trends[type].count * 10) / 10
                    : 0;
            }

            return trends;

        } catch (error) {
            console.error('Error fetching pattern trends:', error);
            return null;
        }
    }

    /**
     * Get player profile
     */
    async getProfile(userId) {
        if (!this.client) return null;

        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Update player profile
     */
    async updateProfile(userId, updates) {
        if (!this.client) return null;

        try {
            const { data, error } = await this.client
                .from('profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Verify a JWT token and get user
     */
    async verifyToken(token) {
        if (!this.client) return null;

        try {
            const { data: { user }, error } = await this.client.auth.getUser(token);
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    }
}

module.exports = new SupabaseService();
