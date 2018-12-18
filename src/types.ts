export interface Portfolio { 
    [key:string]: PortfolioItem
}

export interface PortfolioItem { 
    currency: string,
    holding: number,
    intendedAllocation: number, // percent of portfolio we want this asset to occupy
    marketPrice?: number, // the price of one unit, in USD
    netValue?: number,
    currentAllocation?: number, // percentage of the portfolio this asset occupies
    currentFiatOffset?: number,
    currentPercentageOffset?: number,
    currentCryptoOffset?: number            
}

export interface TradePair {
    amount: number, // measured in 'buy' currency
    buy: string,
    sell: string
}