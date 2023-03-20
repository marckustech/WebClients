import browser from 'webextension-polyfill';

export const EXTENSION_PREFIX = 'protonpass';
export const INJECTOR_FLAG = `data-${EXTENSION_PREFIX}-injected`;
export const ICON_ROOT_CLASSNAME = `${EXTENSION_PREFIX}-input`;
export const ICON_WRAPPER_CLASSNAME = `${ICON_ROOT_CLASSNAME}--wrapper`;
export const ICON_CLASSNAME = `${ICON_ROOT_CLASSNAME}--icon`;
export const ICON_CIRCLE_LOADER = `${ICON_ROOT_CLASSNAME}--loader`;
export const ICON_PADDING = 8;
export const ICON_MAX_HEIGHT = 25;
export const ICON_MIN_HEIGHT = 18;
export const DROPDOWN_WIDTH = 250;
export const MIN_DROPDOWN_HEIGHT = 60;
export const NOTIFICATION_HEIGHT = 335;
export const NOTIFICATION_WIDTH = 320;
export const ACTIVE_ICON_SRC = browser.runtime.getURL('/assets/protonpass-icon-32.png');
export const DROPDOWN_IFRAME_SRC = browser.runtime.getURL('/dropdown.html');
export const NOTIFICATION_IFRAME_SRC = browser.runtime.getURL('/notification.html');
export const DETECTED_FORM_ID_ATTR = `data-${EXTENSION_PREFIX}-form-id`;
export const PROCESSED_INPUT_ATTR = `data-${EXTENSION_PREFIX}-processed`;
