# recalibrate-portfolio-allocation

[![Build Status](https://travis-ci.org/samthomson/recalibrate-portfolio-allocation.svg?branch=master)](https://travis-ci.org/samthomson/recalibrate-portfolio-allocation)
[![Coverage Status](https://coveralls.io/repos/github/samthomson/recalibrate-portfolio-allocation/badge.svg?branch=master)](https://coveralls.io/github/samthomson/recalibrate-portfolio-allocation?branch=master)

A portfolio is defined as its allocation of parts. Eg. 50% BTC, 30% ETH, 20% LTC.

This allocation is easy to use when first constructing the porfolio, but as the market changes, so does the allocation of the portfolio. Eg. BTC may go up 4% while ETH goes up 8%. So to keep the portfolio at a fixed allocation, it must be recalibrated.

For example, consider a portfolio with 50% BTC and 50% ETH.
If BTC is \$10,000 and ETH is \$1,000 then a \$10,000 fund should buy 0.5 BTC and 5 ETH.
If next month ETH was at \$2,000 but BTC was unchanged at \$10,000, the portfolio would now have a 33.33% BTC / 66.66% ETH allocation.
And so 33.33% of ETH should be traded for BTC, which would be 1.66 ETH -> BTC.
That's just for an allocation of two currencies in a fixed allocation, with more it becomes more complicated to calculate manually.

This package calculates the trades necessary to rebalance the portfolio to maintain a fixed/defined allocation.

Possible solution:

Use a proxy coin (like binance coin). Determine the fiat value of each coin in the allocation, then determine in fiat (USD?) how many dollars above & below each coin in the fund is. For each coin, set the difference (positive or negative). For all positive coins buy proxy coin (binance) of the positive amount. Then buy the amount of each negative, with Binance. This way the fund would be fueled with Binance.
If the markets remained flat, no adjustment is necessary. If they move, ~50% of coins will be up, & ~50% down, but all will need a trade. The cost is 0.25% of what is transferred. So 0.25% of the collective change, is the cost of rebalancing.

### todo

-   handle non-data better. if we didn't receive market data for any currency, we can't proceed. throw an error or similar.

## usage

`yarn` to install

### rebalance

```typescript
// define a portfolio
const BITCOIN: string = 'bitcoin'
const ETHEREUM: string = 'ethereum'
const LITECOIN: string = 'litecoin'

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
const aoTrades: TradeOrder[] = await calculateRequiredTradesToRebalance(
    oSimplePortfolio
)
console.log(aoTrades)
```

Will print

```typescript
[
    { amount: 0.154714, buy: 'stablecoin', sell: 'bitcoin' },
    { amount: 3.546245, buy: 'ethereum', sell: 'stablecoin' },
    { amount: 7.102432, buy: 'litecoin', sell: 'stablecoin' },
]
```

You can also call `calculateRequiredTradesToRebalance` with a second boolean parameter set to `true` to display more information on the portfolio.

### recompose

You can also calculate trades necessary to change from one portfolio to another, where each portfolio has currencies the other doesn't.

```typescript
const oInitialSimplePortfolio: Portfolio = {
	BITCOIN: {
		currency: BITCOIN,
		intendedAllocation: 50,
		holding: 0.5,
	},
	ETHEREUM: {
		currency: ETHEREUM,
		intendedAllocation: 45,
		holding: 4,
	},
	DOGECOIN: {
		currency: DOGECOIN,
		intendedAllocation: 5,
		holding: 400,
	},
}
const oTargetSimplePortfolio: Portfolio = {
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
		holding: 0,
	},
}

const aoTrades: TradeOrder[] = await calculateRequiredTradesToReAllocate(
    oInitialSimplePortfolio,
	oTargetSimplePortfolio
)
console.log(aoTrades)
```

Will print
```typescript

[
	{ amount: 0.1499, buy: 'stablecoin', sell: 'bitcoin' },
	{ amount: 0.2012, buy: 'ethereum', sell: 'stablecoin' },
	{ amount: 400, buy: 'stablecoin', sell: 'dogecoin' }
]
```

## testing

`yarn test` or `yarn test --grep="updatePortfolioCurrencyValues"` to run a specific test
