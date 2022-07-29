import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'dotenv/config'
import '@nomiclabs/hardhat-etherscan'

const gasPrice = 60000000000

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.14'
            }
        ]
    },
    networks: {
        hardhat: {
            gasPrice,
            mining: {
                auto: true
                // interval: 1000
            }
        },
        localnode: {
            url: 'http://127.0.0.1:8545',
            gasPrice,
            chainId: 31337
        },
        polygon: {
            url: `https://rpc-mainnet.matic.quiknode.pro`,
            accounts: []
        },
        ethereum: {
            url: `https://cloudflare-eth.com`,
            accounts: []
        },
        bnb: {
            url: `https://bsc-dataseed1.ninicoin.io`,
            accounts: []
        }
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts'
    },
    etherscan: {
        apiKey: {
            bsc: process.env.BSCSCAN_API_KEY,
            bscTestnet: process.env.BSCSCAN_API_KEY,
            polygon: process.env.POLYGONSCAN_API_KEY,
            polygonMumbai: process.env.POLYGONSCAN_API_KEY,
            rinkeby: process.env.RINKEBYSCAN_API_KEY,
            mainnet: process.env.ETHERSCAN_API_KEY
        }
    },
    mocha: {
        timeout: 60000,
        bail: true
    },
    gasReporter: {
        enabled: process.env.GAS_REPORTER_ENABLED?.toLowerCase() == 'true',
        currency: 'USD',
        coinmarketcap: process.env.CMC_API_KEY,
        gasPriceApi:
            'https://api.etherscan.com/api?module=proxy&action=eth_gasPrice',
        token: 'ETH'
    }
}

export default config
