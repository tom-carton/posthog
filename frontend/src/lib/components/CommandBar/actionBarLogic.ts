import { kea, path, listeners, connect, afterMount, beforeUnmount } from 'kea'

import { commandPaletteLogic } from '../CommandPalette/commandPaletteLogic'
import { commandBarLogic } from './commandBarLogic'

import { BarStatus } from './types'

import type { actionBarLogicType } from './actionBarLogicType'

export const actionBarLogic = kea<actionBarLogicType>([
    path(['lib', 'components', 'CommandBar', 'actionBarLogic']),
    connect({
        actions: [
            commandBarLogic,
            ['hideCommandBar', 'setCommandBar'],
            commandPaletteLogic,
            [
                'showPalette',
                'hidePalette',
                'setInput',
                'executeResult',
                'backFlow',
                'onArrowUp',
                'onArrowDown',
                'onMouseEnterResult',
                'onMouseLeaveResult',
            ],
        ],
        values: [
            commandPaletteLogic,
            [
                'input',
                'activeResultIndex',
                'commandRegistrations',
                'commandSearchResults',
                'commandSearchResultsGrouped',
                'activeFlow',
            ],
        ],
    }),
    listeners(({ actions }) => ({
        hidePalette: () => {
            // listen on hide action from legacy palette, and hide command bar
            actions.hideCommandBar()
        },
    })),
    afterMount(({ actions, values, cache }) => {
        // trigger show action from legacy palette
        actions.showPalette()

        // register keyboard shortcuts
        cache.onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' && values.commandSearchResults.length) {
                // execute result
                const result = values.commandSearchResults[values.activeResultIndex]
                const isExecutable = !!result.executor
                if (isExecutable) {
                    actions.executeResult(result)
                }
            } else if (event.key === 'ArrowDown') {
                // navigate to next result
                event.preventDefault()
                actions.onArrowDown(values.commandSearchResults.length - 1)
            } else if (event.key === 'ArrowUp') {
                // navigate to previous result
                event.preventDefault()
                actions.onArrowUp()
            } else if (event.key === 'Escape') {
                event.preventDefault()

                if (values.activeFlow) {
                    // return to previous flow
                    actions.backFlow()
                } else if (values.input) {
                    // or erase input
                    actions.setInput('')
                } else {
                    // or hide palette
                    actions.hidePalette()
                }
            } else if (event.key === 'Backspace') {
                if (values.input.length === 0) {
                    // transition to search when pressing backspace with empty input
                    actions.setCommandBar(BarStatus.SHOW_SEARCH)
                }
            }
        }
        window.addEventListener('keydown', cache.onKeyDown)
    }),
    beforeUnmount(({ actions, cache }) => {
        // trigger hide action from legacy palette
        actions.hidePalette()

        // unregister keyboard shortcuts
        window.removeEventListener('keydown', cache.onKeyDown)
    }),
])
