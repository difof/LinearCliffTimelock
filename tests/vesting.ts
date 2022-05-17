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

    it('should not withdraw before edge', async () => {
        let { vesting, now, cliffAmount } = await initVesting(
            token,
            owner,
            user,
            amount,
            1
        )

        try {
            await testWithdraw(vesting, now++, cliffAmount)
            expect(false, 'withdrawn before edge').to.be.true
        } catch {}

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
        try {
            await testWithdraw(vesting, now++, cliffAmount, false)
            expect(false, 'withdrawn after end').to.be.true
        } catch {}

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
