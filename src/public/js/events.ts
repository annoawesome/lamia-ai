type StatedEvent = { [x: string]: any; };

/**
 * Creates an empty event
 * @returns {StatedEvent}
 */
export function newEvent(): StatedEvent {
    return {};
}

/**
 * Subscribe to an event category
 * @param {StatedEvent} event A stated event
 * @param {string} name Name of event category
 * @param {function(...any): void} callback Callback
 */
export function subscribe(event: StatedEvent, name: string, callback: (...arg0: any[]) => void) {
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
export function emit(event: StatedEvent, name: string, ...args: any[]) {
    if (!event[name]) return;

    for (let callback of event[name]) {
        try {
            callback(...args);
        } catch (error) {
            if (error instanceof Error || typeof(error) === 'string') {
                console.log(`Error in event category ${name}: ${error.toString()}`);
            }
        }
    }
}