import { ethers } from 'hardhat'
import {
    BaseContract,
    BigNumber,
    Contract,
    ContractReceipt,
    ContractTransaction,
    Signer
} from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import {
    AccessControl,
    IERC20,
    MockTimeContext,
    MockTimelock,
    MockTimelock__factory
} from '../../typechain'

const { formatBytes32String, keccak256, toUtf8Bytes, formatEther } =
    ethers.utils

export function getnow() {
    return Math.trunc(Date.now() / 1000)
}

export function burnAddress(): string {
    return `0x${'f'.repeat(40)}`
}

// wait for transaction
export async function wtx(
    result: Promise<ContractTransaction>
): Promise<ContractReceipt> {
    return await (await result).wait()
}

export async function checkBalance(
    token: IERC20,
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
    token: IERC20,
    owner: SignerWithAddress,
    beneficiary: SignerWithAddress,
    amount: BigNumber,
    cliffStart: number,
    cliffEnd: number,
    cliffPeriod: number,
    mockNow: number = getnow()
): Promise<{ vesting: MockTimelock; tx: ContractReceipt }> {
    let vesting = await new MockTimelock__factory(beneficiary).deploy()

    await wtx(token.approve(vesting.address, amount))

    await wtx(vesting.setBlockTimestamp(Math.trunc(mockNow)))

    let tx = await wtx(
        vesting.initialize(
            token.address,
            amount,
            owner.address,
            beneficiary.address,
            Math.trunc(cliffStart),
            Math.trunc(cliffEnd),
            Math.trunc(cliffPeriod)
        )
    )

    return {
        vesting,
        tx
    }
}

export async function initVesting(
    token: IERC20,
    owner: SignerWithAddress,
    user: SignerWithAddress,
    amount: BigNumber,
    cliffDuration: number,
    cliffStartModifier: number = 0,
    cliffPeriod = 1
): Promise<{ vesting: MockTimelock; now: number; cliffAmount: BigNumber }> {
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
    vesting: MockTimelock,
    now: number,
    cliffAmount: BigNumber,
    checkWithdrawAmount = true
): Promise<BigNumber> {
    await (await vesting.setBlockTimestamp(Math.trunc(now))).wait()

    let tx = await wtx(vesting.withdraw())
    const init = tx.events?.find((event) => event.event! === 'OnWithdraw')!

    if (checkWithdrawAmount) {
        expect(init.args?.amount, 'correct withdraw amount').to.equal(
            cliffAmount
        )
    }

    return init.args?.amount
}
export interface Addressable {
    address: string
}

export const DEFAULT_ADMIN_ROLE = formatBytes32String('')

export const roleToBytes32 = (role: string) =>
    role == 'DEFAULT_ADMIN_ROLE'
        ? DEFAULT_ADMIN_ROLE
        : keccak256(toUtf8Bytes(role))

export const grantRole = async (
    accessControl: AccessControl,
    role: string,
    signer: Addressable
): Promise<ContractTransaction> =>
    accessControl.grantRole(roleToBytes32(role), signer.address)

export const revokeRole = async (
    accessControl: AccessControl,
    role: string,
    signer: Addressable
): Promise<ContractTransaction> =>
    accessControl.revokeRole(roleToBytes32(role), signer.address)

export async function setTimeContext(
    mockTimeContext: MockTimeContext,
    time: number,
    block: number
) {
    await wtx(mockTimeContext.setBlockTimestamp(time))
    await wtx(mockTimeContext.setBlockNumber(block))
}
