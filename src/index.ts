import { getCryptoUSDValue } from 'get-crypto-fiat-values'

import { Portfolio } from './types'

const BITCOIN: string = 'bitcoin'
const ETHEREUM: string = 'ethereum'
const LITECOIN: string = 'litecoin'

export function calculateTrades(portfolio: Portfolio) : any {
    /*
    */
}


let runningTotal: number = 0
let runningRecalibrationOffset: number = 0
const tradingFeePercentage: number = 0.25

const calculatePortfoliosCurrentAllocation = (oPortfolio: Portfolio) => {
    Object.keys(oPortfolio).forEach(key => {
        oPortfolio[key].currentAllocation = (oPortfolio[key].netValue || 0) / runningTotal * 100
    })
}

const consoleLogSummaries = (oPortfolio: Portfolio) => {
    Object.keys(oPortfolio).forEach(key => {
        console.log(`
        ${key}
        currency: ${oPortfolio[key].currency}
        percentage: ${oPortfolio[key].percentage}
        holding: ${oPortfolio[key].holding}
        market-price: ${oPortfolio[key].marketPrice}
        net value: ${oPortfolio[key].netValue}
        current allocation: ${oPortfolio[key].currentAllocation}%
        current percentage offset: ${oPortfolio[key].currentPercentageOffset}%
        current fiat (USD) offset: $${oPortfolio[key].currentFiatOffset}
        \n
        `)
    })
}

const calculatePortfolioOffsets = (oPortfolio: Portfolio) => {
    Object.keys(oPortfolio).forEach(key => {
        const currentAllocation = oPortfolio[key].currentAllocation
        const intendedAllocation = oPortfolio[key].percentage
        
        oPortfolio[key].currentPercentageOffset = (currentAllocation || 0) - intendedAllocation
        oPortfolio[key].currentFiatOffset = (oPortfolio[key].currentPercentageOffset || 0) * (oPortfolio[key].marketPrice || 0) / 100
        runningRecalibrationOffset += oPortfolio[key].currentFiatOffset || 0
    })
}

const main = () => {
    // give portfolio - consistenting of stocks each with - name and amount, eg BTC 0.4, ETH 2.3, LTC 20
    // let aPortfolio: string[] = [BITCOIN, ETHEREUM, LITECOIN]
    let oPortfolio: Portfolio = {
        BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4 },
        ETHEREUM: { "currency": ETHEREUM, "percentage": 30, "holding": 2.3 },
        LITECOIN: { "currency": LITECOIN, "percentage": 20, "holding": 20 }
    }

    // give spread - list of stocks each with desired percentage, eg BTC 50%, ETH 30%, LTC 20%
    const aAllocation: { currency: string, percentage: number }[] = [
        { "currency": BITCOIN, "percentage": 50 },
        { "currency": ETHEREUM, "percentage": 30 },
        { "currency": LITECOIN, "percentage": 20 }
    ]

    // it gets the current market prices for currencies
    const aFetchCurrencyValues = Object.keys(oPortfolio).map(sCurrency => {
        return getCryptoUSDValue(sCurrency).then(value => {
            // set it's market price, or -1 if the API returned null
            console.log(`set market price`)
            oPortfolio[sCurrency].marketPrice = value !== null ? value : -1
            console.log(`set net value`)
            oPortfolio[sCurrency].netValue = value !== null ? (value * oPortfolio[sCurrency].holding) : -1
            console.log(`Got value: ${value}, for ${sCurrency}`)

            runningTotal += oPortfolio[sCurrency].netValue || 0

            return value
        })
    })

    Promise.all(aFetchCurrencyValues).then(
        (...aValueResults: any[]) => {
            console.log(`done, got values: ${aValueResults}, with a total market capitalisation of $${runningTotal}`)
        }
    ).then(() => {
        // it then calculates the allocation of the portfolio based on current fiat values

        console.log(`portfolio total value: ${runningTotal}\n`)

        // determine portfolios current allocation
        calculatePortfoliosCurrentAllocation(oPortfolio)
        

        // it then looks at the intended spread and calculates the offset for each stock in fiat (usd)
        calculatePortfolioOffsets(oPortfolio)
        
        // todo: then for each stock it determines the trade buy X proxy coin (for the positive offsets) or sell X proxy coin for currencies (for the negatives)
        


        // portfolio allocation
        consoleLogSummaries(oPortfolio)

        runningRecalibrationOffset *= -1
        const recalibrationFees = runningRecalibrationOffset * (tradingFeePercentage / 100)

        console.log(`\n\nRecalibration cost:\n$${runningRecalibrationOffset}\n+$${recalibrationFees} (presuming a trading fee of ${tradingFeePercentage}%)`)

        return
    })

}

main()

