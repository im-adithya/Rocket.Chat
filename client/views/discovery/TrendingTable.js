import { Box, Table, Avatar, Icon } from '@rocket.chat/fuselage';
import { useMediaQuery, useAutoFocus } from '@rocket.chat/fuselage-hooks';
import React, { useMemo, useState, useCallback } from 'react';

import { roomTypes } from '../../../app/utils/client';
import FilterByText from '../../components/FilterByText';
import GenericTable from '../../components/GenericTable';
import MarkdownText from '../../components/MarkdownText';
import { useRoute } from '../../contexts/RouterContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { useEndpointData } from '../../hooks/useEndpointData';
import { useFormatDate } from '../../hooks/useFormatDate';
import RoomTags from './RoomTags';
import { useQuery } from './hooks';

const style = {
	whiteSpace: 'nowrap',
	textOverflow: 'ellipsis',
	overflow: 'hidden',
};

function ChannelsTable() {
	const t = useTranslation();
	const refAutoFocus = useAutoFocus(true);
	const [sort, setSort] = useState(['name', 'asc']);
	const [params, setParams] = useState({ current: 0, itemsPerPage: 25 });

	const mediaQuery = useMediaQuery('(min-width: 768px)');

	const query = useQuery(params, sort, 'trendingchannels');

	const header = useMemo(
		() =>
			[
				<GenericTable.HeaderCell
					key={'name'}
					direction={sort[1]}
					active={sort[0] === 'name'}
					sort={false}
				>
					{t('Name')}
				</GenericTable.HeaderCell>,
				<GenericTable.HeaderCell
					key={'usersCount'}
					direction={sort[1]}
					active={sort[0] === 'usersCount'}
					sort={false}
					style={{ width: '100px' }}
				>
					{t('Users')}
				</GenericTable.HeaderCell>,
				mediaQuery && (
					<GenericTable.HeaderCell
						key={'createdAt'}
						direction={sort[1]}
						active={sort[0] === 'createdAt'}
						sort={false}
						style={{ width: '150px' }}
					>
						{t('Created_at')}
					</GenericTable.HeaderCell>
				),
				mediaQuery && (
					<GenericTable.HeaderCell
						key={'lastMessage'}
						direction={sort[1]}
						active={sort[0] === 'lastMessage'}
						sort={false}
						style={{ width: '150px' }}
					>
						{t('Last_Message')}
					</GenericTable.HeaderCell>
				),
				mediaQuery && (
					<GenericTable.HeaderCell key={'belongsTo'} style={{ width: '150px' }}>
						{t('Belongs_To')}
					</GenericTable.HeaderCell>
				),
				mediaQuery && (
					<GenericTable.HeaderCell
						key={'tags'}
						direction={sort[1]}
						active={sort[0] === 'tags'}
						sort={false}
						style={{ width: '300px' }}
					>
						{t('Tags')}
					</GenericTable.HeaderCell>
				),
			].filter(Boolean),
		[sort, t, mediaQuery],
	);

	const channelRoute = useRoute('channel');

	const { value: data = {} } = useEndpointData('discovery', query);

	console.log(data);
	const onClick = useMemo(
		() => (name) => (e) => {
			if (e.type === 'click' || e.key === 'Enter') {
				channelRoute.push({ name });
			}
		},
		[channelRoute],
	);

	const formatDate = useFormatDate();
	const renderRow = useCallback(
		(room) => {
			const { _id, ts, t, name, fname, usersCount, lastMessage, topic, belongsTo, tags } = room;
			const avatarUrl = roomTypes.getConfig(t).getAvatarPath(room);

			return (
				<Table.Row
					key={_id}
					onKeyDown={onClick(name)}
					onClick={onClick(name)}
					tabIndex={0}
					role='link'
					action
				>
					<Table.Cell>
						<Box display='flex'>
							<Box flexGrow={0}>
								<Avatar size='x40' title={fname || name} url={avatarUrl} />
							</Box>
							<Box grow={1} mi='x8' style={style}>
								<Box display='flex' alignItems='center'>
									<Icon name={roomTypes.getIcon(room)} color='hint' />{' '}
									<Box fontScale='p2' mi='x4'>
										{fname || name}
									</Box>
									<RoomTags room={room} style={style} />
								</Box>
								{topic && (
									<MarkdownText
										variant='inlineWithoutBreaks'
										fontScale='p1'
										color='hint'
										style={style}
										content={topic}
									/>
								)}
							</Box>
						</Box>
					</Table.Cell>
					<Table.Cell fontScale='p1' color='hint' style={style}>
						{usersCount}
					</Table.Cell>
					{mediaQuery && (
						<Table.Cell fontScale='p1' color='hint' style={style}>
							{formatDate(ts)}
						</Table.Cell>
					)}
					{mediaQuery && (
						<Table.Cell fontScale='p1' color='hint' style={style}>
							{lastMessage && formatDate(lastMessage.ts)}
						</Table.Cell>
					)}
					{mediaQuery && (
						<Table.Cell fontScale='p1' color='hint' style={style}>
							{belongsTo}
						</Table.Cell>
					)}
					{mediaQuery && (
						<Table.Cell fontScale='p1' color='hint' style={style}>
							{tags?.join(" ")}
						</Table.Cell>
					)}
				</Table.Row>
			);
		},
		[formatDate, mediaQuery, onClick],
	);

	return (
		<GenericTable
			header={header}
			renderFilter={({ onChange, ...props }) => (
				<FilterByText
					placeholder={t('Search_Channels')}
					inputRef={refAutoFocus}
					onChange={onChange}
					{...props}
				/>
			)}
			renderRow={renderRow}
			results={data.result}
			setParams={setParams}
			total={data.total}
		/>
	);
}

export default ChannelsTable;
