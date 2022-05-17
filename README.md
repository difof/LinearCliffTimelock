# LinearCliffTimelock

Lock any ERC20, release in periods!

## Usage

Just

`yarn install && yarn test`

## Deploy

Deploy the [LinearCliffTimelock.sol](contracts/LinearCliffTimelock.sol)

Approve the contract for the amount you want to lock.

Call [initialize](contracts/LinearCliffTimelock.sol#L49) to setup the vesting.
It will transfer given amount from `msg.sender` to vesting contract.

### Notes

All of the timings are in seconds.

[Vesting test](tests/vesting.ts) will deploy [MockTimelock.sol](contracts/MockTimelock.sol)
instead of the timelock contract to have control over `block.timestamp`
