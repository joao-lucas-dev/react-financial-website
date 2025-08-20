import { DateTime } from 'luxon'
import { ICreditCard } from '../types/creditCards'

interface InvoicePeriodInfo {
  invoice_date: string
  period_start: string
  period_end: string
  formatted_month_year: string
}

/**
 * Calcula em qual fatura uma transação será incluída baseado na data da transação
 * e nos dados do cartão de crédito (melhor dia de compra e vencimento)
 */
export function calculateInvoicePeriod(
  transaction_date: string,
  best_purchase_day?: number,
  payment_due_day?: number
): InvoicePeriodInfo {
  const transactionDateTime = DateTime.fromISO(transaction_date)
  
  // Se não tiver informações do ciclo de cobrança, usar período mensal padrão
  if (!best_purchase_day || !payment_due_day) {
    const invoicePeriodStart = transactionDateTime.startOf('month')
    const invoicePeriodEnd = transactionDateTime.endOf('month')
    
    return {
      invoice_date: invoicePeriodStart.toISO()!,
      period_start: invoicePeriodStart.toISO()!,
      period_end: invoicePeriodEnd.toISO()!,
      formatted_month_year: invoicePeriodStart.toFormat('MMM/yyyy')
    }
  }

  const transactionDay = transactionDateTime.day

  // Determinar a qual período de fatura esta transação pertence
  if (transactionDay <= best_purchase_day) {
    // Transação está dentro do período atual - fatura vence no próximo mês
    const invoiceDate = transactionDateTime.set({ day: payment_due_day }).plus({ months: 1 })
    const periodStart = transactionDateTime.set({ day: best_purchase_day }).minus({ months: 1 }).plus({ days: 1 })
    const periodEnd = transactionDateTime.set({ day: best_purchase_day })

    return {
      invoice_date: invoiceDate.toISO()!,
      period_start: periodStart.toISO()!,
      period_end: periodEnd.toISO()!,
      formatted_month_year: invoiceDate.toFormat('MMM/yyyy')
    }
  } else {
    // Transação está após o melhor dia de compra - fatura vence no mês seguinte ao próximo
    const invoiceDate = transactionDateTime.set({ day: payment_due_day }).plus({ months: 2 })
    const periodStart = transactionDateTime.set({ day: best_purchase_day }).plus({ days: 1 })
    const periodEnd = transactionDateTime.set({ day: best_purchase_day }).plus({ months: 1 })

    return {
      invoice_date: invoiceDate.toISO()!,
      period_start: periodStart.toISO()!,
      period_end: periodEnd.toISO()!,
      formatted_month_year: invoiceDate.toFormat('MMM/yyyy')
    }
  }
}

/**
 * Calcula qual fatura será afetada por uma transação de cartão de crédito
 * e retorna informações formatadas para exibição
 */
export function getInvoiceInfoForTransaction(
  transaction_date: string,
  card?: ICreditCard | null
): { monthYear: string; fullDate: string } | null {
  if (!card) return null

  const invoiceInfo = calculateInvoicePeriod(
    transaction_date,
    card.best_purchase_day,
    card.payment_due_day
  )

  const invoiceDateTime = DateTime.fromISO(invoiceInfo.invoice_date)
  
  return {
    monthYear: invoiceInfo.formatted_month_year,
    fullDate: invoiceDateTime.toFormat('dd/MM/yyyy')
  }
}

/**
 * Formata informações de uma fatura existente para exibição
 */
export function formatInvoiceDisplay(invoice_date: string): { monthYear: string; fullDate: string } {
  const invoiceDateTime = DateTime.fromISO(invoice_date)
  
  return {
    monthYear: invoiceDateTime.toFormat('MMM/yyyy'),
    fullDate: invoiceDateTime.toFormat('dd/MM/yyyy')
  }
}