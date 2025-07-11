import { emit, newEvent, subscribe } from "../events.js";
import { generateEmptyStoryObject, StoryObject } from "./storyObject.js";

export type StoryIndex = { 
    stories: { [storyId: string]: {
        storyName: string
    }; }
};

export type HomeState = {
    lastSeenText: ReactiveVariable<string>;
    currentId: ReactiveVariable<string>;
    index: ReactiveVariable<StoryIndex | object>;

    // may be easier to keep a global story object for further use
    // at this point... we don't constantly generate
    // but we need to constantly synchronize?
    currentStoryObject: StoryObject | null;
};

class ReactiveVariable<T> {
    name;
    value;
    event = newEvent();

    constructor(name: string, value: T) {
        this.name = name;
        this.value = value;
    }

    get() {
        return this.value;
    }

    set(value: T) {
        this.value = value;
        emit(this.event, 'update', value);
    }

    onUpdate(callback: () => void) {
        subscribe(this.event, 'update', callback);
    }
}

/**
 * @typedef HomeState
 * @property {ReactiveVariable} lastSeenText
 * @property {ReactiveVariable} currentId
 * @property {ReactiveVariable} index
 */

export function generateHomeState(): HomeState {
    return {
        lastSeenText: new ReactiveVariable('lastSeenText', ''),
        currentId: new ReactiveVariable('currentId', ''),
        index: new ReactiveVariable('index', {}),
        currentStoryObject: generateEmptyStoryObject(),
    };
}

/**
 * Put story into index in home state.
 * @param {HomeState} homeState Home state.
 * @param {string} storyName Title of story.
 * @param {string} storyId Id of story.
 */
export function putStoryInIndex(homeState: HomeState, storyName: string, storyId: string) {
    const index = homeState.index.get();

    if (!('stories' in index)) {
        return;
    }

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
export function removeStoryInIndex(homeState: HomeState, storyId: string) {
    const index = homeState.index.get();

    if (!('stories' in index)) {
        return;
    }

    delete index.stories[storyId];

    homeState.index.set(index);
}