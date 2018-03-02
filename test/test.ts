
import { expect } from 'chai'
import sinon = require('sinon')

import {
    calculateCurrentPortfolioAllocation, calculatePortfolioOffsets,
    consoleLogSummaries, sumPortfolioNetValues, updatePortfolioCurrencyValues } from './../dist/portfolioCalculations'
import { Portfolio } from './../src/types'

describe('portfolioCalculations', () => {

    it('calculateCurrentPortfolioAllocation', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3}
        }
        sinon.stub(console, 'log')
        calculateCurrentPortfolioAllocation(oTestPortfolio, 20736)

        const sKey = 'BITCOIN'
        expect(oTestPortfolio[sKey].currentAllocation).to.be.a('number')
    })

    it('consoleLogSummaries', () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4, "netValue": 4359.4532 }
        }

        
        consoleLogSummaries(oTestPortfolio)
        expect(console.log.callCount).to.equal(9)
        console.log.restore()
    })

    it('calculatePortfolioOffsets', () => {
        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4, "currentAllocation": 40 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3, "currentAllocation": 60 }
        }
        

        const recalibrationOffset = calculatePortfolioOffsets(oTestPortfolio)

        const sKey = 'BITCOIN'

        expect(oTestPortfolio[sKey].currentPercentageOffset).to.be.a('number')
        expect(oTestPortfolio[sKey].currentFiatOffset).to.be.a('number')
        expect(recalibrationOffset).to.be.a('number')
        expect(recalibrationOffset).to.equal(0)
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
    })
    
    it('sumPortfolioNetValues', async () => {

        const oTestPortfolio: Portfolio = {
            BITCOIN: { "currency": 'BITCOIN', "percentage": 50, "holding": 0.4, "netValue": 4359.4532 },
            ETHEREUM: { "currency": 'ETHEREUM', "percentage": 50, "holding": 2.3, "netValue": 1546.0492 }
        }

        await updatePortfolioCurrencyValues(oTestPortfolio)
        const sKey = 'BITCOIN'

        expect(sumPortfolioNetValues(oTestPortfolio)).to.be.a('number')
    })
})
