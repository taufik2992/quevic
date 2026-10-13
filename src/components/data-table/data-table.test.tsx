// Node 24+: node --import tsx --experimental-test-module-mocks --test src/components/data-table/data-table.test.tsx
import assert from 'node:assert/strict'
import { after, beforeEach, describe, it, mock } from 'node:test'
import { createColumnHelper } from '@tanstack/react-table'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ComponentProps } from 'react'
import type { DataTableFeatures } from '#/components/data-table/data-table-features'
import * as TablePrimitives from '#/components/ui/table'

// Capture only the row boundary. Rendering uses the real TanStack Table,
// React hooks and table primitives; no browser or synthetic table model.
const renderedRows: ComponentProps<'tr'>[] = []
const tableModule = mock.module(import.meta.resolve('#/components/ui/table'), {
  namedExports: {
    ...TablePrimitives,
    TableRow: (props: ComponentProps<'tr'>) => {
      renderedRows.push(props)
      return <TablePrimitives.TableRow {...props} />
    },
  },
})
const { DataTable } = await import('#/components/data-table/data-table')
after(() => tableModule.restore())
beforeEach(() => {
  renderedRows.length = 0
})

type Row = { id: string; name: string }
const helper = createColumnHelper<DataTableFeatures, Row>()
const columns = helper.columns([helper.accessor('name', { header: 'Name' })])
const data = [
  { id: 'one', name: 'Acme' },
  { id: 'two', name: 'Other' },
]

describe('data table row interactions added for clients', () => {
  it('passes each original row to its click callback and leaves the header inert', () => {
    const onRowClick = mock.fn((_row: Row) => undefined)
    const html = renderToStaticMarkup(
      <DataTable columns={columns} data={data} onRowClick={onRowClick} />,
    )
    assert.match(html, /Acme/)
    assert.match(html, /Other/)
    assert.equal(renderedRows[0].onClick, undefined)
    const bodyRows = renderedRows.slice(1)
    assert.equal(bodyRows.length, 2)
    for (const [index, props] of bodyRows.entries()) {
      assert.ok(props.className?.includes('cursor-pointer'))
      // The callback installed by DataTable does not consume the click event.
      const click = props.onClick as () => void
      click()
      assert.equal(onRowClick.mock.calls[index].arguments[0], data[index])
    }
  })

  it('does not install click handlers or pointer styles without onRowClick', () => {
    renderToStaticMarkup(<DataTable columns={columns} data={data} />)
    for (const props of renderedRows.slice(1)) {
      assert.equal(props.onClick, undefined)
      assert.equal(props.className?.includes('cursor-pointer') ?? false, false)
    }
  })

  it('marks only rows accepted by the selection predicate', () => {
    const selected = mock.fn((row: Row) => row.id === 'two')
    renderToStaticMarkup(
      <DataTable columns={columns} data={data} isRowSelected={selected} />,
    )
    assert.equal(
      renderedRows[1].className?.includes('bg-primary/6') ?? false,
      false,
    )
    assert.ok(renderedRows[2].className?.includes('bg-primary/6'))
    assert.deepEqual(
      selected.mock.calls.map((call) => call.arguments[0]),
      data,
    )
  })

  it('keeps the empty state inert even when row interaction props are supplied', () => {
    const onRowClick = mock.fn((_row: Row) => undefined)
    const selected = mock.fn((_row: Row) => true)
    const html = renderToStaticMarkup(
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No clients found"
        onRowClick={onRowClick}
        isRowSelected={selected}
      />,
    )
    assert.match(html, /No clients found/)
    for (const props of renderedRows) assert.equal(props.onClick, undefined)
    assert.equal(onRowClick.mock.callCount(), 0)
    assert.equal(selected.mock.callCount(), 0)
  })
})
