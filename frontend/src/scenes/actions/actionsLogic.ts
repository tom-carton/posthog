import { kea, selectors, path, actions, reducers, connect } from 'kea'
import { ActionType, Breadcrumb, ProductKey } from '~/types'
import { urls } from 'scenes/urls'

import type { actionsLogicType } from './actionsLogicType'
import { actionsModel } from '~/models/actionsModel'
import Fuse from 'fuse.js'
import { userLogic } from 'scenes/userLogic'
import { subscriptions } from 'kea-subscriptions'
import { featureFlagLogic } from 'lib/logic/featureFlagLogic'
import { FEATURE_FLAGS } from 'lib/constants'

export type ActionsFilterType = 'all' | 'me'

export const actionsFuse = new Fuse<ActionType>([], {
    keys: [{ name: 'name', weight: 2 }, 'description', 'tags'],
    threshold: 0.3,
    ignoreLocation: true,
    includeMatches: true,
})

export const actionsLogic = kea<actionsLogicType>([
    path(['scenes', 'actions', 'actionsLogic']),
    connect(() => ({
        values: [
            actionsModel({ params: 'include_count=1' }),
            ['actions', 'actionsLoading'],
            userLogic,
            ['user'],
            featureFlagLogic,
            ['featureFlags'],
        ],
    })),
    actions({
        setFilterType: (filterType: ActionsFilterType) => ({ filterType }),
        setSearchTerm: (searchTerm: string) => ({ searchTerm }),
    }),
    reducers({
        filterType: [
            'all' as ActionsFilterType,
            { persist: true },
            {
                setFilterType: (_, { filterType }) => filterType,
            },
        ],
        searchTerm: [
            '',
            {
                setSearchTerm: (_, { searchTerm }) => searchTerm,
            },
        ],
    }),
    selectors({
        actionsFiltered: [
            (s) => [s.actions, s.filterType, s.searchTerm, s.user],
            (actions, filterType, searchTerm, user) => {
                let data = actions
                if (searchTerm) {
                    data = actionsFuse.search(searchTerm).map((result) => result.item)
                }
                if (filterType === 'me') {
                    data = data.filter((item) => item.created_by?.uuid === user?.uuid)
                }
                return data
            },
        ],
        breadcrumbs: [
            () => [],
            (): Breadcrumb[] => [
                {
                    name: `Data Management`,
                    path: urls.eventDefinitions(),
                },
                {
                    name: 'Actions',
                    path: urls.actions(),
                },
            ],
        ],
        shouldShowProductIntroduction: [
            (s) => [s.user, s.featureFlags],
            (user, featureFlags): boolean => {
                return (
                    !user?.has_seen_product_intro_for?.[ProductKey.ACTIONS] &&
                    !!featureFlags[FEATURE_FLAGS.SHOW_PRODUCT_INTRO_EXISTING_PRODUCTS]
                )
            },
        ],
        shouldShowEmptyState: [
            (s) => [s.actionsFiltered, s.actionsLoading, s.searchTerm],
            (actionsFiltered, actionsLoading, searchTerm): boolean => {
                return actionsFiltered.length == 0 && !actionsLoading && !searchTerm.length
            },
        ],
    }),
    subscriptions({
        actions: (actions) => {
            actionsFuse.setCollection(actions)
        },
    }),
])
