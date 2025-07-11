import '../../css/style.css';
import '../../css/home.css';

import { subscribe } from "../events.js";
import * as homeView from "./homeView.js";
import * as homeController from "./homeController.js";
import * as storyOverviewTabsView from "./storyOverviewTabsView.js";
import * as storyOverviewLlm from "./storyOverviewLlm.js";
import * as storyOverviewExport from "./storyOverviewExport.js";
import * as llmSelector from "./llmSelector.js";
import { StoryObject } from './storyObject.js';

subscribe(homeView.indexInput, 'update', (storyName, storyId) => {
    homeController.updateStoryIndex(storyName, storyId);
});

subscribe(homeView.storyInput, 'create', () => {
    homeController.createNewStory();
});

subscribe(homeView.storyInput, 'load', (storyId) => {
    homeController.loadStory(storyId);
});

subscribe(homeView.storyInput, 'save', (storyObjectSnapshot: StoryObject, storyId: string) => {
    homeController.saveStory(storyObjectSnapshot, storyId);
});

subscribe(homeView.indexInput, 'get', () => {
    homeController.getStoryIndex();
});

subscribe(homeView.storyInput, 'delete', storyId => {
    homeController.deleteStory(storyId);
});

subscribe(homeView.llmInput, 'setEndpoint', (uri: string) => {
    homeController.setLlmUri(uri);
});

subscribe(homeView.llmInput, 'generate', (text, url) => {
    homeController.generateStory(text, url);
});

subscribe(homeView.storyInput, 'history:undo', () => {
    homeController.performUndo();
});

subscribe(homeView.storyInput, 'history:redo', () => {
    homeController.performRedo();
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

subscribe(homeController.llmOutput, 'generate.stream', (text) => {
    homeView.onSseStreamedGenerateStory(text);
});

subscribe(homeController.llmOutput, 'generate.stream:done', () => {
    homeView.onSseStreamFinish();
});

subscribe(homeController.llmOutput, 'modelName', (modelName: string) => {
    homeView.setModelName(modelName);
});

subscribe(homeController.storyOutput, 'history:undo', (content: string) => {
    homeView.onRequestUpdateText(content);
});

subscribe(homeController.storyOutput, 'history:redo', (content: string) => {
    homeView.onRequestUpdateText(content);
});

homeView.init();
storyOverviewTabsView.init();
storyOverviewLlm.init();
llmSelector.init();
storyOverviewExport.init();