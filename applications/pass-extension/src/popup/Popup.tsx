import { CSSProperties } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';

import { ErrorBoundary } from '@proton/components';

import { ExtensionError, ExtensionWindow } from '../shared/components/extension';
import { ExtensionContext } from '../shared/extension';
import createClientStore from '../shared/store/client-store';
import { App } from './App';
import { PopupContextProvider, usePopupContext } from './context';
import Lobby from './views/Lobby/Lobby';

import './Popup.scss';

document.documentElement.style.setProperty('--popup-width', '600px');
document.documentElement.style.setProperty('--popup-height', '430px');

const POPUP_DIMENSIONS: CSSProperties = {
    '--width-custom': 'var(--popup-width)',
    '--height-custom': 'var(--popup-height)',
};

const AppOrLobby = () => {
    const { state } = usePopupContext();
    return state.loggedIn ? <App /> : <Lobby />;
};

const Popup = () => {
    return (
        <ExtensionWindow
            endpoint="popup"
            style={POPUP_DIMENSIONS}
            className="w-custom h-custom anime-fade-in block overflow-hidden"
        >
            {(ready) =>
                ready ? (
                    <ReduxProvider store={createClientStore('popup', ExtensionContext.get().tabId)}>
                        <Router>
                            <ErrorBoundary component={<ExtensionError />}>
                                <PopupContextProvider>
                                    <AppOrLobby />
                                </PopupContextProvider>
                            </ErrorBoundary>
                        </Router>
                    </ReduxProvider>
                ) : null
            }
        </ExtensionWindow>
    );
};

export default Popup;
