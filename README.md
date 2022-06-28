# LinearCliffTimelock

Lock any ERC20, release in periods!

## Usage

Just

`yarn install && yarn test`

### Deploy

Deploy the [LinearCliffTimelock.sol](contracts/LinearCliffTimelock.sol).

**NOTE** The deployer will be granted `DEFAULT_ADMIN_ROLE` and `INITIALIZE_ROLE` so that only the admin can call initialize function.

Approve the contract for the amount you want to lock.

Call [initialize](contracts/LinearCliffTimelock.sol#L49) to setup the vesting.
It will transfer given amount from `_sender` to vesting contract.
Anyone with `WITHDRAW_ROLE` can call [withdraw](contracts/LinearCliffTimelock.sol#L98) to transfer the claimable amount to the beneficiary.

## Notes

All of the timings are in seconds.

[Vesting test](tests/vesting.ts) will deploy [MockTimelock.sol](contracts/MockTimelock.sol)
instead of the timelock contract to have control over `block.timestamp`
