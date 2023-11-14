import { isElectronApp, isElectronOnMac as testIsElectronOnMac } from '@proton/shared/lib/helpers/desktop';

import { FeatureFlag, useFlag } from '../containers/unleash';

const useIsElectronApp = (flag: FeatureFlag) => {
    const isElectron = isElectronApp();
    const electronFlag = useFlag(flag);
    const isElectronDisabled = isElectron && electronFlag;
    const isElectronOnMac = testIsElectronOnMac();

    return { isElectron, isElectronDisabled, isElectronOnMac };
};

export default useIsElectronApp;
