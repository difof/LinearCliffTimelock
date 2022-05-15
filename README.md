# LinearCliffTimelock

Lock tokens, release based on periods.

## Usage

Deploy the [LinearCliffTimelock.sol](contracts/LinearCliffTimelock.sol)

Approve the contract for the amount you want to lock.

Call [initialize](contracts/LinearCliffTimelock.sol#L49) to setup the vesting.
It will transfer given amount from `msg.sender` to vesting contract.

All of the timings are in seconds.

### Notes

[Vesting test](tests/vesting.ts) will deploy [MockTimelock.sol](contracts/MockTimelock.sol)
instead of the timelock contract to have control over `block.timestamp`

# License

AGPL-3.0
