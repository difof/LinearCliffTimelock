import { ethers } from 'hardhat'
import { Contract, Signer } from 'ethers'
import { writeJsonNow } from './json'

const { formatEther } = ethers.utils

export async function deploy<T extends Contract>(
    signer: Signer,
    contractName: string,
    deployedFactory: T
): Promise<{ contract: T }> {
    const sender = await signer.getAddress()

    console.log(`Deploying ${contractName} from account`, sender)

    const tx = await deployedFactory.deployTransaction.wait()

    const deployAddress = deployedFactory.address
    const gasPrice = deployedFactory.deployTransaction.gasPrice!
    const gasUsed = tx.gasUsed
    const fee = gasUsed.mul(gasPrice)
    const chainId = (await ethers.provider.getNetwork()).chainId

    writeJsonNow('deploy_logs', `${contractName}-${chainId}`, [
        {
            contractName,
            deployAddress,
            sender,
            gasPrice: gasPrice.toString(),
            gasUsed: gasUsed.toString(),
            fee: fee.toString(),
            chainId
        }
    ])

    console.log(
        `Done. Tx fee: ${formatEther(
            fee
        )} | Gas used: ${gasUsed} | Gas price: ${formatEther(gasPrice)}`
    )

    console.log(`${contractName} address:`, deployAddress)

    return { contract: deployedFactory }
}
