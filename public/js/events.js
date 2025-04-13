export function newEvent() {
    return {};
}

export function subscribe(event, name, callback) {
    if (!event[name]) event[name] = [];

    event[name].push(callback);
}

export function emit(event, name, ...args) {
    if (!event[name]) return;

    for (let callback of event[name]) {
        callback(...args);
    }
}