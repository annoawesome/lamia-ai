/**
 * @typedef {Object} StatedEvent
 */

/**
 * Creates an empty event
 * @returns {StatedEvent}
 */
export function newEvent() {
    return {};
}

/**
 * Subscribe to an event category
 * @param {StatedEvent} event A stated event
 * @param {string} name Name of event category
 * @param {function(...any): void} callback Callback
 */
export function subscribe(event, name, callback) {
    if (!event[name]) event[name] = [];

    event[name].push(callback);
}

/**
 * Emit an event
 * @param {StatedEvent} event A stated event
 * @param {string} name Name of event category
 * @param  {...any} args Arguments to give to callbacks
 * @returns {void}
 */
export function emit(event, name, ...args) {
    if (!event[name]) return;

    for (let callback of event[name]) {
        callback(...args);
    }
}