const divStoryOverviewList = document.getElementsByClassName('div-story-overview');

const btnOverviewTabStory = document.getElementById('btn-overview-tab-story') as HTMLButtonElement;
const btnOverviewTabLlm = document.getElementById('btn-overview-tab-llm') as HTMLButtonElement;

function disableAllButOne(excludedId: string) {
    for (const divStoryOverview of divStoryOverviewList) {
        if (divStoryOverview.id !== excludedId) {
            divStoryOverview.classList.add('gr-hidden');
        } else if (divStoryOverview.classList.contains('gr-hidden')) {
            divStoryOverview.classList.remove('gr-hidden');
        }
    }
}

export function init() {
    btnOverviewTabStory.addEventListener('click', () => disableAllButOne('div-story-overview-stats'));
    btnOverviewTabLlm.addEventListener('click', () => disableAllButOne('div-story-overview-llm-settings'));
}