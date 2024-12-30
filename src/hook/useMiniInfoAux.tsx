import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from 'react'

import { ITransaction, IItem } from '../types/transactions.ts'
import useDashboardContext from './useDashboardContext'

export default function useMiniInfoAux() {
  const animationRef = useRef<number | null>(null)
  const scrollDescriptionRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const modalRef = useRef<HTMLDivElement>(null)

  const { setTransactions, transactions } = useDashboardContext()

  const [value, setValue] = useState({
    formattedValue: '',
    originalValue: 0,
  })
  const [isClipped, setIsClipped] = useState(false)

  const smoothScroll = useCallback(
    (
      element: HTMLParagraphElement,
      start: number,
      end: number,
      duration: number,
      onComplete?: () => void,
    ) => {
      const startTime = performance.now()
      const distance = end - start

      const scroll = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const ease = progress * (2 - progress)

        element.scrollLeft = start + distance * ease

        if (progress < 1) {
          requestAnimationFrame(scroll)
        } else if (onComplete) {
          onComplete()
        }
      }

      requestAnimationFrame(scroll)
    },
    [],
  )

  const handleMouseEnter = useCallback(
    (index: number) => {
      const element = scrollDescriptionRefs.current[index]
      if (element) {
        animationRef.current = window.requestAnimationFrame(() => {
          smoothScroll(
            element,
            element.scrollLeft,
            element.scrollWidth - element.clientWidth,
            2000,
            () => {
              animationRef.current = null
            },
          )
        })
      }
    },
    [scrollDescriptionRefs, animationRef, smoothScroll],
  )

  const handleMouseLeave = (index: number) => {
    const element = scrollDescriptionRefs.current[index]
    if (element) {
      smoothScroll(element, element.scrollLeft, 0, 2000)
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.replace(/\D/g, '')

    if (inputValue) {
      const originalValue = Number(inputValue) / 100
      const formattedValue = originalValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
      setValue({
        formattedValue,
        originalValue,
      })
    } else {
      setValue({
        formattedValue: '',
        originalValue: 0,
      })
    }
  }

  const checkIfClipped = useCallback(() => {
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const clipped =
        rect.top < 0 ||
        rect.left < 0 ||
        rect.bottom > viewportHeight ||
        rect.right > viewportWidth

      setIsClipped(clipped)
    }
  }, [])

  const findTextColor = useCallback((type: string) => {
    if (type === 'incomes') {
      return 'green'
    } else {
      return 'red'
    }
  }, [])

  const handleCreateTransaction = useCallback(
    async (
      type: 'incomes' | 'outcomes' | 'dailies',
      item: ITransaction,
      setMiniInfoTransactions: Dispatch<SetStateAction<IItem[]>>,
      miniInfoTransactions: IItem[],
    ) => {
      try {
        const currentYear = new Date().getFullYear()
        const transactionDay = new Date(
          `${currentYear}-${item.formatted_date.split('/')[1]}-${item.formatted_date.split('/')[0]}T00:00`,
        )

        const response = await fetch(
          'http://localhost:8080/transactions/create',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description: 'Insira uma descrição',
              price: value.originalValue,
              category_id: 4,
              type:
                type === 'dailies'
                  ? 'daily'
                  : type.substring(0, type.length - 1),
              shared_id: null,
              transaction_day: transactionDay,
            }),
          },
        )

        const data = await response.json()

        const startDate = new Date(`${transactions[0].date}T00:00:00`)

        const endDate = new Date(
          `${transactions[transactions.length - 1].date}T00:00:00`,
        )

        const response2 = await fetch(
          `http://localhost:8080/transactions/preview?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        const newTransctions = await response2.json()

        setTransactions(newTransctions)
        setMiniInfoTransactions([
          ...miniInfoTransactions,
          {
            id: data.id,
            description: 'Insira uma descrição',
            price: value.formattedValue,
            category: 'outros',
            createdAt: new Date().toLocaleString('pt-BR'),
            transaction_day: transactionDay.toLocaleString('pt-BR'),
          },
        ])

        setValue({
          formattedValue: '',
          originalValue: 0,
        })
      } catch (err) {
        console.log(err)
      }
    },
    [value.formattedValue, value.originalValue, setTransactions, transactions],
  )

  const handleOnKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLInputElement>,
      type: 'incomes' | 'outcomes' | 'dailies',
      item: ITransaction,
      setMiniInfoTransactions: Dispatch<SetStateAction<IItem[]>>,
      miniInfoTransactions: IItem[],
    ) => {
      if (event.key === 'Enter') {
        handleCreateTransaction(
          type,
          item,
          setMiniInfoTransactions,
          miniInfoTransactions,
        )
      }
    },
    [handleCreateTransaction],
  )

  return {
    handleMouseEnter,
    handleMouseLeave,
    scrollDescriptionRefs,
    handleChange,
    value,
    checkIfClipped,
    modalRef,
    isClipped,
    findTextColor,
    handleOnKeyDown,
    handleCreateTransaction,
  }
}
