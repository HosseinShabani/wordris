import { h, Component } from 'preact';
import { route } from 'preact-router';

import styles from './Main.css';
import { Button } from '../../components';
import ModalHelp from './components/modalHelp';
import ModalSearch from './components/modalSearch';

import { gameStore } from '../../stores';

class Main extends Component {
  handleMultiButtonClick = () => {
    ModalSearch.open();
  };

  changeRoute = url => {
    route(url);
  };

  render() {
    return (
      <div class={styles.mainPage}>
        <h1 class={styles.mainPage__title}>
          ورد<span>ر</span>یس
        </h1>
        <section class={styles.mainPage__buttonContainer}>
          <Button
            type="linear"
            color="primary"
            onClick={() => {
              gameStore.isMultiplayer = false;
              this.changeRoute('/game');
            }}
            additionalClass={styles.mainPage__button}
          >
            <i class="a-singleplayer" />
            <span class={styles.mainPage__buttonText}>تک نفره</span>
          </Button>
          <Button
            type="linear"
            color="primary"
            onClick={this.handleMultiButtonClick}
            additionalClass={styles.mainPage__button}
          >
            <i class="a-multiplayer" />
            <span class={styles.mainPage__buttonText}>دو نفره</span>
          </Button>
        </section>
        <nav class={styles.mainPage__botomNav}>
          <Button type="icony" icon="a-sound" />
          <Button
            type="icony"
            icon="a-stats"
            onClick={() => {
              this.changeRoute('scores');
            }}
          />
          <Button type="icony" icon="a-help" onClick={ModalHelp.open} />
        </nav>

        {/* only mount modal and not showing it*/}
        <div style={{ display: 'none' }}>
          <ModalHelp />
          <ModalSearch />
        </div>
      </div>
    );
  }
}

export default Main;
