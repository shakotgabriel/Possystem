                                                         
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getSettings } from "@/api/settings"

interface CurrencyContextType {
  currencyRate: number
  updateCurrencyRate: (rate: number) => void
                                                    
  convertToSSP: (sspAmount: number) => number
  convertToUSD: (sspAmount: number) => number
  formatSSP: (amount: number) => string
  formatUSD: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyRate, setCurrencyRate] = useState(550000)                                    

                                               
  useEffect(() => {
    const savedRate = localStorage.getItem("currencyRate")
    if (savedRate) {
      setCurrencyRate(Number(savedRate))
    }
  }, [])

                                               
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    let mounted = true
    ;(async () => {
      try {
        const res = await getSettings()
        const rate = res.data.usdToSsdRate
        if (!mounted) return
        if (typeof rate === 'number' && rate > 0) {
          setCurrencyRate(rate)
          localStorage.setItem('currencyRate', String(rate))
        }
      } catch {
                                                  
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const updateCurrencyRate = (rate: number) => {
    setCurrencyRate(rate)
    localStorage.setItem("currencyRate", rate.toString())
  }

                                                     
                                                                      
  const convertToSSP = (sspAmount: number) => {
    return sspAmount
  }

  const convertToUSD = (sspAmount: number) => {
    return sspAmount / currencyRate
  }

  const formatSSP = (amount: number) => {
    const safe = Number.isFinite(amount) ? amount : 0
    return `${safe.toLocaleString(undefined, { maximumFractionDigits: 2 })} SSP`
  }

  const formatUSD = (amount: number) => {
    const safe = Number.isFinite(amount) ? amount : 0
    return `$${safe.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider 
      value={{ 
        currencyRate, 
        updateCurrencyRate, 
        convertToSSP, 
        convertToUSD,
        formatSSP,
        formatUSD
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
} 