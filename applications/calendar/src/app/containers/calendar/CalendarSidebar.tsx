import React, { ReactNode, useMemo, useRef, useState } from 'react';

import { c } from 'ttag';

import {
    DropdownMenu,
    DropdownMenuButton,
    FeatureCode,
    Href,
    Icon,
    Sidebar,
    SidebarList,
    SidebarListItemHeaderLink,
    SidebarNav,
    SidebarPrimaryButton,
    SimpleDropdown,
    SimpleSidebarListItemHeader,
    Spotlight,
    Tooltip,
    useApi,
    useCalendarSubscribeFeature,
    useEventManager,
    useLoading,
    useModalState,
    useNotifications,
    useSpotlightOnFeature,
    useSpotlightShow,
    useUser,
    useWelcomeFlags,
} from '@proton/components';
import CalendarLimitReachedModal from '@proton/components/containers/calendar/CalendarLimitReachedModal';
import { CalendarModal } from '@proton/components/containers/calendar/calendarModal/CalendarModal';
import SubscribeCalendarModal from '@proton/components/containers/calendar/subscribeCalendarModal/SubscribeCalendarModal';
import useSubscribedCalendars from '@proton/components/hooks/useSubscribedCalendars';
import { updateMember } from '@proton/shared/lib/api/calendars';
import { getIsCalendarActive } from '@proton/shared/lib/calendar/calendar';
import getHasUserReachedCalendarLimit from '@proton/shared/lib/calendar/getHasUserReachedCalendarLimit';
import { getMemberAndAddress } from '@proton/shared/lib/calendar/members';
import { getIsPersonalCalendar } from '@proton/shared/lib/calendar/subscribe/helpers';
import { APPS } from '@proton/shared/lib/constants';
import { getKnowledgeBaseUrl } from '@proton/shared/lib/helpers/url';
import { Address, Nullable } from '@proton/shared/lib/interfaces';
import { CalendarUserSettings, VisualCalendar } from '@proton/shared/lib/interfaces/calendar';
import partition from '@proton/utils/partition';

import CalendarSidebarListItems from './CalendarSidebarListItems';
import CalendarSidebarVersion from './CalendarSidebarVersion';

export interface CalendarSidebarProps {
    addresses: Address[];
    calendars: VisualCalendar[];
    calendarUserSettings: CalendarUserSettings;
    isNarrow?: boolean;
    expanded?: boolean;
    logo?: ReactNode;
    miniCalendar: ReactNode;
    onToggleExpand: () => void;
    onCreateEvent?: () => void;
    onCreateCalendar?: (id: string) => void;
}

const CalendarSidebar = ({
    addresses,
    calendars,
    calendarUserSettings,
    logo,
    isNarrow,
    expanded = false,
    onToggleExpand,
    miniCalendar,
    onCreateEvent,
    onCreateCalendar,
}: CalendarSidebarProps) => {
    const { call } = useEventManager();
    const api = useApi();
    const [user] = useUser();
    const [{ isWelcomeFlow }] = useWelcomeFlags();
    const { enabled, unavailable } = useCalendarSubscribeFeature();

    const [loadingAction, withLoadingAction] = useLoading();
    const { createNotification } = useNotifications();

    const [{ onClose, open, ...modalProps }, setOpen] = useModalState();

    const [isSubscribeCalendarModalOpen, setIsSubscribeCalendarModalOpen] = useState(false);
    const [isLimitReachedModalCopy, setIsLimitReachedModalCopy] = useState<Nullable<string>>(null);
    const headerRef = useRef(null);
    const dropdownRef = useRef(null);

    const [personalCalendars, otherCalendars] = useMemo(
        () => partition<VisualCalendar>(calendars, getIsPersonalCalendar),
        [calendars]
    );

    const { subscribedCalendars, loading: loadingSubscribedCalendars } = useSubscribedCalendars(
        otherCalendars,
        addresses
    );

    const canShowSubscribedSpotlights = !isWelcomeFlow && enabled && !unavailable && !isNarrow;
    const canShowSubscribedRemindersSpotlight = canShowSubscribedSpotlights && !!otherCalendars.length;
    const canShowSubscribedCalendarsSpotlight = canShowSubscribedSpotlights && !otherCalendars.length;
    const { show: showSubscribedRemindersSpotlight, onDisplayed: onSubscribedRemindersSpotlightDisplayed } =
        useSpotlightOnFeature(FeatureCode.SpotlightSubscribedCalendarReminder, canShowSubscribedRemindersSpotlight);
    const shouldShowSubscribedRemindersSpotlight = useSpotlightShow(showSubscribedRemindersSpotlight);
    const {
        show: showSubscribedCalendars,
        onDisplayed: onSubscribedCalendarsSpotlightDisplayed,
        onClose: onCloseSubscribedRemindersSpotlight,
    } = useSpotlightOnFeature(FeatureCode.SpotlightSubscribedCalendars, canShowSubscribedCalendarsSpotlight, {
        alpha: Date.UTC(2021, 7, 5, 12),
        beta: Date.UTC(2021, 7, 5, 12),
        default: Date.UTC(2022, 9, 5, 12),
    });
    const shouldShowSubscribedCalendarsSpotlight = useSpotlightShow(showSubscribedCalendars);

    const canAddPersonalCalendars = !getHasUserReachedCalendarLimit({
        calendarsLength: personalCalendars.length,
        isFreeUser: !user.hasPaidMail,
        isSubscribedCalendar: false,
    });
    const canAddSubscribedCalendars = !getHasUserReachedCalendarLimit({
        calendarsLength: otherCalendars.length,
        isFreeUser: !user.hasPaidMail,
        isSubscribedCalendar: true,
    });

    const addCalendarText = c('Dropdown action icon tooltip').t`Add calendar`;

    const handleChangeVisibility = async (calendarID: string, checked: boolean) => {
        const members = calendars.find(({ ID }) => ID === calendarID)?.Members || [];
        const [{ ID: memberID }] = getMemberAndAddress(addresses, members);
        await api(updateMember(calendarID, memberID, { Display: checked ? 1 : 0 }));
        await call();
    };

    const handleCreatePersonalCalendar = async () => {
        if (canAddPersonalCalendars) {
            setOpen(true);
        } else {
            setIsLimitReachedModalCopy(
                c('Personal calendar limit reached modal body')
                    .t`Unable to create more calendars. You have reached the maximum of personal calendars within your plan.`
            );
        }
    };

    const handleCreateSubscribedCalendar = () => {
        if (canAddSubscribedCalendars) {
            setIsSubscribeCalendarModalOpen(true);
        } else {
            setIsLimitReachedModalCopy(
                c('Subscribed calendar limit reached modal body')
                    .t`Unable to add more calendars. You have reached the maximum of subscribed calendars within your plan.`
            );
        }
    };

    const primaryAction = (
        <SidebarPrimaryButton
            data-test-id="calendar-view:new-event-button"
            disabled={!onCreateEvent}
            onClick={onCreateEvent}
            className="no-mobile"
        >{c('Action').t`New event`}</SidebarPrimaryButton>
    );

    const [displayPersonalCalendars, setDisplayPersonalCalendars] = useState(true);
    const [displayOtherCalendars, setDisplayOtherCalendars] = useState(true);

    const headerButton = (
        <Tooltip title={c('Info').t`Manage your calendars`}>
            <SidebarListItemHeaderLink
                toApp={APPS.PROTONACCOUNT}
                to="/calendar/calendars"
                target="_self"
                icon="cog-wheel"
                info={c('Link').t`Calendars`}
            />
        </Tooltip>
    );

    const personalCalendarsList = (
        <SidebarList>
            <SimpleSidebarListItemHeader
                toggle={displayPersonalCalendars}
                onToggle={() => setDisplayPersonalCalendars((prevState) => !prevState)}
                right={
                    <div className="flex flex-nowrap flex-align-items-center">
                        {enabled ? (
                            <Spotlight
                                show={shouldShowSubscribedCalendarsSpotlight}
                                onDisplayed={onSubscribedCalendarsSpotlightDisplayed}
                                type="new"
                                content={
                                    <>
                                        <div className="text-lg text-bold mb0-25">{c('Spotlight')
                                            .t`Subscribe to other calendars`}</div>
                                        <p className="m0">
                                            {c('Spotlight')
                                                .t`You can subscribe to external calendars and read their events.`}{' '}
                                            <Href url={getKnowledgeBaseUrl('/subscribe-to-external-calendar')}>
                                                {c('Link').t`Learn more`}
                                            </Href>
                                        </p>
                                    </>
                                }
                                anchorRef={dropdownRef}
                            >
                                <Tooltip title={addCalendarText}>
                                    <SimpleDropdown
                                        as="button"
                                        type="button"
                                        hasCaret={false}
                                        className="navigation-link-header-group-control flex"
                                        content={<Icon name="plus" className="navigation-icon" alt={addCalendarText} />}
                                        onClick={onCloseSubscribedRemindersSpotlight}
                                        ref={dropdownRef}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuButton
                                                className="text-left"
                                                onClick={() => handleCreatePersonalCalendar()}
                                            >
                                                {c('Action').t`Create calendar`}
                                            </DropdownMenuButton>
                                            <DropdownMenuButton
                                                className="text-left"
                                                onClick={() =>
                                                    unavailable
                                                        ? createNotification({
                                                              type: 'error',
                                                              text: c('Subscribed calendar feature unavailable error')
                                                                  .t`Subscribing to a calendar is unavailable at the moment`,
                                                          })
                                                        : handleCreateSubscribedCalendar()
                                                }
                                            >
                                                {c('Calendar sidebar dropdown item').t`Add calendar from URL`}
                                            </DropdownMenuButton>
                                        </DropdownMenu>
                                    </SimpleDropdown>
                                </Tooltip>
                            </Spotlight>
                        ) : (
                            <div className="navigation-link-header-group-control flex cursor-pointer">
                                <Tooltip title={addCalendarText}>
                                    <Icon
                                        onClick={() => handleCreatePersonalCalendar()}
                                        name="plus"
                                        className="navigation-icon"
                                        alt={addCalendarText}
                                    />
                                </Tooltip>
                            </div>
                        )}
                        {headerButton}
                    </div>
                }
                text={c('Link').t`My calendars`}
            />
            {displayPersonalCalendars && (
                <CalendarSidebarListItems
                    calendars={personalCalendars}
                    onChangeVisibility={(calendarID, value) =>
                        withLoadingAction(handleChangeVisibility(calendarID, value))
                    }
                    loading={loadingAction}
                />
            )}
        </SidebarList>
    );

    const subscribedCalendarsList = otherCalendars.length ? (
        <Spotlight
            show={shouldShowSubscribedRemindersSpotlight}
            onDisplayed={onSubscribedRemindersSpotlightDisplayed}
            type="new"
            content={
                <>
                    <div className="text-lg text-bold mb0-25">{c('Spotlight').t`Don't miss any events`}</div>
                    <p className="m0">
                        {c('Spotlight').t`You can now add notifications to calendars you subscribed to.`}
                    </p>
                </>
            }
            anchorRef={headerRef}
        >
            <SidebarList>
                <SimpleSidebarListItemHeader
                    toggle={displayOtherCalendars}
                    onToggle={() => setDisplayOtherCalendars((prevState) => !prevState)}
                    text={c('Link').t`Subscribed calendars`}
                    headerRef={headerRef}
                />
                {displayOtherCalendars && (
                    <CalendarSidebarListItems
                        actionsDisabled={loadingSubscribedCalendars}
                        calendars={loadingSubscribedCalendars ? otherCalendars : subscribedCalendars}
                        onChangeVisibility={(calendarID, value) =>
                            withLoadingAction(handleChangeVisibility(calendarID, value))
                        }
                        loading={loadingAction}
                    />
                )}
            </SidebarList>
        </Spotlight>
    ) : null;

    return (
        <Sidebar
            logo={logo}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            primary={primaryAction}
            version={<CalendarSidebarVersion />}
        >
            <CalendarModal
                open={open}
                onClose={onClose}
                activeCalendars={personalCalendars.filter(getIsCalendarActive)}
                defaultCalendarID={calendarUserSettings.DefaultCalendarID}
                onCreateCalendar={onCreateCalendar}
                {...modalProps}
            />

            <SubscribeCalendarModal
                isOpen={isSubscribeCalendarModalOpen}
                onClose={() => setIsSubscribeCalendarModalOpen(false)}
                onCreateCalendar={onCreateCalendar}
            />

            <CalendarLimitReachedModal
                isOpen={!!isLimitReachedModalCopy}
                onClose={() => setIsLimitReachedModalCopy(null)}
            >
                {isLimitReachedModalCopy}
            </CalendarLimitReachedModal>

            <SidebarNav data-test-id="calendar-sidebar:calendars-list-area">
                <div className="flex-item-noshrink">{miniCalendar}</div>
                {personalCalendarsList}
                {subscribedCalendarsList}
            </SidebarNav>
        </Sidebar>
    );
};

export default CalendarSidebar;
