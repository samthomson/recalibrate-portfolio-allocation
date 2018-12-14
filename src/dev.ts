

import {
    calculateCurrentPortfolioAllocation,
    calculatePortfolioOffsets,
    consoleLogSummaries,
    determineTrades,
    sumPortfolioNetValues,
    updatePortfolioCurrencyValues
} from './portfolioCalculations'
import { Portfolio } from './types'

const BITCOIN: string = 'bitcoin'
const ETHEREUM: string = 'ethereum'
const LITECOIN: string = 'litecoin'

let runningTotal: number = 0
let runningRecalibrationOffset: number = 0
const tradingFeePercentage: number = 0.25
// give portfolio - consistenting of stocks each with - name and amount, eg BTC 0.4, ETH 2.3, LTC 20
// let aPortfolio: string[] = [BITCOIN, ETHEREUM, LITECOIN]
// including allocation - list of stocks each with desired percentage, eg BTC 50%, ETH 30%, LTC 20%
const oPortfolio: Portfolio = {
    BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.5 },
    ETHEREUM: { "currency": ETHEREUM, "percentage": 30, "holding": 4 },
    LITECOIN: { "currency": LITECOIN, "percentage": 20, "holding": 10 }
}


const calculateRequiredTradesToRebalance = async (portfolio: Portfolio) => {
    // it gets the current market prices for currencies in the portfolio
    await updatePortfolioCurrencyValues(oPortfolio)
    
    runningTotal = sumPortfolioNetValues(oPortfolio)
    
    console.log(`portfolio total value: $${runningTotal}\n`)

    // determine portfolios current allocation
    calculateCurrentPortfolioAllocation(oPortfolio, runningTotal)
    
    // it then looks at the intended spread and calculates the offset for each stock in fiat (usd)
    runningRecalibrationOffset = calculatePortfolioOffsets(oPortfolio)
    
    // todo: then for each stock it determines the trade buy X proxy coin (for the positive offsets) or sell X proxy coin for currencies (for the negatives)
    // TODO //

    // portfolio allocation
    consoleLogSummaries(oPortfolio)

    runningRecalibrationOffset *= -1
    const recalibrationFees = runningRecalibrationOffset * (tradingFeePercentage / 100)

    console.log(`\n\nRecalibration cost:\n$${runningRecalibrationOffset.toFixed(2)} worth of trades\n+ costing $${recalibrationFees.toFixed(2)} (presuming a trading fee of ${tradingFeePercentage.toFixed(2)}%)`)


    determineTrades(oPortfolio)

}

calculateRequiredTradesToRebalance(oPortfolio)

