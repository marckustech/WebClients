import { FeatureFlag, useFlag } from '@proton/components/index';
import { isElectronApp, isElectronOnMac as testIsElectronOnMac } from '@proton/shared/lib/helpers/desktop';

const useIsElectronApp = (flag: FeatureFlag) => {
    const isElectron = isElectronApp();
    const electronFlag = useFlag(flag);
    const isElectronDisabled = isElectron && electronFlag;
    const isElectronOnMac = testIsElectronOnMac();

    return { isElectron, isElectronDisabled, isElectronOnMac };
};

export default useIsElectronApp;
