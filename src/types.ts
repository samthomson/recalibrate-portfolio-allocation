export interface Portfolio { 
    [key:string]: PortfolioItem
}

export interface PortfolioItem { 
    currency: string,
    holding: number,
    percentage: number, // intended allocation
    marketPrice?: number, // the price of one unit, in USD
    netValue?: number,
    currentAllocation?: number, // percentage of the portfolio this asset occupies
    currentFiatOffset?: number,
    currentPercentageOffset?: number            
}
