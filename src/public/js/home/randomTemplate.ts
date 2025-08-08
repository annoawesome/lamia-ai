import words from "./exampleWords.json";

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

function selectRandomly(arr: string[]) {
  return arr[randomInt(0, arr.length)];
}

function selectRandomlyWithoutReplacement(arr: string[]) {
  const selectedIndex = randomInt(0, arr.length);
  const value = arr[selectedIndex];
  arr.splice(selectedIndex, 1);
  
  return value;
}

const templates = ['The {adjective} {noun}', '{noun} and {noun}', 'The {noun} Chronicles', 'The {noun} of {proper_place}'];

function fillTemplate(template: string, placeholder: string, words: string[]) {
  const regex = new RegExp('\\{' + placeholder + '\\}', 'g');

  return template.replaceAll(regex, () => {
    return selectRandomly(words);
  });
}

export function randomlyGenerateTitle() {
  let title = selectRandomly(templates);

  title = fillTemplate(title, 'adjective', words.adjective);
  title = fillTemplate(title, 'noun', words.noun);
  title = fillTemplate(title, 'proper_place', words.proper_place);

  return title;
}

export function randomlyGenerateTags() {
  const genres = Array.from(words.genres);
  const tags: string[] = [];

  tags.push('fiction');
  
  for (let i = 0; i < randomInt(3, 4); i++) {
    tags.push(selectRandomlyWithoutReplacement(genres));
  }

  tags.push(selectRandomly(words.pov));
  tags.push(selectRandomly(words.descriptors));

  return tags;
}