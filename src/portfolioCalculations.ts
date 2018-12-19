import { getMultipleCryptoUSDValue } from 'get-crypto-fiat-values'
import dedent from 'ts-dedent'
import { Portfolio, TradeOrder } from './types'

export const calculateCurrentPortfolioAllocation = (
    oPortfolio: Portfolio,
    runningTotal: number
) => {
    Object.keys(oPortfolio).forEach(key => {
        oPortfolio[key].currentAllocation =
            ((oPortfolio[key].netValue || 0) / runningTotal) * 100
    })
}

export const consoleLogSummaries = (oPortfolio: Portfolio) => {
    Object.keys(oPortfolio).forEach(key => {
        const {
            currency,
            intendedAllocation,
            holding,
            marketPrice,
            netValue,
            currentAllocation,
            currentPercentageOffset,
            currentFiatOffset,
            currentCryptoOffset,
        } = oPortfolio[key]

        let sMessage: string

        if (
            marketPrice &&
            netValue &&
            currentAllocation &&
            currentPercentageOffset &&
            currentFiatOffset &&
            currentCryptoOffset
        ) {
            sMessage = `
            ${key}:
            currency: ${currency}
            intendedAllocation: ${intendedAllocation}
            holding: ${holding}
            market-price: $${marketPrice.toFixed(2)}
            net value: $${netValue.toFixed(2)}
            current allocation: ${currentAllocation.toFixed(2)} % of portfolio
            current percentage offset: ${currentPercentageOffset.toFixed(2)}%
            current fiat (USD) offset: $${currentFiatOffset.toFixed(2)}
            current crypto (${currency}) offset: ${currentCryptoOffset.toFixed(
                6
            )}
            


            `
        } else {
            sMessage = `\n${currency} is missing values.. no summary available\n`
        }

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
        let {
            currentAllocation,
            holding,
            intendedAllocation,
            netValue,
        } = oPortfolio[key]

        currentAllocation = currentAllocation || 0
        netValue = netValue || 0

        const currentPercentageOffset: number =
            (1 - 1 / (currentAllocation / intendedAllocation)) * 100
        let currentFiatOffset: number = Number(
            ((currentPercentageOffset * netValue) / 100).toFixed(6)
        )
        let currentCryptoOffset: number = Number(
            ((currentPercentageOffset * holding) / 100).toFixed(6)
        )

        oPortfolio[key].currentPercentageOffset = currentPercentageOffset
        oPortfolio[key].currentFiatOffset = currentFiatOffset
        oPortfolio[key].currentCryptoOffset = currentCryptoOffset

        runningRecalibrationOffset +=
            currentFiatOffset > 0
                ? currentFiatOffset
                : (currentFiatOffset *= -1)
    })
    return runningRecalibrationOffset
}

export const updatePortfolioValues = (
    oPortfolio: Portfolio,
    sCurrency: string,
    value: number | null
) => {
    const marketPrice: number = value !== null ? value : -1
    const netValue: number =
        value !== null ? value * oPortfolio[sCurrency].holding : -1

    oPortfolio[sCurrency].marketPrice = marketPrice
    oPortfolio[sCurrency].netValue =
        value !== null ? value * oPortfolio[sCurrency].holding : -1
}

export const updatePortfolioCurrencyValues = async (
    oPortfolio: Portfolio
): Promise<void[]> => {
    // get an object of all currency values we're interested in
    const saCurrencies: string[] = Object.keys(oPortfolio).map(
        sCurrencyKey => oPortfolio[sCurrencyKey].currency
    )

    const oPrices: any = await getMultipleCryptoUSDValue(saCurrencies)

    const aFetchCurrencyValues = Object.keys(oPortfolio).map(sCurrency => {
        // set it's market price, or -1 if the API returned null
        return updatePortfolioValues(
            oPortfolio,
            sCurrency,
            oPrices[oPortfolio[sCurrency].currency].usdValue
        )
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

export const determineTrades = (oPortfolio: Portfolio): TradeOrder[] => {
    /*
    work out what we need to sell, and what we need to buy in 
    order to rebalance to the portfolios allocation. */
    let aReturnTrades: TradeOrder[] = []
    Object.keys(oPortfolio).forEach(key => {
        let { currency, currentCryptoOffset } = oPortfolio[key]

        currentCryptoOffset = currentCryptoOffset || 0
        /*currentCryptoOffset =
        currentCryptoOffset > 0
            ? currentCryptoOffset
            : (currentCryptoOffset *= -1)*/

        let oTradeOrder: TradeOrder

        if (typeof currentCryptoOffset !== undefined) {
            if (currentCryptoOffset !== 0) {
                // isn't *already* correctly allocated

                const fPositiveTradeAmount =
                    currentCryptoOffset > 0
                        ? currentCryptoOffset
                        : currentCryptoOffset * -1

                // it's too low, buy more via stablecoin
                if (currentCryptoOffset < 0) {
                    oTradeOrder = {
                        amount: fPositiveTradeAmount,
                        buy: currency,
                        sell: 'stablecoin',
                    }
                    // displayTradeOrder(oTradeOrder)
                    aReturnTrades.push(oTradeOrder)
                }

                // it's too high, sell for stablecoins
                if (currentCryptoOffset > 0) {
                    oTradeOrder = {
                        amount: fPositiveTradeAmount,
                        buy: 'stablecoin',
                        sell: currency,
                    }
                    // displayTradeOrder(oTradeOrder)
                    aReturnTrades.push(oTradeOrder)
                }
            }
        } else {
            console.log(`${currency} is missing data.. can't formulate a trade`)
        }
    })
    return aReturnTrades
}

const displayTradeOrder = (oTradeOrder: TradeOrder) => {
    console.log(
        `Buy ${oTradeOrder.amount} (${oTradeOrder.sell} worth) of ${
            oTradeOrder.buy
        } by selling ${oTradeOrder.sell}\n`
    )
}

export const calculateRequiredTradesToRebalance = async (
    oPortfolio: Portfolio
): Promise<TradeOrder[]> => {
    let runningTotal: number = 0
    let runningRecalibrationOffset: number = 0
    const tradingFeePercentage: number = 0.25

    // it gets the current market prices for currencies in the portfolio
    await updatePortfolioCurrencyValues(oPortfolio)

    runningTotal = sumPortfolioNetValues(oPortfolio)

    // determine portfolios current allocation
    calculateCurrentPortfolioAllocation(oPortfolio, runningTotal)

    // it then looks at the intended spread and calculates the offset for each stock in fiat (usd)
    runningRecalibrationOffset = calculatePortfolioOffsets(oPortfolio)

    runningRecalibrationOffset *= -1
    const recalibrationFees =
        runningRecalibrationOffset * (tradingFeePercentage / 100)

    consoleLogSummaries(oPortfolio)

    // then for each asset/coin-holding it determines the trade buy X proxy coin (for the positive offsets) or sell X proxy coin for currencies (for the negatives)
    return determineTrades(oPortfolio)
}
