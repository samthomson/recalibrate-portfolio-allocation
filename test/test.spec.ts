import { expect } from 'chai'

import {
    calculateCurrentPortfolioAllocation, calculatePortfolioOffsets,
    consoleLogSummaries, sumPortfolioNetValues, updatePortfolioCurrencyValues, updatePortfolioValues } from '../src/portfolioCalculations'
import { Portfolio } from '../src/types'

describe('portfolioCalculations', () => {

    it('calculateCurrentPortfolioAllocation', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3}
        }
        calculateCurrentPortfolioAllocation(oTestPortfolio, 20736)

        const sKey = 'BITCOIN'
        expect(oTestPortfolio[sKey].currentAllocation).to.be.a('number')
    })

    it('consoleLogSummaries', () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4, "netValue": 4359.4532 }
        }

        
        consoleLogSummaries(oTestPortfolio)
        // expect(console.log.callCount).to.equal(9)
        // console.log.restore()
    })

    it('calculatePortfolioOffsets', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4, "currentAllocation": 40, "marketPrice": 12000 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3 }
        }
        

        const recalibrationOffset = calculatePortfolioOffsets(oTestPortfolio)

        const sKey = 'BITCOIN'

        expect(oTestPortfolio[sKey].currentPercentageOffset).to.be.a('number')
        expect(oTestPortfolio[sKey].currentFiatOffset).to.be.a('number')
        expect(recalibrationOffset).to.be.a('number')

        const sEmptyKey = 'ETHEREUM'

        expect(oTestPortfolio[sKey].currentPercentageOffset).to.be.a('number')
        expect(oTestPortfolio[sKey].currentFiatOffset).to.be.a('number')
        expect(recalibrationOffset).to.be.a('number')
    })

    it('updatePortfolioValues', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3 }
        }
        updatePortfolioValues(oTestPortfolio, 'BITCOIN', 100)
        updatePortfolioValues(oTestPortfolio, 'BITCOIN', null)
    })

    it('updatePortfolioCurrencyValues', async () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3 }
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sKey = 'BITCOIN'

        expect(oTestPortfolio[sKey].marketPrice).to.be.a('number')
        expect(oTestPortfolio[sKey].netValue).to.be.a('number')

        const oNullTestPortfolio: Portfolio = {
            DOGECOIN: { "currency": 'DOGECOIN', "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3 }
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sNullKey = 'DOGECOIN'

        expect(oTestPortfolio[sKey].marketPrice).to.be.a('number')
        expect(oTestPortfolio[sKey].netValue).to.be.a('number')
    })
    
    it('sumPortfolioNetValues', async () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'bitcoin', "percentage": 50, "holding": 0.4, "netValue": 4359.4532 },
            ETHEREUM: { "currency": 'ethereum', "percentage": 50, "holding": 2.3, "netValue": 1546.0492 }
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
