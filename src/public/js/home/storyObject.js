export const storyObjectVersion = '0.2.0';

export function generateStoryObject(storyVersion, storyTitle, storyContent, storyDesc, storyTags) {
    return {
        metadata: {
            version: storyVersion,
        },

        title: storyTitle,
        content: storyContent,
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
export function convertStoryObject(storyObject) {
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