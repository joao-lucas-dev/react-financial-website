import { ArrowLeft, Calendar } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Header from '../../components/Header'
import MenuAside from '../../components/MenuAside'
import ModalCreate from '../../components/ModalCreate'
import ModalDelete from '../../components/ModalDelete'
import ModalEdit from '../../components/ModalEdit'
import TransactionsListView from '../../components/TransactionsListView'

import { DateTime } from 'luxon'
import { useCategories } from '../../queries/categoriesQueries'
import { useCreditCards } from '../../queries/creditCardsQueries'
import {
  useCreateCompleteTransaction,
  useCreateInstallmentTransaction,
  useCreateRecurringTransaction,
  useDeleteInstallmentTransaction,
  useDeleteRecurringTransaction,
  useDeleteTransaction,
  useTransactionsPreview,
  useUpdateInstallmentTransaction,
  useUpdateRecurringTransaction,
  useUpdateTransaction,
} from '../../queries/transactionsQueries'
import { useDashboardStore } from '../../stores/dashboardStore'

import { IRow, ITransaction } from '../../types/transactions'

type DayDetailsState = {
  dayData: IRow
  initialFilter?: 'all' | 'income' | 'outcome'
}

const DayDetailsPage = () => {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: DayDetailsState }

  // Default filter is kept in the list view component

  // UI state and modal control
  const {
    openModal,
    setOpenModal,
  } = useDashboardStore()

  // Data required by modals
  const { data: categories = [], refetch: retryCategories } = useCategories()
  const { data: creditCards = [] } = useCreditCards()

  // Fetch day rows to keep data fresh when creating transactions
  const dayData = state?.dayData as IRow | undefined
  const dayRef = dayData ? DateTime.fromISO(dayData.date) : null
  const { data: dayRows = [], refetch: refetchDayRows } = dayRef
    ? (useTransactionsPreview as any)(dayRef, dayRef.startOf('day'), dayRef.endOf('day'))
    : { data: [], refetch: () => Promise.resolve() }

  // Mutations used by modals
  const deleteTransactionMutation = useDeleteTransaction()
  const updateTransactionMutation = useUpdateTransaction()
  const createCompleteTransactionMutation = useCreateCompleteTransaction()
  const createInstallmentTransactionMutation = useCreateInstallmentTransaction()
  const createRecurringTransactionMutation = useCreateRecurringTransaction()
  const updateRecurringTransactionMutation = useUpdateRecurringTransaction()
  const deleteRecurringTransactionMutation = useDeleteRecurringTransaction()
  const updateInstallmentTransactionMutation = useUpdateInstallmentTransaction()
  const deleteInstallmentTransactionMutation = useDeleteInstallmentTransaction()

  // Guard: if no state passed, return to previous page or transactions
  useEffect(() => {
    if (!state?.dayData) {
      // If we have a date param we could later fetch, for now just go back
      navigate(-1)
    }
  }, [state?.dayData, navigate])

  // Prefer fetched row if available; fallback to navigation state
  const effectiveRow: IRow | undefined = (dayRows && dayRows.length > 0) ? dayRows[0] : dayData

  // Transactions and quick actions handled inside TransactionsListView

  // Modal handlers (same signatures as other pages)
  const handleDeleteTransaction = async (id?: string) => {
    if (!id) return
    try { await deleteTransactionMutation.mutateAsync(id) } catch (err) { console.error(err) }
  }
  const handleUpdateTransaction = async (transaction: ITransaction) => {
    try { await updateTransactionMutation.mutateAsync(transaction) } catch (err) { console.error(err) }
  }
  const handleCreateCompleteTransaction = async (transaction: ITransaction) => {
    try {
      await createCompleteTransactionMutation.mutateAsync(transaction)
      await refetchDayRows()
    } catch (err) { console.error(err) }
  }
  const handleCreateInstallmentTransaction = async (transaction: ITransaction) => {
    try {
      await createInstallmentTransactionMutation.mutateAsync(transaction)
      await refetchDayRows()
    } catch (err) { console.error(err) }
  }
  const handleCreateRecurringTransaction = async (transaction: ITransaction) => {
    try {
      await createRecurringTransactionMutation.mutateAsync(transaction)
      await refetchDayRows()
    } catch (err) { console.error(err) }
  }
  const handleUpdateRecurringTransaction = async (
    transaction: ITransaction,
    editMode: 'instance_only' | 'instance_and_future' | 'all_instances' = 'instance_only'
  ) => {
    try { await updateRecurringTransactionMutation.mutateAsync({ transaction, editMode }) } catch (err) { console.error(err) }
  }
  const handleDeleteRecurringTransaction = async (
    id: string,
    editMode: 'instance_only' | 'instance_and_future' | 'all_instances' = 'instance_only'
  ) => {
    try { await deleteRecurringTransactionMutation.mutateAsync({ id, editMode }) } catch (err) { console.error(err) }
  }
  const handleUpdateInstallmentTransaction = async (
    transaction: ITransaction,
    editMode: 'installment_only' | 'installment_and_future' | 'all_installments' = 'installment_only'
  ) => {
    try { await updateInstallmentTransactionMutation.mutateAsync({ transaction, editMode }) } catch (err) { console.error(err) }
  }
  const handleDeleteInstallmentTransaction = async (
    id: string,
    editMode: 'installment_only' | 'installment_and_future' | 'all_installments' = 'installment_only'
  ) => {
    try { await deleteInstallmentTransactionMutation.mutateAsync({ id, editMode }) } catch (err) { console.error(err) }
  }

  if (!effectiveRow) return null

  return (
    <div className="min-h-screen w-full bg-zinc-100 dark:bg-zinc-900 transition-colors">
      <Header title="Detalhes do Dia" activePage="transacoes" />
      <div className="flex min-h-screen pt-4">
        <MenuAside activePage="transacoes" />

        <main className="flex-1 mt-4 pl-0 lg:pl-20 2xl:pl-72 max-w-7xl mx-auto p-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const from = (state as any)?.from
                  if (from?.path) {
                    navigate(from.path, { state: { restoreScroll: from.scrollY } })
                  } else {
                    navigate(-1)
                  }
                }}
                aria-label="Voltar"
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-4xl font-bold text-zinc-700 dark:text-zinc-200 leading-tight">
                Detalhes do Dia
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <Calendar size={18} className="text-teal-600 dark:text-teal-400" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {new Date(`${dayData?.date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' })},
                </div>
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {new Date(`${dayData?.date}T00:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* List-mode view reused from /transacoes */}
          <TransactionsListView
            rows={[effectiveRow]}
            setOpenModal={setOpenModal}
            categories={categories}
            handleCreateTransaction={handleCreateCompleteTransaction}
            handleUpdateTransaction={handleUpdateTransaction}
            handleDeleteTransaction={(id: string) => handleDeleteTransaction(id)}
            currentMonth={new Date().getMonth() + 1}
            setCurrentMonth={() => {}}
          />

          {/* Modais controlados por Dashboard store */}
          {openModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {openModal.type === 'edit' ? (
                  <ModalEdit
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    handleUpdateTransaction={handleUpdateTransaction}
                    handleUpdateInstallmentTransaction={handleUpdateInstallmentTransaction}
                    handleUpdateRecurringTransaction={handleUpdateRecurringTransaction}
                    handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
                    currentMonth={new Date().getMonth() + 1}
                    setCurrentMonth={() => {}}
                    categories={categories}
                    creditCards={creditCards}
                    from={'day-details'}
                    retryCategories={retryCategories}
                  />
                ) : openModal.type === 'delete' ? (
                  <ModalDelete
                    setOpenModal={setOpenModal}
                    openModal={openModal}
                    handleDeleteTransaction={handleDeleteTransaction}
                    handleDeleteRecurringTransaction={handleDeleteRecurringTransaction}
                    handleDeleteInstallmentTransaction={handleDeleteInstallmentTransaction}
                    currentMonth={new Date().getMonth() + 1}
                    setCurrentMonth={() => {}}
                    from={'day-details'}
                  />
                ) : (
                  <ModalCreate
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    handleCreateRecurringTransaction={handleCreateRecurringTransaction}
                    handleCreateInstallmentTransaction={handleCreateInstallmentTransaction}
                    handleCreateCompleteTransaction={handleCreateCompleteTransaction}
                    creditCards={creditCards}
                    currentMonth={new Date().getMonth() + 1}
                    setCurrentMonth={() => {}}
                    categories={categories}
                    from={'day-details'}
                    retryCategories={retryCategories}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default DayDetailsPage
