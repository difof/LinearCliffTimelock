# LinearCliffTimelock

Lock any ERC20, release in periods!

## Usage

`npm install @difof/lct`

Then import in Solidity:

`import "@difof/lct/contracts/LinearCliffTimelock.sol"`

Or use the typechain in TypeScript:

`import { LinearCliffTimelock } from '@difof/lct/typechain'`

## Build and test

Just

`yarn install && yarn test`

## Deploy

1. Inherit and deploy the [LinearCliffTimelock.sol](contracts/LinearCliffTimelock.sol).

    **NOTE** The deployer will be granted `DEFAULT_ADMIN_ROLE` and `INITIALIZE_ROLE` so that only the admin can call initialize function.

2. Approve the contract for the amount you want to lock.

3. Call [initialize](contracts/LinearCliffTimelock.sol#L49) to setup the vesting.

    It will transfer given amount from `_sender` to vesting contract.

    Anyone with `WITHDRAW_ROLE` can call [withdraw](contracts/LinearCliffTimelock.sol#L98) to transfer the claimable amount to the beneficiary.

### Registry

The [TLPublicRegistry](contracts/TLPublicRegistry.sol) contract is a registry for any deployed timelock
to map beneficiaries to their timelocks for easier lookup.
The contract is deployed on supported networks to be used by the [LCT user interface](https://github.com/difof/lct-ui).

Call the `addTimelock` function of the registry to map a beneficiary to a timelock on same network.

Here is a list of registry addresses on supported networks:

| Network   |                  Address                   |
| :-------- | :----------------------------------------: |
| Polygon   | 0xFD6378CfFC8aD8036987835dd01Bf186d94e0268 |
| Ethereum  |                    TBD                     |
| BNB Chain |                    TBD                     |

## Notes

All of the timings are in seconds.

[Vesting test](tests/vesting.ts) will deploy [MockTimelock.sol](contracts/MockTimelock.sol)
instead of the timelock contract to have control over `block.timestamp`
