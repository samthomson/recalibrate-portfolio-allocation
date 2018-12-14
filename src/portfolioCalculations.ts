import { getCryptoUSDValue } from 'get-crypto-fiat-values'
import dedent from 'ts-dedent';
import { Portfolio } from './types'

export const calculateCurrentPortfolioAllocation = (oPortfolio: Portfolio, runningTotal: number) => {
    Object.keys(oPortfolio).forEach(key => {
        oPortfolio[key].currentAllocation = (oPortfolio[key].netValue || 0) / runningTotal * 100
    })
}

export const consoleLogSummaries = (oPortfolio: Portfolio) => {
    Object.keys(oPortfolio).forEach(key => {
        let sMessage = `
        ${key}:
        currency: ${oPortfolio[key].currency}
        percentage: ${oPortfolio[key].percentage}
        holding: ${oPortfolio[key].holding}
        market-price: $${oPortfolio[key].marketPrice.toFixed(2)}
        net value: $${oPortfolio[key].netValue.toFixed(2)}
        current allocation: ${oPortfolio[key].currentAllocation.toFixed(2)} % of portfolio
        current percentage offset: ${oPortfolio[key].currentPercentageOffset.toFixed(2)}%
        current fiat (USD) offset: $${oPortfolio[key].currentFiatOffset.toFixed(2)}
        


        `
        
        console.log(dedent(sMessage))
    })
}

export const calculatePortfolioOffsets = (oPortfolio: Portfolio): number => {
    /*
    compares value of assets in portfolio against what they should be
    based on the intended allocation. Determining how high or low each
    asset is, relative to it what it should be for the current market.
    */
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

export const determineTrades = (oPortfolio: Portfolio): any => {
    /*
    work out what we need to sell, and what we need to buy in 
    order to rebalance to the portfolios allocation. */
    console.log('\ndetermine trades\n')
    Object.keys(oPortfolio).forEach(key => {

        console.log(oPortfolio[key].currency)

        if (oPortfolio[key].currentPercentageOffset === 0) {
            console.log('currency is *already* correctly allocated')
        }

        if (oPortfolio[key].currentPercentageOffset < 0) {
            console.log('currency is negatively offset; BUY')
        }

        if (oPortfolio[key].currentPercentageOffset > 0) {
            console.log('currency is positively offset; SELL')
        }

    })
}