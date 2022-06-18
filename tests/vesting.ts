import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { parseEther } from 'ethers/lib/utils'
import { expect } from 'chai'
import {
    burnAddress,
    checkBalance,
    initVesting,
    testWithdraw
} from './helpers/vesting-helpers'

describe('Vesting test', async () => {
    let owner: SignerWithAddress
    let user: SignerWithAddress
    let token: Contract
    let amount = parseEther('200')

    before(async () => {
        let signers = await ethers.getSigners()
        owner = signers[0]
        user = signers[1]

        let tokenFactory = await ethers.getContractFactory('NewToken', owner)
        let tokenDeploy = await tokenFactory.deploy(parseEther('1000000'))
        token = await tokenDeploy.deployed()
    })

    afterEach(async () => {
        let userConnection = token.connect(user)
        let userBalance = await userConnection.balanceOf(user.address)
        await (await userConnection.transfer(burnAddress(), userBalance)).wait()
    })

    it('should not init if edge < now', async () => {
        await expect(
            initVesting(token, owner, user, amount, 1, -2),
            'edge before now'
        ).to.be.reverted
    })

    it('should not init if edge > end', async () => {
        await expect(
            initVesting(token, owner, user, amount, 1, 0, 2),
            'edge after end'
        ).to.be.reverted
    })

    it('should not withdraw before edge', async () => {
        let { vesting, now, cliffAmount } = await initVesting(
            token,
            owner,
            user,
            amount,
            1
        )

        await expect(
            testWithdraw(vesting, now++, cliffAmount),
            'withdrawn before edge'
        ).to.be.reverted

        await testWithdraw(vesting, now, cliffAmount)

        await checkBalance(token, user, amount)
    })

    it('should withdraw in order', async () => {
        let { vesting, now, cliffAmount } = await initVesting(
            token,
            owner,
            user,
            amount,
            4
        )

        now++

        await testWithdraw(vesting, now++, cliffAmount)
        await testWithdraw(vesting, now++, cliffAmount)
        await testWithdraw(vesting, now++, cliffAmount)
        await testWithdraw(vesting, now++, cliffAmount)

        await checkBalance(token, user, amount)
    })

    it('should withdraw skipping', async () => {
        let { vesting, now, cliffAmount } = await initVesting(
            token,
            owner,
            user,
            amount,
            3
        )

        now += 2

        await testWithdraw(vesting, now++, cliffAmount, false)
        await testWithdraw(vesting, now++, cliffAmount, false)

        // fail to withdraw if all is withdrawn
        await expect(
            testWithdraw(vesting, now++, cliffAmount, false),
            'withdrawn after end'
        ).to.be.reverted

        await checkBalance(token, user, amount)
    })

    it('should withdraw past end', async () => {
        let { vesting, now, cliffAmount } = await initVesting(
            token,
            owner,
            user,
            amount,
            2
        )

        now += 2

        await testWithdraw(vesting, now, cliffAmount, false)

        await checkBalance(token, user, amount)
    })
})
