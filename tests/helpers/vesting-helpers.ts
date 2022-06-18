import { ethers } from 'hardhat'
import { BigNumber, Contract, ContractReceipt } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { expect } from 'chai'

export function getnow() {
    return Math.trunc(Date.now() / 1000)
}

export function burnAddress(): string {
    return `0x${'f'.repeat(40)}`
}

export async function checkBalance(
    token: Contract,
    user: SignerWithAddress,
    expectedBalance: BigNumber
) {
    let userbalance = await token.balanceOf(user.address)

    expect(
        userbalance,
        `user balance ${formatEther(userbalance)} != ${formatEther(
            expectedBalance
        )} (expected)`
    ).to.equal(expectedBalance)
}

export async function deployVesting(
    token: Contract,
    owner: SignerWithAddress,
    beneficiary: SignerWithAddress,
    amount: BigNumber,
    cliffStart: number,
    cliffEnd: number,
    cliffPeriod: number,
    mockNow: number = getnow()
): Promise<{ vesting: Contract; tx: ContractReceipt }> {
    let vestingFactory = await ethers.getContractFactory(
        'MockTimelock',
        beneficiary
    )
    let vestingDeploy = await vestingFactory.deploy()
    let vesting = await vestingDeploy.deployed()

    await (await token.approve(vesting.address, amount)).wait()

    await (await vesting.setNow(Math.trunc(mockNow))).wait()

    let tx = await (
        await vesting.initialize(
            token.address,
            amount,
            owner.address,
            beneficiary.address,
            Math.trunc(cliffStart),
            Math.trunc(cliffEnd),
            Math.trunc(cliffPeriod)
        )
    ).wait()

    return {
        vesting,
        tx
    }
}

export async function initVesting(
    token: Contract,
    owner: SignerWithAddress,
    user: SignerWithAddress,
    amount: BigNumber,
    cliffDuration: number,
    cliffStartModifier: number = 0,
    cliffPeriod = 1
): Promise<{ vesting: Contract; now: number; cliffAmount: BigNumber }> {
    let now = getnow()
    let cliffStart = now + cliffStartModifier
    let cliffEnd = cliffStart + cliffDuration

    let { vesting } = await deployVesting(
        token,
        owner,
        user,
        amount,
        cliffStart,
        cliffEnd,
        cliffPeriod,
        now
    )

    expect(await vesting.balance(), 'vesting balance').to.equal(amount)

    let availableCliffs = (cliffEnd - cliffStart) / cliffPeriod
    let cliffAmount = amount.div(BigNumber.from(availableCliffs))

    return { vesting, now, cliffAmount }
}

export async function testWithdraw(
    vesting: Contract,
    now: number,
    cliffAmount: BigNumber,
    checkWithdrawAmount = true
): Promise<BigNumber> {
    await (await vesting.setNow(Math.trunc(now))).wait()

    let tx = (await (await vesting.withdraw()).wait()) as ContractReceipt
    const init = tx.events?.find((event) => event.event! === 'OnWithdraw')!

    if (checkWithdrawAmount) {
        expect(init.args?.amount, 'correct withdraw amount').to.equal(
            cliffAmount
        )
    }

    return init.args?.amount
}
