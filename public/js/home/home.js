import { subscribe } from "../events.js";
import * as homeView from "./homeView.js";
import * as homeController from "./homeController.js";

subscribe(homeView.indexInput, 'update', (storyName, storyId) => {
    homeController.updateStoryIndex(storyName, storyId);
});

subscribe(homeView.storyInput, 'create', () => {
    homeController.createNewStory();
});

subscribe(homeView.storyInput, 'load', (storyId) => {
    homeController.loadStory(storyId);
});

subscribe(homeView.storyInput, 'save', (storyId, storyName, storyContent) => {
    homeController.updateStoryLastSeenText(storyContent);
    homeController.saveStory(storyId, storyName, storyContent);
});

subscribe(homeView.indexInput, 'get', () => {
    homeController.getStoryIndex();
});

subscribe(homeView.storyInput, 'delete', storyId => {
    homeController.deleteStory(storyId);
});

subscribe(homeView.llmInput, 'generate', (text, url) => {
    homeController.generateStory(text, url);
});


subscribe(homeController.indexOutput, 'get', obtainedIndex => {
    homeView.onGetStoryIndex(obtainedIndex);
});

subscribe(homeController.storyOutput, 'create', (storyObject, storyId) => {
    homeView.onCreateNewStory(storyObject, storyId);
});

subscribe(homeController.storyOutput, 'load', storyObject => {
    homeView.onLoadStory(storyObject);
});

subscribe(homeController.storyOutput, 'delete', storyId => {
    homeView.onDelete(storyId);
});

subscribe(homeController.llmOutput, 'generate', text => {
    homeView.onGenerateStory(text);
});

homeView.init();