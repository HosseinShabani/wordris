import { decorate, observable, action, computed } from 'mobx';
import * as wordsSets from '../wordsSets.json';

import {
  createBoard,
  clearBoard,
  toggleGamePause
} from '../routes/game/board/board';
import {
  MAIN_POINT,
  SUB_POINT,
  EARTHQUAKES_COUNT
} from '../constants/gameConstants';
import GameoverMenu from '../routes/game/components/gameoverMenu/GameoverMenu';
import { scoresStore } from './scoresStore';
import { formatTime, getRandomItem } from '../utils';
import socket from '../socket';
import { backgroundMusic } from '../music';

let isBackgroundPlayedYet = false;

class Word {
  text = '';
  count = 0;
  isMain = false;
  constructor({ text, count, isMain }) {
    this.text = text;
    this.count = count;
    this.isMain = !!isMain;
  }
}
decorate(Word, { text: observable, count: observable, isMain: observable });

class GameStore {
  nextLetter = {};
  stars = 0;
  opponentStars = 0;
  timer = null;
  time = 0;
  earthquakesLeft = EARTHQUAKES_COUNT;
  isMultiplayer = false;
  isOpponentGameovered = false;
  isMusicPlaying = false;
  words = [];
  isInGame = false;

  resetValues() {
    clearBoard();
    this.earthquakesLeft = EARTHQUAKES_COUNT;
    this.words = getRandomItem(wordsSets.sets).map(({ text, isMain }) => {
      return new Word({ text, isMain, count: 0 });
    });
    this.nextLetter = {};
    this.stars = 0;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.time = 0;
    this.opponentStars = 0;
    this.isInGame = false;
    this.isOpponentGameovered = false;
  }

  initialize() {
    this.resetValues();
    const words = this.words.map(w => w.text);
    createBoard(words);
    this.timer = setInterval(this.increaseTime, 1000);
  }

  changeGameStatus() {
    this.isInGame = true;
  }

  increaseTime() {
    this.time++;
  }

  updateNextLetter(letter) {
    this.nextLetter = letter;
  }

  addToStars(increment) {
    this.stars += increment;
    if (this.isMultiplayer) this.sendDetails(false);
  }

  updateOpponentStatus({ stars, isGameovered }) {
    if (isGameovered) {
      this.pauseGame();
      scoresStore.saveNewScore({
        stars: this.stars,
        duration: this.time,
        isMultiplayer: true,
        opponentStars: this.opponentStars,
        isOpponentGameovered: isGameovered
      });
      GameoverMenu.open();
    }
    this.isOpponentGameovered = isGameovered;
    this.opponentStars = stars;
  }

  handleWordsMatch(matchedWords) {
    let sum = 0;
    matchedWords.forEach(matchedWord => {
      const foundWord = this.words.find(word => word.text === matchedWord);
      const point = foundWord.isMain ? MAIN_POINT : SUB_POINT;
      foundWord.count++;
      sum += point;
    });
    this.addToStars(sum);
  }

  pauseGame() {
    clearInterval(this.timer);
    toggleGamePause(true);
  }

  resumeGame() {
    this.timer = setInterval(this.increaseTime, 1000);
    toggleGamePause(false);
  }

  toggleBackgroundMusic() {
    // first play check
    if (!isBackgroundPlayedYet) {
      isBackgroundPlayedYet = true;
      backgroundMusic.volume = 0.08;
      backgroundMusic.loop = true;
      backgroundMusic.play();
    } else {
      backgroundMusic.muted = !backgroundMusic.muted;
    }
    this.isMusicPlaying = !this.isMusicPlaying;
  }

  // Gameover functions
  retry() {
    clearBoard();
    GameoverMenu.close();
    this.initialize();
  }

  handleGameover() {
    this.isInGame = false;
    clearInterval(this.timer);
    scoresStore.saveNewScore({
      stars: this.stars,
      duration: this.time,
      isMultiplayer: this.isMultiplayer,
      opponentStars: this.opponentStars,
      isOpponentGameovered: false
    });
    if (this.isMultiplayer) this.sendDetails(true);
    GameoverMenu.open();
  }

  sendDetails(isGameovered) {
    socket.emit('details:set', {
      isGameovered,
      stars: this.stars
    });
  }

  // Powerups
  decreaseEarthquake() {
    this.earthquakesLeft--;
  }

  get formattedTime() {
    return formatTime(this.time);
  }

  get gameoverText() {
    if (!this.isMultiplayer) return 'رسیدی به سقف!';
    if (this.isOpponentGameovered) return 'برنده شدی :)';
    return 'بازنده شدی :(';
  }
}

decorate(GameStore, {
  nextLetter: observable,
  stars: observable,
  time: observable,
  timer: observable,
  earthquakesLeft: observable,
  words: observable,
  isMultiplayer: observable,
  opponentStars: observable,
  isOpponentGameovered: observable,
  isMusicPlaying: observable,
  isInGame: observable,

  initialize: action.bound,
  updateNextLetter: action.bound,
  handleWordsMatch: action.bound,
  addToStars: action.bound,
  increaseTime: action.bound,
  handleGameover: action.bound,
  decreaseEarthquake: action.bound,
  resetValues: action.bound,
  retry: action.bound,
  pauseGame: action.bound,
  resumeGame: action.bound,
  sendDetails: action.bound,
  updateOpponentStatus: action.bound,
  toggleBackgroundMusic: action.bound,
  changeGameStatus: action.bound,

  formattedTime: computed,
  gameoverText: computed
});

const gameStore = new GameStore();

export { gameStore };
