import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import {
    burnAddress,
    checkBalance,
    grantRole,
    initVesting,
    revokeRole,
    testWithdraw,
    wtx
} from './helpers/vesting-helpers'
import {
    ERC20__factory,
    IERC20,
    NewToken,
    NewToken__factory,
    TLPublicRegistry,
    TLPublicRegistry__factory
} from '../typechain'

const { parseEther } = ethers.utils

describe('Registry test', async () => {
    let owner: SignerWithAddress
    let user: SignerWithAddress
    let token: IERC20
    let amount = parseEther('200')
    let registry: TLPublicRegistry

    before(async () => {
        let signers = await ethers.getSigners()
        owner = signers[0]
        user = signers[1]

        token = await new NewToken__factory(owner).deploy(parseEther('1000000'))
        registry = await new TLPublicRegistry__factory(owner).deploy()
    })

    it('should add timelock', async () => {
        let { vesting } = await initVesting(token, owner, user, amount, 1)
        let tx = registry.addTimelock(user.address, vesting.address)
        expect(tx, '').to.not.be.reverted
    })
})
