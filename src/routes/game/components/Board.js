import { h, Component } from 'preact';
import { inject, observer } from 'mobx-preact';

import { createBoard } from '../../../api/board/board';
import {
  ROWS_COUNT,
  COLUMNS_COUNT,
  PADDING
} from '../../../constants/boardConstants.js';

import styles from '../Game.css';

class Board extends Component {
  componentDidMount() {
    const words = this.props.gameStore.words.map(w => w.text);
    createBoard(words);
  }

  render() {
    const { gameStore } = this.props;
    const widthRem = 45;
    return (
      <div class={styles.board}>
        <div
          class={styles.board__nextLetter}
          style={{ background: gameStore.nextLetter.color }}
        >
          {gameStore.nextLetter.text}
        </div>
        <div
          id="gameBoardWrapper"
          class={styles.board__canvasWrapper}
          style={{
            width: `${widthRem}rem`,
            height: `calc(${(ROWS_COUNT / COLUMNS_COUNT) *
              widthRem}rem + ${PADDING}px)`
          }}
        >
          <div>
            <canvas id="gameBoard" class={styles.board__canvas} />
          </div>
          <div id="gameBoardTouchHandler" class={styles.board__canvasUpper} />
        </div>
      </div>
    );
  }
}

export default inject('gameStore')(observer(Board));
