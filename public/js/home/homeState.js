import { emit, newEvent, subscribe } from "../events.js";

export function generateHomeState() {
    const events = {
        currentId: newEvent(),
        lastSeenText: newEvent(),
        index: newEvent(),
    };
    
    return {
        lastSeenText: '',
        currentId: '',
        index: {},
        events: events
    };
}

/**
 * @param {HomeState} homeState Home state.
 * @returns {string}
 */
export function getCurrentId(homeState) {
    return homeState.currentId;
}

/**
 * Get last seen text of home state.
 * @param {HomeState} homeState Home state.
 * @returns {string}
 */
export function getLastSeenText(homeState) {
    return homeState.lastSeenText;
}

/**
 * Get story index of home state.
 * @param {HomeState} homeState Home state.
 * @returns {Object}
 */
export function getHomeIndex(homeState) {
    return homeState.index;
}

/**
 * Overwrite home story index. Emits a changed event
 * @param {HomeState} homeState Home state.
 * @param {Object} index Story index.
 */
export function setHomeIndex(homeState, index) {
    homeState.index = index;
    emit(homeState.events.index, 'changed', index);
}
/**
 * Put story into index in home state. Emits a storyPut event
 * @param {HomeState} homeState Home state.
 * @param {string} storyName Title of story.
 * @param {string} storyId Id of story.
 */
export function putStoryInIndex(homeState, storyName, storyId) {
    homeState.index.stories[storyId] = {
        storyName: storyName,
    };

    emit(homeState.events.index, 'storyPut', storyId);
}

/**
 * Removes story id from index in home state. Emits a storyRemove event
 * @param {HomeState} homeState Home state.
 * @param {string} storyId Id of story.
 */
export function removeStoryInIndex(homeState, storyId) {
    delete homeState.index.stories[storyId];

    emit(homeState.events.index, 'storyRemove', storyId);
}

/**
 * Update current story id in home state. Emits a changed event
 * @param {HomeState} homeState Home state.
 * @param {string} currentId Id of currently selected story.
 */
export function setCurrentId(homeState, currentId) {
    homeState.currentId = currentId;
    emit(homeState.events.currentId, 'changed', currentId);
}

/**
 * Set the last seen text of home state. Emits a changed event
 * @param {HomeState} homeState Home state.
 * @param {string} lastSeenText Last seen text.
 */
export function setLastSeenText(homeState, lastSeenText) {
    homeState.lastSeenText = lastSeenText;
    emit(homeState.events.lastSeenText, 'changed', lastSeenText);
}

/**
 * Subscribe to an event in home state.
 * @param {string} eventName Name of event.
 * @param {string} category Name of category of event.
 * @param {function(...any): void} callback Callback.
 */
export function subscribeToEvent(homeState, eventName, category, callback) {
    subscribe(homeState.events[eventName], category, callback);
}