export type Portfolio = { 
    [key:string]:{
        currency: string,
        holding: number,
        percentage: number,
        marketPrice?: number,
        netValue?: number,
        currentAllocation?: number,
        currentFiatOffset?: number,
        currentPercentageOffset?: number            
    }
}