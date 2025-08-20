import React, { useMemo, useState, useEffect } from 'react'
import 'react-loading-skeleton/dist/skeleton.css'
import CategoryIcon from '../CategoryIcon'
import { EllipsisVertical, Search, MessageCircleQuestion, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react'
import './styles.css'
import { DateTime } from 'luxon'
import { typeMap } from '../../common/constants'
import ModalEdit from '../ModalEdit.tsx'
import ModalDelete from '../ModalDelete.tsx'
import { ITransaction } from '../../types/transactions'
import { ICreditCard } from '../../types/creditCards'

interface TableRecentTransactionsProps {
  recentTransactions: ITransaction[]
  onSort?: (field: string, order: 'asc' | 'desc') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  openModal: {
    isOpen: boolean
    transaction: ITransaction
    type: string
  }
  setOpenModal: React.Dispatch<React.SetStateAction<{
    isOpen: boolean
    transaction: ITransaction
    type: string
  }>>
  handleUpdateTransaction: any
  handleDeleteTransaction: any
  handleUpdateRecurringTransaction?: any
  handleDeleteRecurringTransaction?: any
  handleUpdateInstallmentTransaction?: any
  handleDeleteInstallmentTransaction?: any
  handleDeleteMultipleTransactions: any
  currentMonth: number
  setCurrentMonth: any
  categories: any[]
  creditCards: ICreditCard[]
  from: string
  searchTerm?: string
  retryCategories?: () => void
}

const ITEMS_PER_PAGE = 10;

const TableRecentTransactions = ({ recentTransactions, onSort, sortBy, sortOrder, openModal, setOpenModal, handleUpdateTransaction, handleDeleteTransaction, handleUpdateRecurringTransaction, handleDeleteRecurringTransaction, handleUpdateInstallmentTransaction, handleDeleteInstallmentTransaction, handleDeleteMultipleTransactions, currentMonth, setCurrentMonth, categories, creditCards, from, searchTerm = '', retryCategories }: TableRecentTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Função para calcular status de pagamento automático baseado na data
  const getAutoPaymentStatus = (transactionDate: string | Date) => {
    const today = new Date()
    const transDate = new Date(transactionDate)
    
    today.setHours(0, 0, 0, 0)
    transDate.setHours(0, 0, 0, 0)
    
    if (transDate < today) return 'paid'    // Passado = pago
    if (transDate > today) return 'unpaid'  // Futuro = não pago
    return 'pending'                        // Hoje = pendente
  }

  // Função para obter ícone de status de pagamento
  const getPaymentStatusIcon = (transaction: ITransaction) => {
    const status = transaction.payment_status || getAutoPaymentStatus(transaction.transaction_day)
    
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'unpaid':
      default:
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [recentTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return recentTransactions;
    return recentTransactions.filter(t =>
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentTransactions, searchTerm]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredTransactions.slice(start, end);
  }, [filteredTransactions, currentPage]);

  const allChecked = paginatedTransactions.length > 0 && paginatedTransactions.every(t => t.id && selectedIds.includes(t.id));

  const handleCheckAll = () => {
    if (allChecked) {
      setSelectedIds(selectedIds.filter(id => !paginatedTransactions.some(t => t.id === id)));
    } else {
      setSelectedIds([
        ...selectedIds,
        ...paginatedTransactions
          .map(t => t.id)
          .filter((id): id is string => !!id && !selectedIds.includes(id))
      ]);
    }
  };

  const handleCheck = (id?: string) => {
    if (!id) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    await handleDeleteMultipleTransactions(selectedIds, currentMonth, setCurrentMonth, from);
    setSelectedIds([]);
    setShowBulkDeleteModal(false);
  };

  const memoizedTransactions = useMemo(() => {
    const getTag = (type: string) => {
      const item = typeMap.get(type)

      return (
        <div className="w-full h-full flex justify-center items-center">
          <div
            className={`${item?.bgColor} min-w-[68px] px-3 py-1 rounded text-white flex justify-center items-center text-xs`}
          >
            {item?.title}
          </div>
        </div>
      )
    }

    return (
      paginatedTransactions.length > 0 &&
      paginatedTransactions.map((recentTransaction: ITransaction) => {
        const formattedPrice = Number(recentTransaction.price).toLocaleString(
          'pt-BR',
          {
            style: 'currency',
            currency: 'BRL',
          },
        )

        const formattedDate = DateTime.fromISO(
          typeof recentTransaction.transaction_day === 'string' ? recentTransaction.transaction_day : '',
        )
          .setZone('America/Sao_Paulo')
          .setLocale('pt-BR')
          .toFormat('dd LLL yy')

        const formattedUpdatedDate = (() => {
          try {
            if (recentTransaction.updated_at) {
              return DateTime.fromISO(recentTransaction.updated_at)
                .setZone('America/Sao_Paulo')
                .toFormat('dd/MM/yyyy')
            }
            if (recentTransaction.created_at) {
              return DateTime.fromISO(recentTransaction.created_at)
                .setZone('America/Sao_Paulo')
                .toFormat('dd/MM/yyyy')
            }
            return 'Data não disponível'
          } catch (error) {
            return 'Data inválida'
          }
        })()
        return (
          <tr key={recentTransaction.id} className="relative bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-200 hover:shadow-sm group">
            <td className="p-4 text-sm font-medium h-16 text-center border-b border-zinc-100 dark:border-zinc-700">
              <label className="checkbox-orange">
                <input
                  type="checkbox"
                  checked={!!recentTransaction.id && selectedIds.includes(recentTransaction.id)}
                  onChange={() => handleCheck(recentTransaction.id)}
                />
                <span className="custom-check">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 8.5L7 11.5L12 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </label>
            </td>
            <td className="p-4 text-sm font-medium h-16 border-b border-zinc-100 dark:border-zinc-700">
              <div className="flex justify-center items-center">
                {recentTransaction.category ? (
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-600 flex items-center justify-center transition-all duration-200 group-hover:bg-teal-50 dark:group-hover:bg-teal-900">
                    <CategoryIcon
                      category={{
                        iconName: recentTransaction.category.iconName,
                        color: recentTransaction.category.color,
                        icon_name: recentTransaction.category.icon_name,
                        id: recentTransaction.category.id,
                        name: recentTransaction.category.name,
                        type: recentTransaction.category.type,
                      }}
                      size="large"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-600 flex items-center justify-center">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">N/A</span>
                  </div>
                )}
              </div>
            </td>
            <td className="w-60 p-4 text-center text-sm h-16 border-b border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center justify-center gap-2">
                {(recentTransaction.fromCreditCard || recentTransaction.card_id) && (
                  <CreditCard className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                )}
                <div className="text-zinc-700 dark:text-zinc-200 font-medium truncate">
                  {recentTransaction.description}
                  {recentTransaction.parent_transaction_id && recentTransaction.installment_count && recentTransaction.installment_all && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {recentTransaction.installment_count}/{recentTransaction.installment_all}
                    </span>
                  )}
                  {recentTransaction.is_recurring && (
                    <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                      ↻
                    </span>
                  )}
                </div>
              </div>
            </td>
            <td className="p-4 text-center text-sm h-16 border-b border-zinc-100 dark:border-zinc-700">
              <div className={`font-semibold ${
                Number(recentTransaction.price) >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formattedPrice}
              </div>
            </td>
            <td className="p-4 text-center text-sm h-16 border-b border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center justify-center gap-2">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {formattedDate}
                </span>
                {getPaymentStatusIcon(recentTransaction)}
              </div>
            </td>
            <td className="p-4 text-center text-sm h-16 border-b border-zinc-100 dark:border-zinc-700">
              <div className="text-zinc-600 dark:text-zinc-400">
                {formattedUpdatedDate}
              </div>
            </td>
            <td className="p-4 text-center text-sm h-16 border-b border-zinc-100 dark:border-zinc-700">
              {getTag(recentTransaction.type || '')}
            </td>
            <td className="p-4 text-center text-sm h-16 border-b border-zinc-100 dark:border-zinc-700">
              <div className="relative">
                <div className="button-config justify-center items-center px-2">
                  <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors">
                    <EllipsisVertical
                      size={18}
                      className="text-zinc-600 dark:text-zinc-400"
                    />
                  </button>

                  <div className="absolute z-20 bottom-5 right-0 mt-2 w-32 bg-white dark:bg-zinc-800 shadow-lg rounded-xl border border-zinc-200 dark:border-zinc-600 overflow-hidden">
                    <button
                      className="w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200 flex items-center gap-2"
                      onClick={() => setOpenModal({ isOpen: true, transaction: recentTransaction, type: 'edit' })}
                    >
                      Editar
                    </button>
                    <button
                      className="w-full px-4 py-3 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 flex items-center gap-2"
                      onClick={() => setOpenModal({ isOpen: true, transaction: recentTransaction, type: 'delete' })}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )
      })
    )
  }, [paginatedTransactions, setOpenModal, selectedIds])

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md text-sm font-medium transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center gap-2"
            onClick={() => setShowBulkDeleteModal(true)}
          >
            Excluir {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-zinc-800 w-96 rounded-xl shadow-2xl p-6 relative border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-lg font-semibold mb-6 text-center text-zinc-700 dark:text-zinc-200">
              Deseja realmente excluir {selectedIds.length} transaç{selectedIds.length > 1 ? 'ões' : 'ão'}?
            </h2>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-6 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                Sim, excluir!
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex flex-auto relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
        <div className="w-full min-h-16">
          <table className="min-w-640 sm:w-full h-full text-left">
            <thead>
              <tr className="bg-white dark:bg-zinc-800">
                <th className="sticky top-0 z-10 text-center rounded-tl-xl p-4 text-sm font-medium w-12 bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600">
                  <label className="checkbox-orange">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={handleCheckAll}
                    />
                    <span className="custom-check">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 8.5L7 11.5L12 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </label>
                </th>
                <th className="sticky top-0 z-10 text-center p-4 text-sm font-medium bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600">
                  Categoria
                </th>
                <th className="sticky top-0 z-10 text-center text-sm font-medium bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600">
                  Descrição
                </th>
                <th
                  className="sticky top-0 z-10 text-center text-sm font-medium cursor-pointer select-none bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200"
                  onClick={() => onSort && onSort('price', sortBy === 'price' ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc')}
                >
                  Valor
                  {sortBy === 'price' && (
                    <span className="text-teal-600 dark:text-teal-400">{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th
                  className="sticky top-0 z-10 text-center text-sm font-medium cursor-pointer select-none bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200"
                  onClick={() => onSort && onSort('transaction_day', sortBy === 'transaction_day' ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc')}
                >
                  Dia
                  {sortBy === 'transaction_day' && (
                    <span className="text-teal-600 dark:text-teal-400">{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th
                  className="sticky top-0 z-10 text-center text-sm font-medium cursor-pointer select-none bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-200"
                  onClick={() => onSort && onSort('updated_at', sortBy === 'updated_at' ? (sortOrder === 'desc' ? 'asc' : 'desc') : 'desc')}
                >
                  Última modificação
                  {sortBy === 'updated_at' && (
                    <span className="text-teal-600 dark:text-teal-400">{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
                <th className="sticky top-0 z-10 text-center text-sm font-medium bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600">
                  Tipo
                </th>
                <th className="sticky top-0 z-10 text-center rounded-tr-xl text-sm font-medium bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-600">
                  Ações
                </th>
              </tr>
            </thead>
            {filteredTransactions.length > 0 ? (
              <tbody>{memoizedTransactions}</tbody>
            ) : (
              <tbody>
                <tr className="bg-white dark:bg-zinc-800">
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                        <MessageCircleQuestion className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-zinc-400 dark:text-zinc-500">Nenhuma transação encontrada</p>
                        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Adicione sua primeira transação para começar!</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
      {/* Pagination Controls */}
      {filteredTransactions.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-6 p-4">
          <button
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === i + 1 
                  ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' 
                  : 'border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-600 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
          <span className="ml-4 text-sm text-zinc-500 dark:text-zinc-400">Página {currentPage} de {totalPages}</span>
        </div>
      )}
      {/* Modais de Editar/Excluir */}
      {openModal.isOpen && openModal.type === 'edit' && (
        <ModalEdit
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleUpdateTransaction={handleUpdateTransaction}
          handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
          handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
          handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          categories={categories}
          creditCards={creditCards}
          from={from}
          retryCategories={retryCategories}
        />
      )}
      {openModal.isOpen && openModal.type === 'delete' && (
        <ModalDelete
          openModal={openModal}
          setOpenModal={setOpenModal}
          handleDeleteTransaction={handleDeleteTransaction}
          handleDeleteRecurringTransaction={handleDeleteRecurringTransaction}
          handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
          from={from}
        />
      )}
    </>
  )
}

export default TableRecentTransactions
