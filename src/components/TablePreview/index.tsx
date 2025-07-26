import React, { useState, useMemo, useRef, useEffect } from 'react'
import MiniInfoModal from '../MiniInfoModal'
import 'react-loading-skeleton/dist/skeleton.css'
import './styles.css'
import TableSkeleton from '../TableSkeleton'
import ModalDelete from '../ModalDelete'
import useTablePreviewAux from '../../hooks/useTablePreviewAux'
import {
  IHandleCreateCompleteTransaction,
  IHandleCreateTransaction,
  IHandleDeleteTransaction,
  IHandleUpdateTransaction,
  IOpenModal,
  IRow,
  ISetCurrentMonth,
  ISetOpenModal,
} from '../../types/transactions'
import ModalEdit from '../ModalEdit'
import ModalCreate from '../ModalCreate.tsx'

interface IParams {
  rows: IRow[]
  handleCreateTransaction: IHandleCreateTransaction
  handleCreateCompleteTransaction: IHandleCreateCompleteTransaction
  handleUpdateTransaction: IHandleUpdateTransaction
  handleDeleteTransaction: IHandleDeleteTransaction
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  categories: any[]
  from: string
  resetScroll?: boolean
}

const TablePreview = ({
  rows,
  handleCreateTransaction,
  handleCreateCompleteTransaction,
  handleDeleteTransaction,
  handleUpdateTransaction,
  currentMonth,
  setCurrentMonth,
  openModal,
  setOpenModal,
  categories,
  from = 'transacoes',
  resetScroll = false,
}: IParams) => {
  const targetRowRef = useRef<HTMLTableRowElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const { findTotalColor } = useTablePreviewAux()
  const [hoveredCell, setHoveredCell] = useState<{
    rowIndex: number
    colIndex: number
    tdRect: DOMRect | null
  } | null>(null)

  useEffect(() => {
    if (targetRowRef.current && tableContainerRef.current) {
      const rowTop = targetRowRef.current.offsetTop
      const containerHeight = tableContainerRef.current.clientHeight
      const rowHeight = targetRowRef.current.clientHeight

      tableContainerRef.current.scrollTo({
        top: rowTop - containerHeight / 2 + rowHeight / 2,
        behavior: 'smooth',
      })
    }
  }, [rows])

  useEffect(() => {
    if (resetScroll && tableContainerRef.current) {
      tableContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }, [resetScroll])

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLTableCellElement>,
    rowIndex: number,
    colIndex: number,
  ) => {
    const tdRect = event.currentTarget.getBoundingClientRect()
    setHoveredCell({ rowIndex, colIndex, tdRect })
  }

  const handleMouseLeave = () => {
    setHoveredCell(null)
  }

  const memoizedTransactions = useMemo(() => {
    return rows.map((row: IRow, rowIndex: number) => {
      const color = findTotalColor(row)

      const today = new Date()
      today.setHours(0, 0, 0)
      const transactionDate = new Date(`${row.date}T00:00:00`)

      if (transactionDate.toDateString() === today.toDateString()) {
        row.isToday = true
      }

      return (
        <tr
          key={row.formatted_date}
          ref={row.isToday ? targetRowRef : null}
          className="relative"
        >
          <td
            className={`sticky left-0 ${row.isToday ? 'bg-blue-50' : 'bg-white'} text-sm text-center font-medium h-[56px] p-2`}
            style={{
              borderBottom: '1px solid #E0E0E0',
              color: '#424242'
            }}
          >
            {row.formatted_date}
          </td>
          <td
            className={`text-sm text-center ${row.isToday ? 'bg-blue-50' : ''} hover:cursor-pointer group hover:border border-zinc-200 h-[56px] p-2 transition-colors`}
            style={{
              borderBottom: '1px solid #E0E0E0',
              color: '#424242'
            }}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 1)}
            onMouseLeave={handleMouseLeave}
          >
            {row.incomes?.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex &&
              hoveredCell?.colIndex === 1 && (
                <MiniInfoModal
                  handleCreateTransaction={(value, setValue) =>
                    handleCreateTransaction(
                      'incomes',
                      row,
                      value,
                      setValue,
                      currentMonth,
                      setCurrentMonth,
                      from,
                    )
                  }
                  transactions={row.incomes.transactions}
                  type="income"
                  setOpenModal={setOpenModal}
                  tdRect={hoveredCell?.tdRect}
                />
              )}
          </td>
          <td
            className={`text-sm text-center ${row.isToday ? 'bg-blue-50' : ''} hover:cursor-pointer group hover:border border-zinc-200 h-[56px] p-2 transition-colors`}
            style={{
              borderBottom: '1px solid #E0E0E0',
              color: '#424242'
            }}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 2)}
            onMouseLeave={handleMouseLeave}
          >
            {row.outcomes?.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex &&
              hoveredCell?.colIndex === 2 && (
                <MiniInfoModal
                  handleCreateTransaction={(value, setValue) =>
                    handleCreateTransaction(
                      'outcomes',
                      row,
                      value,
                      setValue,
                      currentMonth,
                      setCurrentMonth,
                      from,
                    )
                  }
                  transactions={row.outcomes.transactions}
                  type="outcome"
                  setOpenModal={setOpenModal}
                  tdRect={hoveredCell?.tdRect}
                />
              )}
          </td>
          <td
            className={`${color} ${row.isToday ? 'bg-blue-50' : ''} font-semibold text-sm text-center h-[56px] p-2`}
            style={{
              borderBottom: '1px solid #E0E0E0'
            }}
          >
            {row.total.valueFormatted}
          </td>
        </tr>
      )
    })
  }, [
    rows,
    findTotalColor,
    setOpenModal,
    handleCreateTransaction,
    hoveredCell,
    currentMonth,
    setCurrentMonth,
    from,
  ])

  return (
    <>
      {rows.length > 0 ? (
        <div
          ref={tableContainerRef}
          className="w-full flex flex-auto relative"
        >
          <table className="min-w-640 sm:w-full h-full text-left">
            <thead>
              <tr>
                <th 
                  className="sticky top-0 left-0 z-20 sm:z-10 rounded-tl-lg text-center p-4 text-sm font-medium"
                  style={{ 
                    backgroundColor: '#F5F5F5',
                    color: '#616161',
                    borderBottom: '1px solid #E0E0E0'
                  }}
                >
                  Data
                </th>
                <th 
                  className="sticky top-0 z-10 text-center text-sm font-medium"
                  style={{ 
                    backgroundColor: '#F5F5F5',
                    color: '#616161',
                    borderBottom: '1px solid #E0E0E0'
                  }}
                >
                  Entradas
                </th>
                <th 
                  className="sticky top-0 z-10 text-center text-sm font-medium"
                  style={{ 
                    backgroundColor: '#F5F5F5',
                    color: '#616161',
                    borderBottom: '1px solid #E0E0E0'
                  }}
                >
                  Saídas
                </th>
                <th 
                  className="sticky top-0 z-10 rounded-tr-lg text-center text-sm font-medium"
                  style={{ 
                    backgroundColor: '#F5F5F5',
                    color: '#616161',
                    borderBottom: '1px solid #E0E0E0'
                  }}
                >
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>{memoizedTransactions}</tbody>
          </table>
        </div>
      ) : (
        <TableSkeleton />
      )}

      {openModal.isOpen && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-96 rounded-lg shadow-lg p-6 relative">
            {openModal.type === 'edit' ? (
              <ModalEdit
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleUpdateTransaction={handleUpdateTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                categories={categories}
                from={from}
              />
            ) : openModal.type === 'delete' ? (
              <ModalDelete
                setOpenModal={setOpenModal}
                openModal={openModal}
                handleDeleteTransaction={handleDeleteTransaction}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                from={from}
              />
            ) : (
              <ModalCreate
                openModal={openModal}
                setOpenModal={setOpenModal}
                handleCreateCompleteTransaction={
                  handleCreateCompleteTransaction
                }
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                categories={categories}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default TablePreview
