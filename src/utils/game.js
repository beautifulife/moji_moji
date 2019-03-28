import { shuffle } from 'lodash';

import {
  EMOJIS_LVL_1,
  EMOJIS_LVL_2,
  EMOJIS_LVL_3,
  EMOJIS_LVL_4,
  EMOJIS_LVL_5,
  EMOJIS_LVL_DEMO
} from './game_levels';

const emojiLvl1 = shuffle(EMOJIS_LVL_1);
const emojiLvl2 = shuffle(EMOJIS_LVL_2);
const emojiLvl3 = shuffle(EMOJIS_LVL_3);
const emojiLvl4 = shuffle(EMOJIS_LVL_4);
const emojiLvl5 = shuffle(EMOJIS_LVL_5);
const emojiLvlDemo = Array.from(EMOJIS_LVL_DEMO);

export const emojiLvlLookup = {
  1: emojiLvl1,
  2: emojiLvl2,
  3: emojiLvl3,
  4: emojiLvl4,
  5: emojiLvl5,
  '#': emojiLvlDemo
};

export function reShuffleLevelEmojis(level) {
  switch (level) {
  case '1':
    emojiLvlLookup[level] = shuffle(EMOJIS_LVL_1);
    break;
  case '2':
    emojiLvlLookup[level] = shuffle(EMOJIS_LVL_2);
    break;
  case '3':
    emojiLvlLookup[level] = shuffle(EMOJIS_LVL_3);
    break;
  case '4':
    emojiLvlLookup[level] = shuffle(EMOJIS_LVL_4);
    break;
  case '5':
    emojiLvlLookup[level] = shuffle(EMOJIS_LVL_5);
    break;
  case '#':
    // NOTE: the Demo list is not shuffled since we always request them in
    // same order for demo purposes.
    emojiLvlLookup[level] = Array.from(EMOJIS_LVL_DEMO);
    break;
  default:
    throw new Error(
      `Error: expected ${level} level string in the level EmojiLevelsLookup`
    );
  }
}
