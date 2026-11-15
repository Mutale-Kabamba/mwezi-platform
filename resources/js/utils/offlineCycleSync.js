const STORAGE_KEY = 'mwezi_offline_cycle_logs';

/**
 * Retrieve queued offline cycle logs from localStorage.
 * @returns {Array<Object>}
 */
export function getQueuedCycleLogs() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Queue a cycle log payload locally when offline or when a request fails due to connectivity.
 * Deduplicates by log_date so the latest offline edit for a date wins.
 * @param {Object} payload
 * @returns {Array<Object>} Updated queue
 */
export function queueCycleLog(payload) {
    const keyDate = payload.logged_date || payload.log_date;
    const existing = getQueuedCycleLogs().filter((item) => (item.logged_date || item.log_date) !== keyDate);
    const updated = [
        ...existing,
        {
            ...payload,
            queued_at: new Date().toISOString(),
        },
    ];

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
        // Ignore storage quota errors gracefully
    }

    return updated;
}

/**
 * Flush queued cycle logs to the server via JSON POST to /cycle/logs.
 * Keeps any items that still fail so they can be retried later.
 * @param {string} postUrl
 * @returns {Promise<{synced: number, remaining: number}>}
 */
export async function syncQueuedCycleLogs(postUrl = '/cycle/log') {
    const queue = getQueuedCycleLogs();
    if (queue.length === 0) {
        return { synced: 0, remaining: 0 };
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const remaining = [];
    let synced = 0;

    for (const entry of queue) {
        try {
            const { queued_at, ...payload } = entry;
            const response = await fetch(postUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                synced += 1;
            } else {
                remaining.push(entry);
            }
        } catch {
            remaining.push(entry);
        }
    }

    try {
        if (remaining.length === 0) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
        }
    } catch {
        // Ignore storage errors
    }

    return { synced, remaining: remaining.length };
}
