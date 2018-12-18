// DEFINE MOCKS
const mockery = require('mockery')

const mockGetCryptoValues = {
    getMultipleCryptoUSDValue: function(saCurrencies) {
        return {
            bitcoin: { usdValue: 20000 },
            ethereum: { usdValue: 1000 },
            dogecoin: { usdValue: 0.01 },
            litecoin: { usdValue: 300 },
        }
    },
}
mockery.enable({
    useCleanCache: true,
    warnOnReplace: false,
    warnOnUnregistered: false,
})
mockery.registerMock('get-crypto-fiat-values', mockGetCryptoValues)

const BITCOIN: string = 'bitcoin'
const ETHEREUM: string = 'ethereum'
const DOGECOIN: string = 'dogecoin'
const LITECOIN: string = 'litecoin'

import { expect } from 'chai'
import {
    calculateCurrentPortfolioAllocation,
    calculatePortfolioOffsets,
    calculateRequiredTradesToRebalance,
    consoleLogSummaries,
    determineTrades,
    sumPortfolioNetValues,
    updatePortfolioCurrencyValues,
    updatePortfolioValues,
} from '../src/portfolioCalculations'
import { Portfolio, TradeOrder } from '../src/types'

describe('portfolioCalculations', () => {
    it('calculateCurrentPortfolioAllocation', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 50,
                holding: 0.4,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 2.3,
            },
        }
        calculateCurrentPortfolioAllocation(oTestPortfolio, 20736)

        const sKey = 'BITCOIN'
        expect(oTestPortfolio[sKey].currentAllocation).to.be.a('number')
    })

    it('consoleLogSummaries', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                currentAllocation: 60,
                holding: 0.4,
                intendedAllocation: 50,
                currentPercentageOffset: 20,
                currentFiatOffset: 1600,
                currentCryptoOffset: 0.08,
                marketPrice: 20000,
                netValue: 8000,
            },
        }

        consoleLogSummaries(oTestPortfolio)
        // expect(console.log.callCount).to.equal(1)
        // console.log.restore()
    })

    it('calculatePortfolioOffsets', () => {
        // const oTestPortfolio: Portfolio = {
        //     BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4, "currentAllocation": 40, "marketPrice": 12000 },
        //     ETHEREUM: { "currency": ETHEREUM, "percentage": 50, "holding": 2.3 }
        // }

        /*
        1x $20k bitcoin, and 10x $1k ether.
        each should be 50%.
        actual allocation: 66.66% btc, 33.33% eth
        intended allocationn: 50% btc, 50% eth
        */

        const twoThirdsPercent: number = Number(((2 / 3) * 100).toFixed(12))
        const negativeOneSixthPercent: number =
            Number(((1 / 6) * 100).toFixed(12)) * -1
        const expectedBTCFIATOffset: number = Number((5000).toFixed(6))
        const expectedETHFIATOffset: number = Number(
            ((negativeOneSixthPercent / 100) * 10000).toFixed(6)
        )

        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 50,
                holding: 1,
                currentAllocation: Number(((2 / 3) * 100).toFixed(12)), // 66.66666%
                netValue: 20000,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 10,
                currentAllocation: Number(((1 / 3) * 100).toFixed(12)), // 33.3333%
                netValue: 10000,
            },
        }

        const recalibrationOffset = calculatePortfolioOffsets(oTestPortfolio)

        const sKey = 'BITCOIN'
        expect(
            oTestPortfolio[sKey].currentPercentageOffset.toFixed(6)
        ).to.equal((25).toFixed(6))
        expect(oTestPortfolio[sKey].currentFiatOffset).to.equal(
            expectedBTCFIATOffset
        )
        expect(oTestPortfolio[sKey].currentCryptoOffset).to.be.a('number')

        const sETHKey = 'ETHEREUM'
        expect(
            oTestPortfolio[sETHKey].currentPercentageOffset.toFixed(6)
        ).to.equal((-50).toFixed(6))
        expect(oTestPortfolio[sETHKey].currentFiatOffset.toFixed(6)).to.equal(
            (-5000).toFixed(6)
        )

        expect(recalibrationOffset).to.be.a('number')
        expect(recalibrationOffset).to.equal(10000)
    })

    it('updatePortfolioValues', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 50,
                holding: 0.4,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 2.3,
            },
        }
        updatePortfolioValues(oTestPortfolio, 'BITCOIN', 100)
        updatePortfolioValues(oTestPortfolio, 'BITCOIN', null)
    })

    it('updatePortfolioCurrencyValues', async () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 50,
                holding: 0.4,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 2.3,
            },
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sKey = 'BITCOIN'

        expect(oTestPortfolio[sKey].marketPrice).to.be.a('number')
        expect(oTestPortfolio[sKey].netValue).to.be.a('number')

        const oNullTestPortfolio: Portfolio = {
            DOGECOIN: {
                currency: DOGECOIN,
                intendedAllocation: 50,
                holding: 0.4,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 2.3,
            },
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sNullKey = 'DOGECOIN'

        expect(oTestPortfolio[sKey].marketPrice).to.be.a('number')
        expect(oTestPortfolio[sKey].netValue).to.be.a('number')
    })

    it('sumPortfolioNetValues', async () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 50,
                holding: 0.4,
                netValue: 4359.4532,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 2.3,
                netValue: 1546.0492,
            },
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)

        expect(sumPortfolioNetValues(oTestPortfolio)).to.be.a('number')

        const oEmptyPortfolio: Portfolio = {
            BITCOIN: {
                currency: 'bitcoin',
                intendedAllocation: 50,
                holding: 0,
                netValue: 0,
            },
            ETHEREUM: {
                currency: 'ethereum',
                intendedAllocation: 50,
                holding: 0,
                netValue: 0,
            },
        }

        await updatePortfolioCurrencyValues(oEmptyPortfolio)

        const portfolioSumNetValue = sumPortfolioNetValues(oEmptyPortfolio)
        expect(portfolioSumNetValue).to.be.a('number')
        expect(portfolioSumNetValue).to.equal(0)
    })

    it('should determineTrades', async () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 40,
                holding: 1,
                netValue: 3556.64,
                currentCryptoOffset: 0.9,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 50,
                holding: 35,
                netValue: 95.03,
                currentCryptoOffset: -11,
            },
            LITECOIN: {
                currency: LITECOIN,
                intendedAllocation: 15,
                holding: 20,
                netValue: 600,
                currentCryptoOffset: 0,
            },
        }

        const oaTrades = await determineTrades(oTestPortfolio)

        expect(oaTrades.length).to.equal(2)
        expect(oaTrades[0].amount).to.equal(0.9)
        expect(oaTrades[0].buy).to.equal('stablecoin')
        expect(oaTrades[0].sell).to.equal('bitcoin')
    })

    it('should produce predicatable outcomes on end to end tests', async () => {
        const oSimplePortfolio: Portfolio = {
            BITCOIN: {
                currency: BITCOIN,
                intendedAllocation: 50,
                holding: 0.5,
            },
            ETHEREUM: {
                currency: ETHEREUM,
                intendedAllocation: 30,
                holding: 4,
            },
            LITECOIN: {
                currency: LITECOIN,
                intendedAllocation: 20,
                holding: 10,
            },
        }

        // get trades
        const oaTrades: TradeOrder[] = await calculateRequiredTradesToRebalance(
            oSimplePortfolio
        )

        expect(oaTrades.length).to.equal(3)

        expect(oaTrades[0].amount).to.equal(0.075)
        expect(oaTrades[0].buy).to.equal('stablecoin')
        expect(oaTrades[0].sell).to.equal('bitcoin')

        expect(oaTrades[1].amount).to.equal(1.1)
        expect(oaTrades[1].buy).to.equal('ethereum')
        expect(oaTrades[1].sell).to.equal('stablecoin')

        expect(oaTrades[2].amount).to.equal(1.333333)
        expect(oaTrades[2].buy).to.equal('litecoin')
        expect(oaTrades[2].sell).to.equal('stablecoin')

        // compex portfolio

        // get trades
    })
})
