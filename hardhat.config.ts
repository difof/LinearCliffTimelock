import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.4'
            }
        ]
    },
    networks: {
        hardhat: {
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
    }
}

export default config
