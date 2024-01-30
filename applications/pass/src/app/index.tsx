import ReactDOM from 'react-dom';

import '@proton/polyfill';
import { initSafariFontFixClassnames } from '@proton/shared/lib/helpers/initSafariFontFixClassnames';

import { App } from './App';
import './style';

initSafariFontFixClassnames();

ReactDOM.render(<App />, document.querySelector('.app-root'));
