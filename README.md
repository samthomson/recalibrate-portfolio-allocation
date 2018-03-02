# recalibrate-portfolio-allocation

[![Build Status](https://travis-ci.org/samthomson/recalibrate-portfolio-allocation.svg?branch=master)](https://travis-ci.org/samthomson/recalibrate-portfolio-allocation)

A portfolio is defined as its allocation of parts. Eg. 50% BTC, 30% ETH, 20% LTC.

This allocation is easy to use when first constructing the porfolio, but as the market changes, so does the allocation of the portfolio. Eg. BTC may go up 4% while ETH goes up 8%. So to keep the portfolio at a fixed allocation, it must be recalibrated.

For example, consider a portfolio with 50% BTC and 50% ETH.
If BTC is $10,000 and ETH is $1,000 then a $10,000 fund should buy 0.5 BTC and 5 ETH.
If next month ETH was at $2,000 but BTC was unchanged at $10,000, the portfolio would now have a 33.33% BTC / 66.66% ETH allocation.
And so 33.33% of ETH should be traded for BTC, which would be 1.66 ETH -> BTC.
That's just for an allocation of two currencies in a fixed allocation, with more it becomes more complicated to calculate manually.

This package calculates the trades necessary to rebalance the portfolio to maintain a fixed/defined allocation.

Possible solution:

Use a proxy coin (like binance coin). Determine the fiat value of each coin in the allocation, then determine in fiat (USD?) how many dollars above & below each coin in the fund is. For each coin, set the difference (positive or negative). For all positive coins buy proxy coin (binance) of the positive amount. Then buy the amount of each negative, with Binance. This way the fund would be fueled with Binance.
If the markets remained flat, no adjustment is necessary. If they move, ~50% of coins will be up, & ~50% down, but all will need a trade. The cost is 0.25% of what is transferred. So 0.25% of the collective change, is the cost of rebalancing.