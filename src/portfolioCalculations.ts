import { getCryptoUSDValue } from 'get-crypto-fiat-values'

import { Portfolio } from './types'

export const calculateCurrentPortfolioAllocation = (oPortfolio: Portfolio, runningTotal: number) => {
    Object.keys(oPortfolio).forEach(key => {
        oPortfolio[key].currentAllocation = (oPortfolio[key].netValue || 0) / runningTotal * 100
    })
}

export const consoleLogSummaries = (oPortfolio: Portfolio) => {
    Object.keys(oPortfolio).forEach(key => {
        console.log(`\n${key}`)
        console.log(`currency: ${oPortfolio[key].currency}`)
        console.log(`percentage: ${oPortfolio[key].percentage}`)
        console.log(`holding: ${oPortfolio[key].holding}`)
        console.log(`market-price: ${oPortfolio[key].marketPrice}`)
        console.log(`net value: ${oPortfolio[key].netValue}`)
        console.log(`current allocation: ${oPortfolio[key].currentAllocation}%`)
        console.log(`current percentage offset: ${oPortfolio[key].currentPercentageOffset}%`)
        console.log(`current fiat (USD) offset: $${oPortfolio[key].currentFiatOffset}\n`)
    })
}

export const calculatePortfolioOffsets = (oPortfolio: Portfolio): number => {
    let runningRecalibrationOffset: number = 0
    Object.keys(oPortfolio).forEach(key => {
        const currentAllocation: number = oPortfolio[key].currentAllocation || 0
        const intendedAllocation: number = oPortfolio[key].percentage
        const marketPrice: number = oPortfolio[key].marketPrice || 0

        const currentPercentageOffset: number = currentAllocation - intendedAllocation
        const currentFiatOffset: number = (currentPercentageOffset * marketPrice) / 100

        runningRecalibrationOffset += currentFiatOffset
        
        oPortfolio[key].currentPercentageOffset = currentPercentageOffset
        oPortfolio[key].currentFiatOffset = currentFiatOffset
    })
    return runningRecalibrationOffset
}

export const updatePortfolioValues = (oPortfolio: Portfolio, sCurrency: string, value: number | null) => {
    const marketPrice: number = (value !== null) ? value : -1
    const netValue: number = value !== null ? (value * oPortfolio[sCurrency].holding) : -1

    oPortfolio[sCurrency].marketPrice = marketPrice
    oPortfolio[sCurrency].netValue = value !== null ? (value * oPortfolio[sCurrency].holding) : -1
}

export const updatePortfolioCurrencyValues = (oPortfolio: Portfolio): Promise<void[]> => {
    const aFetchCurrencyValues = Object.keys(oPortfolio).map(sCurrency => {
        return getCryptoUSDValue(sCurrency).then(value => {
            // set it's market price, or -1 if the API returned null
            updatePortfolioValues(oPortfolio, sCurrency, value)
            return
        })
    })
    
    return Promise.all(aFetchCurrencyValues)
}

export const sumPortfolioNetValues = (oPortfolio: Portfolio): number => {
    let runningTotal: number = 0
    Object.keys(oPortfolio).forEach(key => {
        runningTotal += oPortfolio[key].netValue || 0
    })
    return runningTotal
}