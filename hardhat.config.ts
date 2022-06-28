import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import 'dotenv/config'

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
        }
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts'
    },
    mocha: {
        timeout: 60000,
        bail: true
    },
    gasReporter: {
        currency: 'USD',
        coinmarketcap: process.env.CMC_API_KEY,
        gasPriceApi:
            'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
        token: 'MATIC'
    }
}

export default config
