import { ethers } from 'hardhat'
import WalletConnectProvider from '@walletconnect/web3-provider'
import type { IWalletConnectProviderOptions } from '@walletconnect/types'
import { supportedChains } from './chains'

export async function connect() {
    const opts: IWalletConnectProviderOptions = {
        rpc: {},
        clientMeta: {
            name: 'Difof LinearCliffTimelock Deployer',
            description: 'Difof LinearCliffTimelock Deployer',
            url: 'https://github.com/difof',
            icons: []
        }
    }

    for (let chain of supportedChains) {
        opts.rpc[chain.chain_id] = chain.rpc_url
    }

    const provider = new WalletConnectProvider(opts)
    await provider.enable()

    const web3Provider = new ethers.providers.Web3Provider(provider)
    ethers.provider = web3Provider
}
