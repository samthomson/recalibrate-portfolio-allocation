export interface Portfolio { 
    [key:string]: PortfolioItem
}

export interface PortfolioItem { 
    currency: string,
    holding: number,
    percentage: number,
    marketPrice?: number,
    netValue?: number,
    currentAllocation?: number,
    currentFiatOffset?: number,
    currentPercentageOffset?: number            
}
