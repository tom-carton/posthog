import { useActions, useValues } from 'kea'
import './NotebookPanel.scss'
import { Notebook } from '../Notebook/Notebook'
import { LemonButton } from '@posthog/lemon-ui'
import { IconOpenInNew } from 'lib/lemon-ui/icons'
import { useMemo } from 'react'
import { NotebookListMini } from '../Notebook/NotebookListMini'
import { NotebookExpandButton, NotebookSyncInfo } from '../Notebook/NotebookMeta'
import { notebookLogic } from '../Notebook/notebookLogic'
import { useResizeBreakpoints } from 'lib/hooks/useResizeObserver'
import { notebookPanelLogic } from './notebookPanelLogic'
import { NotebookPanelDropzone } from './NotebookPanelDropzone'
import { urls } from 'scenes/urls'
import { NotebookMenu } from '../NotebookMenu'
import { NotebookTarget } from '~/types'
import { SidePanelPaneHeader } from '~/layout/navigation-3000/sidepanel/components/SidePanelPane'

export function NotebookPanel(): JSX.Element | null {
    const { selectedNotebook, initialAutofocus, droppedResource, dropProperties } = useValues(notebookPanelLogic)
    const { selectNotebook, closeSidePanel } = useActions(notebookPanelLogic)
    const { notebook } = useValues(notebookLogic({ shortId: selectedNotebook, target: NotebookTarget.Popover }))
    const editable = !notebook?.is_template

    const { ref, size } = useResizeBreakpoints({
        0: 'small',
        832: 'medium',
    })

    const contentWidthHasEffect = useMemo(() => size === 'medium', [size])

    return (
        <div ref={ref} className="NotebookPanel" {...dropProperties}>
            {!droppedResource ? (
                <>
                    <SidePanelPaneHeader>
                        <span className="flex-1">
                            <NotebookListMini
                                selectedNotebookId={selectedNotebook}
                                onSelectNotebook={(notebook) => {
                                    selectNotebook(notebook.short_id)
                                }}
                            />
                        </span>
                        {selectedNotebook && <NotebookSyncInfo shortId={selectedNotebook} />}

                        <LemonButton
                            size="small"
                            to={urls.notebook(selectedNotebook)}
                            onClick={() => closeSidePanel()}
                            status="primary-alt"
                            icon={<IconOpenInNew />}
                            tooltip="Open as main focus"
                            tooltipPlacement="left"
                        />

                        {contentWidthHasEffect && <NotebookExpandButton status="primary-alt" size="small" />}

                        <NotebookMenu shortId={selectedNotebook} />
                    </SidePanelPaneHeader>

                    <div className="flex flex-col flex-1 overflow-y-auto px-4 py-2">
                        <Notebook
                            key={selectedNotebook}
                            shortId={selectedNotebook}
                            editable={editable}
                            initialAutofocus={initialAutofocus}
                        />
                    </div>
                </>
            ) : null}

            <NotebookPanelDropzone />
        </div>
    )
}
