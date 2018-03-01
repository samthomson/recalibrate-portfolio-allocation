
import { expect } from 'chai'

import { sumPortfolioNetValues, updatePortfolioCurrencyValues } from './../dist/portfolioCalculations'
import { Portfolio } from './../src/types'

describe('portfolioCalculations', () => {
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

        expect(sumPortfolioNetValues(oTestPortfolio)).to.equal(6327.6058)
    })
})
