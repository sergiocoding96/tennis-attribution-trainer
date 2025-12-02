// Tennis Attribution Trainer - Frontend JavaScript

document.addEventListener('DOMContentLoaded', function () {
    console.log('🎾 Tennis Attribution Trainer loaded');

    // Audio transcription form
    const transcriptionForm = document.getElementById('transcriptionForm');

    if (transcriptionForm) {
        transcriptionForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const audioInput = document.getElementById('audioInput');
            const languageSelect = document.getElementById('language');
            const file = audioInput.files[0];

            if (!file) {
                showTranscriptionStatus('Please select an audio file', 'error');
                return;
            }

            // Validate file size (25MB limit - OpenAI Whisper API maximum)
            const maxSize = 25 * 1024 * 1024; // 25MB (OpenAI's limit)
            if (file.size > maxSize) {
                showTranscriptionStatus(`File too large. Maximum size is 25MB. Current file: ${Math.round(file.size / (1024 * 1024))}MB. Please compress the file manually before uploading.`, 'error');
                return;
            }

            const formData = new FormData();
            formData.append('audio', file);

            // Add language parameter
            if (languageSelect.value) {
                formData.append('language', languageSelect.value);
            }

            try {
                showTranscriptionStatus(`Processing ${file.name} (${Math.round(file.size / (1024 * 1024))}MB)...`, 'info');
                clearTranscriptionResult();

                const response = await fetch('/api/transcribe', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showTranscriptionStatus('Transcription completed successfully!', 'success');
                    displayTranscriptionResult(result.data, result.file_info);

                    // Clear the form
                    audioInput.value = '';
                    languageSelect.value = 'es';

                    // Show analysis section after transcription is complete
                    showAnalysisSection(result.data);

                } else {
                    showTranscriptionStatus(`Transcription failed: ${result.error}`, 'error');
                }
            } catch (error) {
                showTranscriptionStatus(`Error: ${error.message}`, 'error');
            }
        });
    }

    // Manual Text Analysis
    const analyzeTextBtn = document.getElementById('analyzeTextBtn');
    if (analyzeTextBtn) {
        analyzeTextBtn.addEventListener('click', function() {
            const textInput = document.getElementById('manualTextInput');
            const text = textInput.value.trim();

            if (!text) {
                alert('Please enter some text to analyze.');
                return;
            }

            // Create a dummy transcription object structure
            const transcriptionData = {
                text: text,
                transcription: text // fallback
            };

            // Show the analysis section
            const analysisSection = document.getElementById('analysisSection');
            analysisSection.style.display = 'block';
            
            // Trigger analysis directly
            analyzeTranscription(transcriptionData);
            
            // Setup interface
            setupCommentInterface();
        });
    }

    // Global variables for comment analysis
    let currentAnalysisData = null;
    let viewMode = 'comments'; // 'comments', 'summary'

    // Show analysis section after transcription is complete
    function showAnalysisSection(transcriptionData) {
        const analysisSection = document.getElementById('analysisSection');
        const analyzeBtn = document.getElementById('analyzeBtn');

        analysisSection.style.display = 'block';

        // Store transcription data for analysis
        analyzeBtn.onclick = () => analyzeTranscription(transcriptionData);

        // Setup comment interface
        setupCommentInterface();
    }

    // Setup comment interface event listeners
    function setupCommentInterface() {
        const showSummaryBtn = document.getElementById('showSummary');
        showSummaryBtn.onclick = () => toggleViewMode();
    }

    // Toggle between comments and summary view
    function toggleViewMode() {
        viewMode = viewMode === 'comments' ? 'summary' : 'comments';
        const showSummaryBtn = document.getElementById('showSummary');
        showSummaryBtn.textContent = viewMode === 'comments' ? '📊 Show Summary' : '💭 Show Comments';

        if (currentAnalysisData) {
            displayAnalysisResult(currentAnalysisData);
        }
    }

    // Analyze transcription for attribution patterns
    async function analyzeTranscription(transcriptionData) {
        const analysisStatus = document.getElementById('analysisStatus');
        const analysisResult = document.getElementById('analysisResult');

        try {
            showAnalysisStatus('Analyzing attribution patterns...', 'info');
            clearAnalysisResult();

            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    transcription: transcriptionData.text || transcriptionData.transcription
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showAnalysisStatus('Psychological pattern analysis completed!', 'success');
                
                // Validate result.data structure
                if (!result.data) {
                    throw new Error('No analysis data in response');
                }
                
                currentAnalysisData = result.data;
                viewMode = 'comments';

                // Show comment analysis
                const commentAnalysisDiv = document.getElementById('commentAnalysis');
                if (commentAnalysisDiv) {
                    commentAnalysisDiv.style.display = 'block';
                }

                displayAnalysisResult(currentAnalysisData);
            } else {
                const errorMsg = result.error || 'Unknown error occurred';
                showAnalysisStatus(`Analysis failed: ${errorMsg}`, 'error');
                console.error('Analysis API error:', result);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            showAnalysisStatus(`Error: ${error.message}`, 'error');
            
            // Clear any partial results
            const commentsListDiv = document.getElementById('commentsList');
            if (commentsListDiv) {
                commentsListDiv.innerHTML = `<div class="status error">Failed to analyze transcription: ${error.message}</div>`;
            }
        }
    }

    // Load sample analysis for testing (no API call)
    async function loadSampleAnalysis() {
        const analysisStatus = document.getElementById('analysisStatus');
        const analysisResult = document.getElementById('analysisResult');

        try {
            showAnalysisStatus('Loading sample analysis...', 'info');
            clearAnalysisResult();

            const response = await fetch('/api/sample-analysis');
            const result = await response.json();

            if (response.ok && result.success) {
                showAnalysisStatus('Sample analysis loaded! (Test Mode - No API tokens used)', 'success');
                
                if (!result.data) {
                    throw new Error('No analysis data in response');
                }
                
                currentAnalysisData = result.data;
                viewMode = 'comments';

                // Show comment analysis
                const commentAnalysisDiv = document.getElementById('commentAnalysis');
                if (commentAnalysisDiv) {
                    commentAnalysisDiv.style.display = 'block';
                }

                displayAnalysisResult(currentAnalysisData);
            } else {
                const errorMsg = result.error || 'Unknown error occurred';
                showAnalysisStatus(`Failed to load sample: ${errorMsg}`, 'error');
                console.error('Sample load error:', result);
            }
        } catch (error) {
            console.error('Sample load error:', error);
            showAnalysisStatus(`Error: ${error.message}`, 'error');
            
            const commentsListDiv = document.getElementById('commentsList');
            if (commentsListDiv) {
                commentsListDiv.innerHTML = `<div class="status error">Failed to load sample analysis: ${error.message}</div>`;
            }
        }
    }

    // Add event listener for sample button
    const loadSampleBtn = document.getElementById('loadSampleBtn');
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', function() {
            // Show analysis section if hidden (although the button is inside it, keeping logic robust)
            const analysisSection = document.getElementById('analysisSection');
            analysisSection.style.display = 'block';
            setupCommentInterface();
            loadSampleAnalysis();
        });
    }

    function showAnalysisStatus(message, type) {
        const statusDiv = document.getElementById('analysisStatus');
        statusDiv.className = `status ${type}`;
        statusDiv.textContent = message;
    }

    function clearAnalysisResult() {
        const resultDiv = document.getElementById('analysisResult');
        resultDiv.innerHTML = '';
    }

    function displayAnalysisResult(analysisData) {
        const commentsListDiv = document.getElementById('commentsList');
        const resultDiv = document.getElementById('analysisResult');
        
        // Clear previous results
        commentsListDiv.innerHTML = '';
        if (resultDiv) resultDiv.innerHTML = '';

        // Validate data structure
        if (!analysisData) {
            commentsListDiv.innerHTML = '<div class="status error">No analysis data received. Please try again.</div>';
            return;
        }

        // Check for error in response
        if (analysisData.error) {
            commentsListDiv.innerHTML = `<div class="status error">Analysis error: ${analysisData.error}</div>`;
            if (analysisData.raw_response) {
                console.error('Raw Claude response:', analysisData.raw_response);
            }
            return;
        }

        // Ensure segments array exists and is valid
        if (!analysisData.segments) {
            analysisData.segments = [];
        }
        
        if (!Array.isArray(analysisData.segments)) {
            console.error('Invalid segments data:', analysisData.segments);
            commentsListDiv.innerHTML = '<div class="status error">Invalid analysis data structure. Please try again.</div>';
            return;
        }

        // Ensure analysis_summary exists
        if (!analysisData.analysis_summary) {
            analysisData.analysis_summary = {
                total_segments: analysisData.segments.length,
                helpful_thought_ratio: "0%",
                average_intensity: "medium",
                focus_direction_ratio: "0%",
                attribution_count: 0,
                average_attribution_quality: 0,
                pattern_distribution: {},
                key_insights: [],
                dominant_patterns: []
            };
        }

        if (analysisData.segments.length === 0) {
            commentsListDiv.innerHTML = '<div class="status info">No psychological patterns found in the transcription. The transcription may be too short or not contain relevant patterns.</div>';
            return;
        }

        try {
            if (viewMode === 'summary') {
                displaySummaryView(analysisData);
            } else {
                displayCommentsView(analysisData);
            }
        } catch (displayError) {
            console.error('Error displaying analysis:', displayError);
            commentsListDiv.innerHTML = `<div class="status error">Error displaying analysis results: ${displayError.message}</div>`;
        }
    }

    function displayCommentsView(analysisData) {
        const commentsListDiv = document.getElementById('commentsList');
        const headerDiv = document.getElementById('commentHeader');

        if (headerDiv) {
            headerDiv.textContent = `💭 Comment Analysis (${analysisData.segments.length})`;
        }

        // Convert segments to comments and add helpfulness scores with validation
        const comments = analysisData.segments
            .filter(segment => segment && segment.quote) // Filter out invalid segments
            .map((segment, index) => {
                try {
                    const patterns = Array.isArray(segment.psychological_patterns) 
                        ? segment.psychological_patterns 
                        : [];
                    
                    // Calculate average score from patterns, fallback to segment score, then default
                    let avgScore = 5;
                    if (patterns.length > 0) {
                        const validScores = patterns
                            .filter(p => p && typeof p.helpfulness_score === 'number')
                            .map(p => p.helpfulness_score);
                        if (validScores.length > 0) {
                            avgScore = Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length);
                        }
                    } else if (typeof segment.helpfulness_score === 'number') {
                        avgScore = segment.helpfulness_score;
                    }

                    // Ensure attribution_analysis structure exists
                    const attribution = segment.attribution_analysis || {};
                    if (!attribution.dimensions) {
                        attribution.dimensions = {
                            locus: 'mixed',
                            stability: 'mixed',
                            controllability: 'mixed'
                        };
                    }

                    return {
                        ...segment,
                        comment_id: index + 1,
                        helpfulness_score: Math.max(1, Math.min(10, avgScore)), // Clamp between 1-10
                        patterns: patterns,
                        attribution_analysis: attribution
                    };
                } catch (error) {
                    console.error('Error processing segment:', error, segment);
                    return null;
                }
            })
            .filter(comment => comment !== null); // Remove any null comments

        if (comments.length === 0) {
            commentsListDiv.innerHTML = '<div class="status info">No valid comments found in the analysis.</div>';
            return;
        }

        try {
            const commentsHtml = comments.map(comment => createCommentCard(comment)).join('');
            commentsListDiv.innerHTML = commentsHtml;
            attachCommentListeners(comments);
        } catch (error) {
            console.error('Error creating comment cards:', error);
            commentsListDiv.innerHTML = '<div class="status error">Error rendering comments. Please check the console for details.</div>';
        }
    }

    function createCommentCard(comment) {
        const helpfulnessColor = getHelpfulnessColor(comment.helpfulness_score);
        const helpfulnessText = getHelpfulnessText(comment.helpfulness_score);
        const showEditButton = comment.helpfulness_score <= 6;
        const truncatedQuote = comment.quote.length > 60
            ? comment.quote.substring(0, 60) + '...'
            : comment.quote;

        // Attribution analysis
        const attribution = comment.attribution_analysis || {};
        const hasAttribution = attribution.has_attribution;
        const attributionBadge = hasAttribution ? `
            <div class="helpfulness-badge ${getAttributionColor(attribution.attribution_quality_score)}" style="margin-left: 8px;">
                🎯 ${attribution.attribution_quality_score}/10 Attribution
            </div>
        ` : '';

        const patternsHtml = comment.patterns.map(pattern => {
            const patternColor = getScoreColor(pattern.helpfulness_score);
            return `
                <div class="pattern-item" style="border-left-color: ${patternColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${pattern.type.replace(/_/g, ' ').toUpperCase()}</strong>
                        <span style="background: ${patternColor}; color: white; padding: 2px 6px; border-radius: 8px; font-size: 11px;">
                            ${pattern.helpfulness_score}/10
                        </span>
                    </div>
                    <p style="margin: 4px 0 0 0; font-size: 14px;">${pattern.explanation}</p>
                </div>
            `;
        }).join('');

        const attributionAnalysisHtml = hasAttribution ? `
            <div style="margin-bottom: 16px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px;">
                <h4 style="margin: 0 0 8px 0; color: #92400e; display: flex; align-items: center;">
                    🎯 Attribution Analysis
                    <span class="helpfulness-badge ${getAttributionColor(attribution.attribution_quality_score)}" style="margin-left: 8px; font-size: 11px;">
                        ${attribution.attribution_quality_score}/10 Quality
                    </span>
                </h4>
                <div style="background: white; border-radius: 4px; padding: 8px; margin-bottom: 8px;">
                    <strong>Causal Explanation:</strong> "${attribution.attribution_statement}"
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                    <div style="text-align: center; background: white; padding: 4px; border-radius: 4px;">
                        <div style="font-size: 11px; color: #6b7280;">LOCUS</div>
                        <div style="font-weight: bold; text-transform: capitalize;">${attribution.dimensions.locus}</div>
                    </div>
                    <div style="text-align: center; background: white; padding: 4px; border-radius: 4px;">
                        <div style="font-size: 11px; color: #6b7280;">STABILITY</div>
                        <div style="font-weight: bold; text-transform: capitalize;">${attribution.dimensions.stability}</div>
                    </div>
                    <div style="text-align: center; background: white; padding: 4px; border-radius: 4px;">
                        <div style="font-size: 11px; color: #6b7280;">CONTROL</div>
                        <div style="font-weight: bold; text-transform: capitalize;">${attribution.dimensions.controllability}</div>
                    </div>
                </div>
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                    <strong>Impact:</strong> ${attribution.attribution_explanation}
                </p>
            </div>
        ` : '';

        return `
            <div class="comment-card" data-comment-id="${comment.comment_id}">
                <div class="collapsed-view">
                    <div class="comment-header">
                        <span style="font-weight: 600;">Comment ${comment.comment_id}</span>
                        <div style="display: flex; align-items: center;">
                            <div class="helpfulness-badge ${helpfulnessColor}">
                                ${helpfulnessText}
                            </div>
                            ${attributionBadge}
                        </div>
                    </div>
                    ${comment.timestamp ? `<div style="font-size: 12px; color: #9ca3af; margin-bottom: 4px;">⏱️ ${comment.timestamp}</div>` : ''}
                    <div class="comment-quote">"${truncatedQuote}"</div>
                    <div class="expand-icon">▼ Click to expand</div>
                </div>
                
                <div class="expanded-view hidden">
                    <div style="margin-bottom: 16px;">
                        <h4 style="margin: 0 0 8px 0; color: #374151;">Original Quote:</h4>
                        <p style="font-style: italic; background: #f9fafb; padding: 12px; border-radius: 4px; margin: 0;">
                            "${comment.quote}"
                        </p>
                    </div>
                    
                    ${attributionAnalysisHtml}
                    
                    ${comment.patterns.length > 0 ? `
                        <div style="margin-bottom: 16px;">
                            <h4 style="margin: 0 0 8px 0; color: #374151;">Psychological Patterns:</h4>
                            ${patternsHtml}
                        </div>
                    ` : ''}
                    
                    ${showEditButton ? `
                        <div class="edit-section">
                            <h4 style="margin: 0 0 12px 0; color: #0369a1;">💡 Improve This Comment:</h4>
                            <div style="margin-bottom: 8px; font-size: 13px; color: #6b7280;">
                                ${hasAttribution ?
                    'Focus on improving both helpfulness and attribution quality. Make causal explanations more internal and controllable.' :
                    'Focus on making this comment more helpful for performance. Consider what the player should do next.'
                }
                            </div>
                            <textarea 
                                class="edit-input" 
                                data-comment-id="${comment.comment_id}"
                                maxlength="200" 
                                placeholder="Rewrite this comment to be more helpful...">${comment.quote}</textarea>
                            <div class="char-counter" data-comment-id="${comment.comment_id}">
                                ${comment.quote.length}/200 characters
                            </div>
                            <button class="btn-primary submit-improvement" data-comment-id="${comment.comment_id}" style="margin-top: 8px;">
                                Submit Improved Version
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function displaySummaryView(analysisData) {
        const summary = analysisData.analysis_summary || {};
        const resultDiv = document.getElementById('analysisResult');
        const commentsListDiv = document.getElementById('commentsList');

        // Ensure pattern_distribution exists
        const patternDist = summary.pattern_distribution || {};
        
        // Ensure arrays exist
        const keyInsights = Array.isArray(summary.key_insights) ? summary.key_insights : [];
        const dominantPatterns = Array.isArray(summary.dominant_patterns) ? summary.dominant_patterns : [];

        if (!resultDiv) {
            console.error('analysisResult element not found');
            return;
        }

        try {
            resultDiv.innerHTML = `
                <h3>📊 Psychological Profile Summary</h3>
                
                <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4>📈 Pattern Distribution</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <strong>Constructive Patterns:</strong><br>
                            • Positive Reinforcement: ${patternDist.positive_reinforcement || 0}<br>
                            • Emotional Regulation: ${patternDist.emotional_regulation || 0}<br>
                            • Tactical Focus: ${patternDist.tactical_focus || 0}<br>
                            • Forward Focus: ${patternDist.forward_focus || 0}<br>
                            • Energy Management: ${patternDist.energy_management || 0}
                        </div>
                        <div>
                            <strong>Challenging Patterns:</strong><br>
                            • Self Criticism: ${patternDist.self_criticism || 0}<br>
                            • Backward Focus: ${patternDist.backward_focus || 0}<br>
                            • Pattern Recognition: ${patternDist.pattern_recognition || 0}
                        </div>
                    </div>
                </div>

                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4>🎯 Key Metrics</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
                        <div>
                            <strong>${summary.helpful_thought_ratio || '0%'}</strong><br>
                            <small>Helpful Thought Ratio</small>
                        </div>
                        <div>
                            <strong>${summary.average_intensity || 'medium'}</strong><br>
                            <small>Language Intensity</small>
                        </div>
                        <div>
                            <strong>${summary.focus_direction_ratio || '0%'}</strong><br>
                            <small>Forward Focus Ratio</small>
                        </div>
                    </div>
                    ${summary.attribution_count !== undefined ? `
                    <div style="margin-top: 15px; text-align: center;">
                        <strong>Attributions Found:</strong> ${summary.attribution_count}
                        ${summary.average_attribution_quality ? ` | Average Quality: ${summary.average_attribution_quality}/10` : ''}
                    </div>
                    ` : ''}
                </div>

                <div style="background: #fff3cd; padding: 20px; border-radius: 8px;">
                    <h4>💡 Key Insights</h4>
                    ${keyInsights.length > 0 ? `
                        <ul>
                            ${keyInsights.map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    ` : '<p>No specific insights available</p>'}
                    <p><strong>Dominant Patterns:</strong> ${dominantPatterns.length > 0 ? dominantPatterns.join(', ') : 'None identified'}</p>
                </div>
            `;

            // Hide comments list when showing summary
            if (commentsListDiv) {
                commentsListDiv.innerHTML = '';
            }
        } catch (error) {
            console.error('Error displaying summary:', error);
            if (resultDiv) {
                resultDiv.innerHTML = '<div class="status error">Error displaying summary. Please check the console for details.</div>';
            }
        }
    }

    function attachCommentListeners(comments) {
        // Toggle comment expand/collapse
        document.querySelectorAll('.comment-card').forEach(card => {
            const collapsedView = card.querySelector('.collapsed-view');
            const expandedView = card.querySelector('.expanded-view');

            collapsedView.addEventListener('click', () => {
                expandedView.classList.toggle('hidden');
                const icon = collapsedView.querySelector('.expand-icon');
                icon.textContent = expandedView.classList.contains('hidden') ? '▼ Click to expand' : '▲ Click to collapse';
            });
        });

        // Character counter for edit inputs
        document.querySelectorAll('.edit-input').forEach(input => {
            const commentId = input.dataset.commentId;
            const counter = document.querySelector(`.char-counter[data-comment-id="${commentId}"]`);

            input.addEventListener('input', () => {
                const length = input.value.length;
                counter.textContent = `${length}/200 characters`;
                counter.style.color = length > 180 ? '#dc2626' : '#6b7280';
            });
        });

        // Submit improved comment
        document.querySelectorAll('.submit-improvement').forEach(button => {
            button.addEventListener('click', async () => {
                const commentId = button.dataset.commentId;
                const input = document.querySelector(`.edit-input[data-comment-id="${commentId}"]`);
                const originalComment = comments.find(c => c.comment_id == commentId);

                if (input.value.trim() === '') {
                    alert('Please enter an improved version of the comment.');
                    return;
                }

                await submitImprovedComment(originalComment.quote, input.value.trim(), originalComment);
            });
        });
    }

    async function submitImprovedComment(originalQuote, improvedQuote, context) {
        try {
            const response = await fetch('/api/score-reframe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_quote: originalQuote,
                    player_reframe: improvedQuote,
                    context: context.situation || 'tennis practice'
                })
            });

            const result = await response.json();
            displayReframeResults(result, context.comment_id);
        } catch (error) {
            console.error('Error submitting improved comment:', error);
            alert('Error submitting improved comment. Please try again.');
        }
    }

    function displayReframeResults(result, commentId) {
        const editSection = document.querySelector(`[data-comment-id="${commentId}"] .edit-section`);

        const attributionInfo = result.attribution_analysis.has_attribution ? `
            <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 4px; padding: 8px; margin-top: 8px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 4px;">
                    <strong style="color: #1e40af;">🎯 Attribution Quality:</strong>
                    <span class="helpfulness-badge ${getAttributionColor(result.attribution_analysis.attribution_quality_score)}" style="margin-left: 8px;">
                        ${result.attribution_analysis.attribution_quality_score}/10
                    </span>
                </div>
                <p style="margin: 0; font-size: 12px; color: #1e40af;">
                    ${result.attribution_analysis.dimensions.locus} • ${result.attribution_analysis.dimensions.controllability} • ${result.attribution_analysis.dimensions.stability}
                </p>
            </div>
        ` : '';

        editSection.innerHTML = `
            <h4 style="margin: 0 0 12px 0; color: #0369a1;">📊 Reframe Results:</h4>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong>💭 Helpfulness Score:</strong>
                    <span class="helpfulness-badge ${getHelpfulnessColor(result.helpfulness_score)}">
                        ${getHelpfulnessText(result.helpfulness_score)}
                    </span>
                </div>
                ${attributionInfo}
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #f3f4f6;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>🎯 Overall Score:</strong>
                        <span class="helpfulness-badge ${getHelpfulnessColor(result.overall_score)}" style="background: #6366f1; color: white;">
                            ${result.overall_score}/10 Combined
                        </span>
                    </div>
                </div>
                <p style="margin: 8px 0 0 0; font-size: 14px;">${result.feedback}</p>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn-primary apply-changes" data-comment-id="${commentId}" data-new-score="${result.overall_score}">Apply Changes</button>
                <button class="btn keep-original" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;" data-comment-id="${commentId}">Keep Original</button>
            </div>
        `;

        // Add event listeners to the new buttons
        const applyBtn = editSection.querySelector('.apply-changes');
        const keepBtn = editSection.querySelector('.keep-original');

        applyBtn.addEventListener('click', () => {
            applyReframeChanges(commentId, result.overall_score);
        });

        keepBtn.addEventListener('click', () => {
            cancelReframe(commentId);
        });
    }

    function applyReframeChanges(commentId, newScore) {
        // Update the comment card with new score
        const commentCard = document.querySelector(`[data-comment-id="${commentId}"]`);
        const helpfulnessBadge = commentCard.querySelector('.helpfulness-badge');
        const improvedQuote = commentCard.querySelector('.edit-input').value;

        // Update badge
        helpfulnessBadge.className = `helpfulness-badge ${getHelpfulnessColor(newScore)}`;
        helpfulnessBadge.textContent = getHelpfulnessText(newScore);

        // Update quote in both collapsed and expanded views
        const collapsedQuote = commentCard.querySelector('.comment-quote');
        const expandedQuote = commentCard.querySelector('.expanded-view p');

        const truncatedImproved = improvedQuote.length > 60
            ? improvedQuote.substring(0, 60) + '...'
            : improvedQuote;

        collapsedQuote.textContent = `"${truncatedImproved}"`;
        expandedQuote.textContent = `"${improvedQuote}"`;

        // Show success message
        const editSection = commentCard.querySelector('.edit-section');
        editSection.innerHTML = `
            <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 6px; padding: 12px; text-align: center;">
                <span style="color: #16a34a; font-weight: bold;">✅ Changes Applied Successfully!</span>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #166534;">
                    Score improved from previous to ${newScore}/10. Great work on the reframe!
                </p>
            </div>
        `;

        // Remove edit button if score is now above 6
        if (newScore > 6) {
            editSection.style.display = 'none';
        }
    }

    function cancelReframe(commentId) {
        const commentCard = document.querySelector(`[data-comment-id="${commentId}"]`);
        const editSection = commentCard.querySelector('.edit-section');
        const originalQuote = commentCard.querySelector('.expanded-view p').textContent.replace(/"/g, '');

        // Reset the text area to original
        const textArea = editSection.querySelector('.edit-input');
        textArea.value = originalQuote;

        // Hide the results and show edit interface again
        editSection.innerHTML = `
            <h4 style="margin: 0 0 12px 0; color: #0369a1;">💡 Improve This Comment:</h4>
            <textarea 
                class="edit-input" 
                data-comment-id="${commentId}"
                maxlength="200" 
                placeholder="Rewrite this comment to be more helpful...">${originalQuote}</textarea>
            <div class="char-counter" data-comment-id="${commentId}">
                ${originalQuote.length}/200 characters
            </div>
            <button class="btn-primary submit-improvement" data-comment-id="${commentId}" style="margin-top: 8px;">
                Submit Improved Version
            </button>
        `;

        // Re-attach listeners
        attachEditListeners(commentCard, commentId);
    }

    function attachEditListeners(commentCard, commentId) {
        const input = commentCard.querySelector('.edit-input');
        const counter = commentCard.querySelector('.char-counter');
        const submitBtn = commentCard.querySelector('.submit-improvement');

        input.addEventListener('input', () => {
            const length = input.value.length;
            counter.textContent = `${length}/200 characters`;
            counter.style.color = length > 180 ? '#dc2626' : '#6b7280';
        });

        submitBtn.addEventListener('click', async () => {
            if (input.value.trim() === '') {
                alert('Please enter an improved version of the comment.');
                return;
            }

            const originalComment = currentAnalysisData.segments.find(s => s.segment_id == commentId);
            await submitImprovedComment(originalComment.quote, input.value.trim(), originalComment);
        });
    }

    function getHelpfulnessColor(score) {
        if (score >= 8) return 'bg-green-100';
        if (score >= 5) return 'bg-yellow-100';
        return 'bg-red-100';
    }

    function getHelpfulnessText(score) {
        if (score >= 8) return `✅ ${score}/10 Helpful`;
        if (score >= 5) return `⚠️ ${score}/10 Moderate`;
        return `❌ ${score}/10 Needs Work`;
    }



    function getScoreColor(score) {
        if (score >= 8) return '#4CAF50'; // Green for helpful
        if (score >= 5) return '#FF9800'; // Orange for neutral/mixed
        return '#F44336'; // Red for unhelpful
    }

    function getIntensityIcon(intensity) {
        switch (intensity) {
            case 'high': return '🔥';
            case 'medium': return '💬';
            case 'low': return '💭';
            default: return '��';
        }
    }

    function getAttributionColor(score) {
        if (score >= 8) return 'bg-blue-100';
        if (score >= 5) return 'bg-yellow-100';
        return 'bg-red-100';
    }
});

function showTranscriptionStatus(message, type) {
    const statusDiv = document.getElementById('transcriptionStatus');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;

    // Clear status after 10 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 10000);
    }
}

function clearTranscriptionResult() {
    const resultDiv = document.getElementById('transcriptionResult');
    resultDiv.innerHTML = '';
}

function displayTranscriptionResult(data, fileInfo) {
    const resultDiv = document.getElementById('transcriptionResult');

    if (!data) {
        resultDiv.innerHTML = '<div class="status error">No transcription data received</div>';
        return;
    }

    const { text, language, duration, statistics, segments, words } = data;

    let html = '<div class="transcription-result">';

    // File info
    html += `<h3>📁 File: ${fileInfo.original_name}</h3>`;

    // Statistics
    if (statistics) {
        html += '<div class="transcription-stats">';
        html += `<div class="stat-item"><strong>Duration:</strong><br>${statistics.duration_seconds ? Math.round(statistics.duration_seconds) + 's' : 'Unknown'}</div>`;
        html += `<div class="stat-item"><strong>Language:</strong><br>${statistics.language || 'Unknown'}</div>`;
        html += `<div class="stat-item"><strong>Words:</strong><br>${statistics.word_count || 0}</div>`;
        html += `<div class="stat-item"><strong>Characters:</strong><br>${statistics.character_count || 0}</div>`;
        html += `<div class="stat-item"><strong>Segments:</strong><br>${statistics.segments_count || 0}</div>`;
        html += '</div>';
    }

    // Full transcription text
    html += '<h4>📝 Full Transcription:</h4>';
    html += `<div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #ddd; white-space: pre-wrap;">${text || 'No transcription available'}</div>`;

    // Segments with timestamps
    if (segments && segments.length > 0) {
        html += '<h4>⏱️ Timestamps:</h4>';
        html += '<div style="max-height: 200px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 5px;">';
        segments.forEach((segment, index) => {
            const startTime = formatTime(segment.start);
            const endTime = formatTime(segment.end);
            html += `<div style="padding: 8px; border-bottom: 1px solid #eee;">
                        <strong>[${startTime} - ${endTime}]</strong><br>
                        ${segment.text}
                     </div>`;
        });
        html += '</div>';
    }

    // Word-level timestamps (if available)
    if (words && words.length > 0) {
        html += `<h4>🔤 Word Timestamps (${words.length} words):</h4>`;
        html += '<div style="max-height: 150px; overflow-y: auto; background: white; border: 1px solid #ddd; border-radius: 5px; padding: 10px;">';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 5px;">';
        words.forEach(word => {
            const startTime = formatTime(word.start);
            const confidence = word.confidence ? ` (${Math.round(word.confidence * 100)}%)` : '';
            html += `<span style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 12px;" title="Start: ${startTime}${confidence}">
                        ${word.word}
                     </span>`;
        });
        html += '</div></div>';
    }

    html += '</div>';

    resultDiv.innerHTML = html;
}

function formatTime(seconds) {
    if (!seconds) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 
