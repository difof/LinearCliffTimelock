import { ethers } from 'hardhat'
import { BigNumber, Contract, ContractReceipt } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { expect } from 'chai'

const getnow = () => Math.trunc(Date.now() / 1000)

function burnAddress(): string {
    return `0x${'f'.repeat(40)}`
}

async function checkBalance(
    token: Contract,
    user: SignerWithAddress,
    expectedBalance: BigNumber
) {
    let userbalance = await token.balanceOf(user.address)
    expect(
        userbalance.eq(expectedBalance),
        `user balance ${formatEther(userbalance)} != ${formatEther(
            expectedBalance
        )}`
    ).to.be.true
}

async function deployVesting(
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

async function initVesting(
    token: Contract,
    owner: SignerWithAddress,
    user: SignerWithAddress,
    amount: BigNumber,
    cliffDuration: number
): Promise<{ vesting: Contract; now: number; cliffAmount: BigNumber }> {
    let now = getnow()
    let cliffStart = now
    let cliffEnd = cliffStart + cliffDuration
    let cliffPeriod = 1

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

    expect(amount.eq(await vesting.balance()), 'vesting balance').to.be.true

    let availableCliffs = (cliffEnd - cliffStart) / cliffPeriod
    let cliffAmount = amount.div(BigNumber.from(availableCliffs))

    return { vesting, now, cliffAmount }
}

async function testWithdraw(
    vesting: Contract,
    now: number,
    cliffAmount: BigNumber,
    check = true
): Promise<BigNumber> {
    await (await vesting.setNow(Math.trunc(now))).wait()

    let tx = (await (await vesting.withdraw()).wait()) as ContractReceipt
    const init = tx.events?.find((event) => event.event! === 'OnWithdraw')!

    if (check) {
        expect(
            init.args?.amount == cliffAmount.toString(),
            'correct withdraw amount'
        ).to.be.true
    }

    return init.args?.amount
}

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

        try {
            await testWithdraw(vesting, now++, cliffAmount, false)
            expect(false, 'MUST FAIL').to.be.true
        } catch {}

        await checkBalance(token, user, amount)
    })
})
