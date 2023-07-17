import React, { MouseEvent } from 'react';

import { isBefore, isSameDay } from 'date-fns';

import { useAddresses } from '@proton/components/hooks';
import { format as formatUTC } from '@proton/shared/lib/date-fns-utc';
import { dateLocale } from '@proton/shared/lib/i18n';
import clsx from '@proton/utils/clsx';

import { getEventTraits } from './CalendarSearchViewDayEvents.utils';
import { VisualSearchItem } from './interface';
import { getEventsDayDateString, getTimeString } from './searchHelpers';

import './SearchView.scss';

interface Props {
    dailyEvents?: VisualSearchItem[];
    onClickSearchItem?: (e: MouseEvent<HTMLButtonElement>, item: VisualSearchItem) => void;
}

const CalendarSearchViewDayEvents = ({ dailyEvents = [], onClickSearchItem }: Props) => {
    const [addresses] = useAddresses();
    const now = new Date();
    const startDate = dailyEvents.length ? dailyEvents[0].fakeUTCStartDate : new Date();

    const formattedDate = getEventsDayDateString(startDate);
    const day = formatUTC(startDate, 'd', { locale: dateLocale });

    const isToday = isSameDay(now, startDate);
    const isPast = isBefore(startDate, now);

    return (
        <div
            className="flex flex-nowrap border-bottom border-weak search-result-line w100 px-4 py-2 on-tablet-flex-column"
            style={{ scrollPaddingTop: '80px' }}
        >
            <div
                data-testid="month-day-block"
                className="flex-no-min-children flex-item-noshrink my-1 py-1"
                aria-current={isToday ? `date` : undefined}
            >
                <div className="text-lg text-semibold min-w5e text-center">
                    <span className="search-day-number rounded-sm p-1">{day}</span>
                </div>
                <div className="text-lg text-weak min-w9e">{formattedDate}</div>
            </div>
            {Boolean(dailyEvents.length) && (
                <div className="flex-item-grow search-day flex flex-nowrap flex-column pl-7 lg:pl-0 mt-2 lg:mt-0">
                    {dailyEvents.map((event) => {
                        const {
                            ID,
                            CalendarID,
                            visualCalendar,
                            fakeUTCStartDate,
                            fakeUTCEndDate,
                            isAllDay,
                            plusDaysToEnd,
                            Summary,
                        } = event;

                        const { isCancelled, isUnanswered } = getEventTraits(event, addresses);

                        const timeString = getTimeString({
                            startDate: fakeUTCStartDate,
                            endDate: fakeUTCEndDate,
                            isAllDay,
                            plusDaysToEnd,
                        });

                        return (
                            <button
                                type="button"
                                key={`${CalendarID}-${ID}-${fakeUTCStartDate}`}
                                className={clsx(
                                    'flex flex-nowrap search-event-cell flex-align-items-center text-left interactive-pseudo w100',
                                    isCancelled && 'text-strike',
                                    isPast ? 'color-weak' : 'color-norm'
                                )}
                                onClick={(e) => onClickSearchItem?.(e, event)}
                            >
                                <span
                                    className={clsx(
                                        'search-calendar-border flex-item-noshrink my-1',
                                        isUnanswered && 'isUnanswered'
                                    )}
                                    style={{ '--calendar-color': visualCalendar.Color }}
                                />
                                <span className="flex-no-min-children flex-nowrap flex-item-fluid search-event-time-details on-tablet-flex-column">
                                    <span className="text-lg min-w14e pl-2 lg:pl-0 search-event-time">
                                        {timeString}
                                    </span>
                                    <span
                                        className={clsx(
                                            'text-lg text-ellipsis flex-item-fluid pl-2 lg:pl-0 search-event-summary',
                                            isPast ? 'text-nobold' : 'text-bold'
                                        )}
                                    >
                                        {Summary}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CalendarSearchViewDayEvents;
