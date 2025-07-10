import {reversePatch, structuredPatch, StructuredPatch, applyPatch} from 'diff';

export const storyObjectVersion = '0.2.0';

export type StoryObject = {
    metadata: {
        version: string;
    };
    title: string;
    content: string;
    history: {
        patches: StructuredPatch[];
        pointer: 0; 
    };
    overview: {
        description: string;
        tags: string[];
    };
};

export function generateStoryObject(storyVersion: string, storyTitle: string, storyContent: string, storyDesc: string, storyTags: string[]): StoryObject {
    return {
        metadata: {
            version: storyVersion,
        },

        title: storyTitle,
        content: storyContent,
        history: {
            patches: [],
            pointer: 0,
        },
        overview: {
            description: storyDesc,
            tags: storyTags,
        },
    };
}

export function generateEmptyStoryObject() {
    return generateStoryObject(storyObjectVersion, '', '', '', []);
}

/**
 * Convert story 0.1.0 to 0.2.0
 * @param {StoryObject} storyObject JSON representation of story
 * @returns {StoryObject}
 */
export function convertStoryObject(storyObject: StoryObject) {
    if (storyObject.metadata.version !== '0.1.0') {
        return storyObject;
    }

    storyObject.metadata.version = '0.2.0';

    storyObject.overview = {
        description: '',
        tags: [],
    };

    return storyObject;
}

/**
 * Saves basic fields of story object onto base.
 * @param base 
 * @param updated 
 */
export function syncStoryObject(base: StoryObject, updated: StoryObject) {
    base.content = updated.content;
    base.metadata = updated.metadata;
    base.overview = updated.overview;
    base.title = updated.title;
}

/**
 * Pushes changes into story object. Does not modify text, only store patches for future use
 * @param storyObject 
 * @param oldText 
 * @param newText 
 * @returns 
 */
export function generateDifference(storyObject: StoryObject | null, oldText: string, newText: string) {
    // File name is not important, does not generate file on its own
    const patch = structuredPatch('story.txt', 'story.txt', oldText, newText);
    storyObject?.history.patches.push(patch);

    return patch;
}

/**
 * Reverts changes in story object. Modifies text and changes pointer
 * @param storyContent 
 * @returns success
 */
export function undoStoryContent(storyObject: StoryObject) {
    const storyHistory = storyObject.history;

    if (storyHistory.pointer >= storyHistory.patches.length) {
        return false;
    }

    const index = storyHistory.patches.length - 1 - storyHistory.pointer;
    storyHistory.pointer++;

    const reversedPatch = reversePatch(storyHistory.patches[index]);
    const undoneContent = applyPatch(storyObject.content, reversedPatch);

    if (undoneContent) {
        console.log(`Now pointer: ${storyHistory.pointer}, total size: ${storyHistory.patches.length}`);
        console.log(`Content undone. Original was ${storyObject.content}, new is ${undoneContent}`);
        storyObject.content = undoneContent;
    }

    return !!undoneContent;
}

/**
 * Reapply changes in story object. Modifies text and changes pointer
 * @param storyContent 
 * @returns success
 */
export function redoStoryContent(storyObject: StoryObject) {
    const storyHistory = storyObject.history;

    if (storyHistory.pointer === 0) {
        return false;
    }

    storyHistory.pointer--;

    const index = storyHistory.patches.length - 1 - storyHistory.pointer;
    const redoneContent = applyPatch(storyObject.content, storyHistory.patches[index]);

    if (redoneContent) {
        storyObject.content = redoneContent;
    }

    return !!redoneContent;
}

export function redoAllStoryContent(storyObject: StoryObject) {
    while (redoStoryContent(storyObject)) { /* empty */ }
}