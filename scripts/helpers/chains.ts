export interface IChainData {
    name: string
    chain_id: number
    rpc_url: string
}

export const supportedChains: IChainData[] = [
    {
        name: 'Ethereum',
        chain_id: 1,
        rpc_url: 'https://cloudflare-eth.com'
    },
    {
        name: 'BNB Chain',
        chain_id: 56,
        rpc_url: 'https://bsc-dataseed1.ninicoin.io'
    },
    {
        name: 'Polygon',
        chain_id: 137,
        rpc_url: 'https://rpc-mainnet.matic.quiknode.pro'
    }
]
