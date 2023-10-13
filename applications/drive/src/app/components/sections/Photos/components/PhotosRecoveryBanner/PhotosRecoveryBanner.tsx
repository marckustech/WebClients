import { useEffect, useState } from 'react';

import { c, msgid } from 'ttag';

import { Button } from '@proton/atoms/Button';
import { CircleLoader } from '@proton/atoms/CircleLoader';
import { TopBanner } from '@proton/components/containers';
import clsx from '@proton/utils/clsx';

import { usePhotosRecovery } from '../../../../../store';
import { RECOVERY_STATE } from '../../../../../store/_photos/usePhotosRecovery';

const getPhotosRecoveryProgressText = (
    recoveryState: RECOVERY_STATE,
    countOfUnrecoveredLinksLeft: number,
    countOfFailedLinks: number
) => {
    const baseText = c('Info').t`Photos restore is in progress, it might take a while`;

    if (recoveryState === 'READY') {
        return c('Info').t`Photos are waiting to be recovered`;
    }

    if (recoveryState === 'FAILED') {
        return c('Info').t`Some issues occurred during recovery`;
    }

    if (recoveryState === 'SUCCEED') {
        return c('Info').t`Photos were recovered successfully`;
    }

    if (
        recoveryState === 'STARTED' ||
        recoveryState === 'DECRYPTING' ||
        recoveryState === 'DECRYPTED' ||
        recoveryState === 'PREPARING' ||
        recoveryState === 'PREPARED'
    ) {
        return `${baseText} (${c('Info').t`preparing`}...)`;
    }
    if (recoveryState === 'CLEANING' || recoveryState === 'MOVED' || countOfUnrecoveredLinksLeft === 0) {
        return `${baseText} (${c('Info').t`cleaning`}...)`;
    }
    const errorMessage = !!countOfFailedLinks
        ? c('Failed').ngettext(msgid`${countOfFailedLinks} failed`, `${countOfFailedLinks} failed`, countOfFailedLinks)
        : '';
    return `${baseText} (${c('Success').ngettext(
        msgid`${countOfUnrecoveredLinksLeft} left`,
        `${countOfUnrecoveredLinksLeft} left`,
        countOfUnrecoveredLinksLeft
    )}) ${errorMessage}`;
};

const PhotosRecoveryBanner = () => {
    const {
        start,
        state: recoveryState,
        countOfUnrecoveredLinksLeft,
        countOfFailedLinks,
        needsRecovery,
    } = usePhotosRecovery();

    const [showBanner, setShowBanner] = useState<boolean>(false);

    useEffect(() => {
        setShowBanner(needsRecovery);
    }, [needsRecovery]);

    if (!showBanner) {
        return null;
    }
    return (
        <TopBanner
            className={clsx(
                recoveryState === 'SUCCEED' && 'bg-success',
                recoveryState === 'FAILED' && 'bg-danger',
                recoveryState !== 'FAILED' && recoveryState !== 'SUCCEED' && 'bg-warning'
            )}
        >
            <div className="flex flex-align-items-center flex-justify-center">
                <span className="mr-2 py-1 inline-block">
                    {getPhotosRecoveryProgressText(recoveryState, countOfUnrecoveredLinksLeft, countOfFailedLinks)}
                </span>
                {recoveryState === 'SUCCEED' && (
                    <Button size="small" onClick={() => setShowBanner(false)}>
                        {c('Action').t`Ok`}
                    </Button>
                )}
                {recoveryState === 'FAILED' && (
                    <Button size="small" onClick={start}>
                        {c('Action').t`Retry`}
                    </Button>
                )}
                {recoveryState === 'READY' && (
                    <Button size="small" onClick={start}>
                        {c('Action').t`Start now`}
                    </Button>
                )}
                {recoveryState !== 'SUCCEED' && recoveryState !== 'FAILED' && recoveryState !== 'READY' && (
                    <CircleLoader />
                )}
            </div>
        </TopBanner>
    );
};

export default PhotosRecoveryBanner;
