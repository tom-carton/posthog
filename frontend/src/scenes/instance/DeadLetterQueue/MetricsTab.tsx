import { Button, Col, Divider, Row, Statistic } from 'antd'
import { useValues, useActions } from 'kea'
import { deadLetterQueueLogic } from './deadLetterQueueLogic'
import { userLogic } from 'scenes/userLogic'
import { LemonTable } from 'lib/lemon-ui/LemonTable'
import { LemonButton } from 'lib/lemon-ui/LemonButton'
import { Spinner } from 'lib/lemon-ui/Spinner/Spinner'
import { IconRefresh } from 'lib/lemon-ui/icons'

// keep in sync with posthog/api/dead_letter_queue.py
const ROWS_LIMIT = 10

export function MetricsTab(): JSX.Element {
    const { user } = useValues(userLogic)
    const { singleValueMetrics, tableMetrics, deadLetterQueueMetricsLoading, rowsPerMetric } =
        useValues(deadLetterQueueLogic)
    const { loadDeadLetterQueueMetrics, loadMoreRows } = useActions(deadLetterQueueLogic)

    if (!user?.is_staff) {
        return <></>
    }

    return (
        <div>
            <br />

            <div className="mb-4 float-right">
                <LemonButton
                    icon={deadLetterQueueMetricsLoading ? <Spinner /> : <IconRefresh />}
                    onClick={loadDeadLetterQueueMetrics}
                    type="secondary"
                    size="small"
                >
                    Refresh
                </LemonButton>
            </div>

            <Row gutter={32}>
                {singleValueMetrics.map((row) => (
                    <Col key={row.key}>
                        <Statistic
                            title={row.metric}
                            value={(row.value || '0').toLocaleString('en-US')}
                            loading={deadLetterQueueMetricsLoading}
                        />
                    </Col>
                ))}
            </Row>

            <Divider />

            {tableMetrics.map((row) => (
                <div key={row.key}>
                    <h2>{row.metric}</h2>
                    <LemonTable
                        columns={[
                            {
                                title: row.subrows?.columns[0],
                                dataIndex: 'key',
                            },
                            {
                                title: row.subrows?.columns[1],
                                dataIndex: 'value',
                            },
                        ]}
                        dataSource={rowsPerMetric[row.key].map(([key, value]) => ({ key, value })) || []}
                        loading={deadLetterQueueMetricsLoading}
                        defaultSorting={{
                            columnKey: 'value',
                            order: -1,
                        }}
                        embedded
                    />
                    <div className="m-4 text-center">
                        <Button
                            disabled={rowsPerMetric[row.key].length % ROWS_LIMIT !== 0}
                            onClick={() => loadMoreRows(row.key)}
                        >
                            Load more values
                        </Button>
                    </div>
                    <Divider />
                </div>
            ))}
        </div>
    )
}
