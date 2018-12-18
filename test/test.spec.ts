
// DEFINE MOCKS
const mockery = require('mockery')

const mockGetCryptoValues = {
    getMultipleCryptoUSDValue: function (saCurrencies) {
        return {
            'bitcoin': { usdValue: 20000 },
            'ethereum': { usdValue: 1000 },
            'dogecoin': { usdValue: .01 },
            'litecoin': { usdValue: 300 }
        }
    }
};
mockery.enable({ useCleanCache: true, warnOnReplace: false, warnOnUnregistered: false });
mockery.registerMock('get-crypto-fiat-values', mockGetCryptoValues);


const BITCOIN: string = 'bitcoin'
const ETHEREUM: string = 'ethereum'
const DOGECOIN: string = 'dogecoin'

import { expect } from 'chai'
import {
    calculateCurrentPortfolioAllocation,
    calculatePortfolioOffsets,
    consoleLogSummaries,
    sumPortfolioNetValues,
    updatePortfolioCurrencyValues,
    updatePortfolioValues
} from '../src/portfolioCalculations'
import { Portfolio } from '../src/types'

describe('portfolioCalculations', () => {

    it('calculateCurrentPortfolioAllocation', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": ETHEREUM, "percentage": 50, "holding": 2.3}
        }
        calculateCurrentPortfolioAllocation(oTestPortfolio, 20736)

        const sKey = 'BITCOIN'
        expect(oTestPortfolio[sKey].currentAllocation).to.be.a('number')
    })

    it('consoleLogSummaries', () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4, "netValue": 4359.4532 }
        }

        
        consoleLogSummaries(oTestPortfolio)
        // expect(console.log.callCount).to.equal(9)
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

        const oTestPortfolio: Portfolio = {
            BITCOIN: {
                "currency": BITCOIN,
                "percentage": 50,
                "holding": 1,
                "currentAllocation": (2/3),
                "marketPrice": 20000 
            },
            ETHEREUM: {
                "currency": ETHEREUM,
                "percentage": 50,
                "holding": 10,
                "currentAllocation": (1/3),
                "marketPrice": 1000 
            }
        }
        

        const recalibrationOffset = calculatePortfolioOffsets(oTestPortfolio)

        console.log(recalibrationOffset)
        console.log(oTestPortfolio)

        const sKey = 'BITCOIN'

        expect(oTestPortfolio[sKey].currentPercentageOffset).to.be.a('number')
        expect(oTestPortfolio[sKey].currentPercentageOffset).to.equal((100/6))
        expect(oTestPortfolio[sKey].currentFiatOffset).to.be.a('number')
        expect(recalibrationOffset).to.be.a('number')

        const sEmptyKey = 'ETHEREUM'

        expect(oTestPortfolio[sKey].currentPercentageOffset).to.be.a('number')
        expect(oTestPortfolio[sKey].currentFiatOffset).to.be.a('number')
        expect(recalibrationOffset).to.be.a('number')
    })

    it('updatePortfolioValues', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": ETHEREUM, "percentage": 50, "holding": 2.3 }
        }
        updatePortfolioValues(oTestPortfolio, 'BITCOIN', 100)
        updatePortfolioValues(oTestPortfolio, 'BITCOIN', null)
    })

    it('updatePortfolioCurrencyValues', async () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": ETHEREUM, "percentage": 50, "holding": 2.3 }
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sKey = 'BITCOIN'

        expect(oTestPortfolio[sKey].marketPrice).to.be.a('number')
        expect(oTestPortfolio[sKey].netValue).to.be.a('number')

        const oNullTestPortfolio: Portfolio = {
            DOGECOIN: { "currency": DOGECOIN, "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": ETHEREUM, "percentage": 50, "holding": 2.3 }
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sNullKey = 'DOGECOIN'

        expect(oTestPortfolio[sKey].marketPrice).to.be.a('number')
        expect(oTestPortfolio[sKey].netValue).to.be.a('number')
    })
    
    it('sumPortfolioNetValues', async () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": BITCOIN, "percentage": 50, "holding": 0.4, "netValue": 4359.4532 },
            ETHEREUM: { "currency": ETHEREUM, "percentage": 50, "holding": 2.3, "netValue": 1546.0492 }
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)

        expect(sumPortfolioNetValues(oTestPortfolio)).to.be.a('number')


        const oEmptyPortfolio: Portfolio = {
            BITCOIN: { "currency": 'bitcoin', "percentage": 50, "holding": 0, "netValue": 0 },
            ETHEREUM: { "currency": 'ethereum', "percentage": 50, "holding": 0, "netValue": 0 }
        }

        await updatePortfolioCurrencyValues(oEmptyPortfolio)

        const portfolioSumNetValue = sumPortfolioNetValues(oEmptyPortfolio)
        expect(portfolioSumNetValue).to.be.a('number')
        expect(portfolioSumNetValue).to.equal(0)
    })
})
