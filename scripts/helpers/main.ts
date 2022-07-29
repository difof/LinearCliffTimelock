import { Contract, Signer } from 'ethers'
import { ethers } from 'hardhat'
import { deploy } from './deploy'
import { connect } from './wallet-connect'

export function main(fn: () => Promise<void>) {
    fn()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}

export function mainDeploy<T extends Contract>(
    contractName: string,
    factoryBuilder: (signer: Signer) => Promise<T>
) {
    main(async () => {
        let chainId = (await ethers.provider.getNetwork()).chainId
        if (chainId !== 31337) {
            await connect()
        }
        const signer = ethers.provider.getSigner()
        await deploy(signer, contractName, await factoryBuilder(signer))
    })
}
