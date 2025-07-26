import React, { useState, useMemo, useRef, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, Plus, Eye, BarChart3 } from 'lucide-react'
import MiniInfoModal from '../MiniInfoModal'
import 'react-loading-skeleton/dist/skeleton.css'
import './styles.css'
import TableSkeleton from '../TableSkeleton'
import ModalDelete from '../ModalDelete'
import useTablePreviewAux from '../../hooks/useTablePreviewAux'
import { useTheme } from '../../context/ThemeProvider'
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
  const targetRowRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { actualTheme } = useTheme()

  const { findTotalColor } = useTablePreviewAux()
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
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
    event: React.MouseEvent<HTMLDivElement | HTMLTableCellElement>,
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

      // Determine balance color and icon
      const totalValue = parseFloat(row.total.value || '0')
      const isPositive = totalValue > 0
      const isNegative = totalValue < 0
      
      const balanceColor = isPositive 
        ? 'text-green-600 dark:text-green-400' 
        : isNegative 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-gray-600 dark:text-gray-400'
      
      const balanceIcon = isPositive 
        ? <TrendingUp size={16} className="inline mr-1" /> 
        : isNegative 
        ? <TrendingDown size={16} className="inline mr-1" /> 
        : null

      if (viewMode === 'cards') {
        return (
          <div
            key={row.formatted_date}
            ref={row.isToday ? targetRowRef : null}
            className={`group relative bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1 ${
              row.isToday 
                ? 'border-teal-500 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 shadow-lg' 
                : 'border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600'
            }`}
          >
            {/* Today Badge */}
            {row.isToday && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                Hoje
              </div>
            )}
            
            {/* Date Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {row.formatted_date}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(row.date).toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-lg transition-colors"
                  title="Ver detalhes"
                >
                  <Eye size={14} className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
                </button>
                <button 
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-teal-100 dark:hover:bg-teal-800 rounded-lg transition-colors"
                  title="Adicionar transação"
                >
                  <Plus size={14} className="text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400" />
                </button>
              </div>
            </div>

            {/* Financial Data Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Income */}
              <div 
                className="relative cursor-pointer p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 1)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">
                    Entradas
                  </span>
                </div>
                <p className="font-semibold text-green-700 dark:text-green-300 text-sm">
                  {row.incomes?.valueFormatted || 'R$ 0,00'}
                </p>
                
                {hoveredCell?.rowIndex === rowIndex && hoveredCell?.colIndex === 1 && (
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
              </div>

              {/* Outcome */}
              <div 
                className="relative cursor-pointer p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 2)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">
                    Saídas
                  </span>
                </div>
                <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                  {row.outcomes?.valueFormatted || 'R$ 0,00'}
                </p>
                
                {hoveredCell?.rowIndex === rowIndex && hoveredCell?.colIndex === 2 && (
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
              </div>

              {/* Balance */}
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 size={14} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                    Saldo
                  </span>
                </div>
                <p className={`font-bold text-sm flex items-center ${balanceColor}`}>
                  {balanceIcon}
                  {row.total.valueFormatted}
                </p>
              </div>
            </div>

            {/* Progress bar for visual balance */}
            {(row.incomes?.value || row.outcomes?.value) && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Entradas vs Saídas</span>
                  <span>{Math.abs(totalValue) > 0 ? (isPositive ? '+' : '') + totalValue.toFixed(2) : '0.00'}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isPositive ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${Math.min(Math.abs(totalValue) / 1000 * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )
      }

      // Table view (original layout but improved)
      return (
        <tr
          key={row.formatted_date}
          ref={row.isToday ? targetRowRef : null}
          className={`relative transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800 ${
            row.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''
          }`}
        >
          <td className={`sticky left-0 ${row.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : 'bg-white dark:bg-gray-900'} text-sm text-center font-medium h-14 p-3 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200`}>
            {row.formatted_date}
          </td>
          <td
            className={`text-sm text-center ${row.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''} hover:cursor-pointer group hover:bg-green-50 dark:hover:bg-green-900/20 h-14 p-3 transition-colors border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200`}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 1)}
            onMouseLeave={handleMouseLeave}
          >
            {row.incomes?.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex && hoveredCell?.colIndex === 1 && (
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
            className={`text-sm text-center ${row.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''} hover:cursor-pointer group hover:bg-red-50 dark:hover:bg-red-900/20 h-14 p-3 transition-colors border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200`}
            onMouseEnter={(e) => handleMouseEnter(e, rowIndex, 2)}
            onMouseLeave={handleMouseLeave}
          >
            {row.outcomes?.valueFormatted}
            {hoveredCell?.rowIndex === rowIndex && hoveredCell?.colIndex === 2 && (
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
          <td className={`${balanceColor} ${row.isToday ? 'bg-teal-50 dark:bg-teal-900/20' : ''} font-semibold text-sm text-center h-14 p-3 border-b border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-center">
              {balanceIcon}
              {row.total.valueFormatted}
            </div>
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
    viewMode,
  ])

  return (
    <>
      {rows.length > 0 ? (
        <div className="w-full">
          {/* Header with View Toggle */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <BarChart3 size={20} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Visão Financeira</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acompanhe suas transações diárias</p>
              </div>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                  Cards
                </div>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-3 h-0.5 bg-current rounded"></div>
                    <div className="w-3 h-0.5 bg-current rounded"></div>
                    <div className="w-3 h-0.5 bg-current rounded"></div>
                  </div>
                  Tabela
                </div>
              </button>
            </div>
          </div>

          {/* Content Container */}
          <div
            ref={tableContainerRef}
            className="w-full flex flex-auto relative"
          >
            {viewMode === 'cards' ? (
              <div className="w-full grid gap-4 auto-rows-min">
                {memoizedTransactions}
              </div>
            ) : (
              <div className="w-full overflow-auto">
                <table className="min-w-640 sm:w-full h-full text-left bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="sticky top-0 left-0 z-20 sm:z-10 text-center p-4 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                        Data
                      </th>
                      <th className="sticky top-0 z-10 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                        Entradas
                      </th>
                      <th className="sticky top-0 z-10 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                        Saídas
                      </th>
                      <th className="sticky top-0 z-10 text-center text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                        Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody>{memoizedTransactions}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <TableSkeleton />
      )}

      {openModal.isOpen && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-96 rounded-xl shadow-2xl p-6 relative border border-gray-200 dark:border-gray-700">
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
