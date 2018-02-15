
export function calculateTrades(portfolio: any) : any {
    /*
    */
}

// give portfolio - consistenting of stocks each with - name and amount, eg BTC 0.4, ETH 2.3, LTC 20

// give spread - list of stocks each with desired percentage, eg BTC 50%, ETH 30%, LTC 20%

// it gets the current market prices for currencies

// it then calculates the spread of the portfolio based on current fiat values

// it then looks at the intended spread and calculates the offset for each stock

// then for each stock it determines the trade buy X proxy coin (for the positive offsets) or sell X proxy coin for currencies (for the negatives)