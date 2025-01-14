import React, { ChangeEvent, useCallback, useRef, useState } from 'react'

export default function useMiniInfoAux() {
  const animationRef = useRef<number | null>(null)
  const scrollDescriptionRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const modalRef = useRef<HTMLDivElement>(null)
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
    if (type === 'income') {
      return 'green'
    } else {
      return 'red'
    }
  }, [])

  const handleOnKeyDown = useCallback(
    async (
      event: React.KeyboardEvent<HTMLInputElement>,
      callback: () => Promise<void>,
    ) => {
      if (event.key === 'Enter') {
        await callback()
      }
    },
    [],
  )

  return {
    handleMouseEnter,
    handleMouseLeave,
    scrollDescriptionRefs,
    handleChange,
    value,
    setValue,
    checkIfClipped,
    modalRef,
    isClipped,
    findTextColor,
    handleOnKeyDown,
  }
}
