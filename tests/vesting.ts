import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import {
    burnAddress,
    checkBalance,
    grantRole,
    initVesting,
    revokeRole,
    testWithdraw
} from './helpers/vesting-helpers'
import { IERC20, NewToken__factory } from '../typechain'

const { parseEther } = ethers.utils

describe('Vesting test', async () => {
    let owner: SignerWithAddress
    let user: SignerWithAddress
    let token: IERC20
    let amount = parseEther('200')

    before(async () => {
        let signers = await ethers.getSigners()
        owner = signers[0]
        user = signers[1]

        token = await new NewToken__factory(owner).deploy(parseEther('1000000'))
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

    it('should not revoke WITHDRAW_ROLE from beneficiary', async () => {
        let { vesting } = await initVesting(token, owner, user, amount, 1)

        await expect(
            revokeRole(vesting, 'WITHDRAW_ROLE', user),
            'revoke withdraw from beneficiary'
        ).to.be.reverted
    })

    it('should revoke WITHDRAW_ROLE from owner', async () => {
        let { vesting } = await initVesting(token, owner, user, amount, 1)

        await expect(
            grantRole(vesting, 'WITHDRAW_ROLE', owner),
            'granting WITHDRAW_ROLE to owner'
        ).to.not.be.reverted

        await expect(
            revokeRole(vesting, 'WITHDRAW_ROLE', owner),
            'revoking WITHDRAW_ROLE from owner'
        ).to.not.be.reverted
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
