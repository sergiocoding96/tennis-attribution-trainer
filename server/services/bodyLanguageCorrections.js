/**
 * Human-in-the-loop: store body language segment corrections for tuning or training.
 * Uses a JSON file so it works without Supabase. Optional: user_id when authenticated.
 */
const path = require('path');
const fs = require('fs-extra');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'body_language_corrections.json');

async function ensureFile() {
    await fs.ensureDir(DATA_DIR);
    const exists = await fs.pathExists(FILE_PATH);
    if (!exists) {
        await fs.writeJson(FILE_PATH, { corrections: [] }, { spaces: 2 });
    }
}

/**
 * Append a single correction. Payload: { window_index, timestamp_start, timestamp_end, original_valence, original_emotion, corrected_valence, corrected_emotion, user_id? }
 */
async function saveCorrection(payload) {
    await ensureFile();
    const data = await fs.readJson(FILE_PATH);
    const record = {
        ...payload,
        created_at: new Date().toISOString(),
    };
    data.corrections.push(record);
    await fs.writeJson(FILE_PATH, data, { spaces: 2 });
    return record;
}

/**
 * Get recent corrections (e.g. for export or display). Optional limit.
 */
async function getCorrections(limit = 500) {
    await ensureFile();
    const data = await fs.readJson(FILE_PATH);
    const list = data.corrections || [];
    return list.slice(-limit);
}

module.exports = {
    saveCorrection,
    getCorrections,
};
