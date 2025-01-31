import { useEffect, useState } from 'react'

interface IParams {
  valueNumber: number
  isPercentage?: boolean
}

const CountUp = ({ valueNumber, isPercentage = false }: IParams) => {
  const [value, setValue] = useState(0)
  const duration = 100
  const fps = 60

  useEffect(() => {
    const totalFrames = Math.round((duration / 1000) * fps)
    const difference = valueNumber - value
    const increment = difference / totalFrames
    let currentFrame = 0

    const interval = setInterval(() => {
      currentFrame += 1
      setValue((prevValue) => {
        const newValue = prevValue + increment
        return difference > 0
          ? Math.min(newValue, valueNumber)
          : Math.max(newValue, valueNumber)
      })

      if (currentFrame >= totalFrames) {
        clearInterval(interval)
      }
    }, 1000 / fps)

    return () => clearInterval(interval)
  }, [valueNumber, duration, fps, value])

  return (
    <>
      {isPercentage
        ? value >= 0
          ? `+${value.toFixed(2)}`
          : value.toFixed(2)
        : value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
    </>
  )
}

export default CountUp
