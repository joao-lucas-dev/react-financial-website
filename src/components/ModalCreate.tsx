import { ChangeEvent, useCallback, useEffect } from 'react'
import {
  IHandleCreateCompleteTransaction,
  IOpenModal,
  ISetCurrentMonth,
  ISetOpenModal,
  ITransaction,
} from '../types/transactions.ts'
import Input from './Input.tsx'
import Button from './Button.tsx'
import { X } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import SelectInput from './SelectInput.tsx'
import { ICategory } from '../types/categories.ts'

interface IParams {
  openModal: IOpenModal
  setOpenModal: ISetOpenModal
  handleCreateCompleteTransaction: IHandleCreateCompleteTransaction
  currentMonth: number
  setCurrentMonth: ISetCurrentMonth
  categories: ICategory[]
}

const modalEditSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatorio'),
  transaction_day: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data é obrigatória e deve ser uma data válida',
  }),
  category: z.string().min(1, 'Categoria é obrigatória'),
  recurrence: z.string().min(1, 'Recorrência é obrigatória'),
})

type ModalCreateData = z.infer<typeof modalEditSchema>

const ModalCreate = ({
  openModal,
  setOpenModal,
  handleCreateCompleteTransaction,
  currentMonth,
  setCurrentMonth,
  categories,
}: IParams) => {
  const getType = useCallback(() => {
    if (openModal.button === 'income') return 'entrada'

    if (openModal.button === 'outcome') return 'saída'
  }, [openModal.button])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm<ModalCreateData>({
    resolver: zodResolver(modalEditSchema),
  })

  useEffect(() => {
    setValue('transaction_day', new Date().toISOString().split('T')[0])
    setValue('recurrence', 'false')
  }, [setValue])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value.replace(/\D/g, '')

      if (inputValue) {
        const originalValue = Number(inputValue) / 100
        const formattedValue = originalValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        setValue('price', formattedValue)
      } else {
        setValue('price', '')
      }
    },
    [setValue],
  )

  const handleCreate = useCallback(
    async (data: ModalCreateData) => {
      try {
        const createTransaction = {
          type: openModal.button,
          description: data.description,
          price: Number(data.price.replace(/\D/g, '')) / 100,
          category_id: Number(data.category),
          transaction_day: new Date(`${data.transaction_day}T00:00:00`),
          shared_id: null,
          is_recurring: data.recurrence === 'true',
        } as unknown as ITransaction

        await handleCreateCompleteTransaction(
          createTransaction,
          currentMonth,
          setCurrentMonth,
        )

        setOpenModal({
          isOpen: false,
          transaction: {} as ITransaction,
          type: '',
        })
      } catch (err) {
        console.error(err)
      }
    },
    [
      handleCreateCompleteTransaction,
      openModal.transaction,
      setOpenModal,
      currentMonth,
      setCurrentMonth,
    ],
  )

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={e => {
      if (e.target === e.currentTarget) {
        setOpenModal({
          isOpen: false,
          transaction: {} as ITransaction,
          type: '',
        })
      }
    }}>
      <div className="bg-white dark:bg-black-bg w-[490px] rounded-lg shadow-lg p-6 relative">
        <div className="flex justify-between  dark:text-softGray">
          <h2 className="text-lg font-semibold">Criar {getType()}</h2>
          <button
            onClick={() => {
              setOpenModal({
                isOpen: false,
                transaction: {} as ITransaction,
                type: '',
              })
            }}
          >
            <X />
          </button>
        </div>
        <div>
          <form onSubmit={handleSubmit(handleCreate)}>
            <Input
              label="Descrição"
              placeholder="Insira um descrição"
              required={true}
              {...register('description')}
            />
            <span className="text-red-500 my-4 text-sm">
              {errors.description?.message}
            </span>

            <div className="flex justify-between items-center">
              <div className="w-[200px]">
                <Input
                  label="Valor"
                  placeholder="R$ 0,00"
                  required={true}
                  {...register('price')}
                  onChange={handleChange}
                />
              </div>

              <div className="w-[200px]">
                <Input
                  label="Data"
                  type="date"
                  required={true}
                  {...register('transaction_day')}
                />
              </div>
            </div>
            <div className={`hidden row justify-between items-center ${errors.price || errors.transaction_day ? 'flex' : ''}`}>
              <span className="text-red-500 my-4 text-sm">
                {errors.price?.message}
              </span>
              <span className="text-red-500 my-4 text-sm">
                {errors.transaction_day?.message}
              </span>
            </div>

            {categories.length > 0 && (
              <Controller
                render={(field) => (
                  <SelectInput
                    {...field}
                    // @ts-expect-error TS2322
                    categories={
                      openModal.transaction.type === 'income'
                        ? categories.filter(
                            (cat) =>
                              cat.type === 'income' || cat.type === 'both',
                          )
                        : categories.filter((cat) => cat.type !== 'income')
                    }
                  />
                )}
                name="category"
                control={control}
              />
            )}

            <span className="text-red-500 my-4 text-sm">
              {errors.category?.message === 'Required'
                ? 'Selecione uma categoria'
                : errors.category?.message}
            </span>

            <div className="flex flex-col mt-4">
              <label className="text-md font-semibold text-gray dark:text-softGray">
                Recorrência mensal?
              </label>
              <select
                className="focus:outline-primary border border-softGray dark:bg-zinc-800 dark:border-zinc-700 dark:text-softGray h-12 rounded-lg mt-2 px-5"
                {...register('recurrence')}
              >
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>

            <Button title="Criar" type="submit" />
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalCreate
