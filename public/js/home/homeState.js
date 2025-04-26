import { emit, newEvent, subscribe } from "../events.js";

class ReactiveVariable {
    name;
    value;
    event = newEvent();

    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    get() {
        return this.value;
    }

    set(value) {
        this.value = value;
        emit(this.event, 'update', value);
    }

    onUpdate(callback) {
        subscribe(this.event, 'update', callback);
    }
}

/**
 * @typedef HomeState
 * @property {ReactiveVariable} lastSeenText
 * @property {ReactiveVariable} currentId
 * @property {ReactiveVariable} index
 */

export function generateHomeState() {
    return {
        lastSeenText: new ReactiveVariable('lastSeenText', ''),
        currentId: new ReactiveVariable('currentId', ''),
        index: new ReactiveVariable('index', {}),
    };
}

/**
 * Put story into index in home state.
 * @param {HomeState} homeState Home state.
 * @param {string} storyName Title of story.
 * @param {string} storyId Id of story.
 */
export function putStoryInIndex(homeState, storyName, storyId) {
    const index = homeState.index.get();

    index.stories[storyId] = {
        storyName: storyName,
    };

    homeState.index.set(index);
}

/**
 * Removes story id from index in home state.
 * @param {HomeState} homeState Home state.
 * @param {string} storyId Id of story.
 */
export function removeStoryInIndex(homeState, storyId) {
    const index = homeState.index.get();

    delete index.stories[storyId];

    homeState.index.set(index);
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