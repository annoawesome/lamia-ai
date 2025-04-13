import { emit, newEvent, subscribe } from "./events.js";

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

export function getCurrentId(homeState) {
    return homeState.currentId;
}

export function getLastSeenText(homeState) {
    return homeState.lastSeenText;
}

export function getHomeIndex(homeState) {
    return homeState.index;
}

export function setHomeIndex(homeState, index) {
    homeState.index = index;
    emit(homeState.events.index, 'changed', index);
}

export function putStoryInIndex(homeState, storyName, storyId) {
    homeState.index.stories[storyId] = {
        storyName: storyName,
    };

    emit(homeState.events.index, 'storyPut', storyId);
}

export function removeStoryInIndex(homeState, storyId) {
    delete homeState.index.stories[storyId];

    emit(homeState.events.index, 'storyRemove', storyId);
}

export function setCurrentId(homeState, currentId) {
    homeState.currentId = currentId;
    emit(homeState.events.currentId, 'changed', currentId);
}

export function setLastSeenText(homeState, lastSeenText) {
    homeState.lastSeenText = lastSeenText;
    emit(homeState.events.lastSeenText, 'changed', lastSeenText);
}

/**
 * Subscribe to an event in home state
 * @param {string} eventName Name of event
 * @param {string} category Name of category of event
 * @param {function(...any): void} callback Callback
 */
export function subscribeToEvent(homeState, eventName, category, callback) {
    subscribe(homeState.events[eventName], category, callback);
}