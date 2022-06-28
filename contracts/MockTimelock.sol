// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

import './LinearCliffTimelock.sol';

contract MockTimelock is LinearCliffTimelock, MockTimeContext {
    function _blockNumber() internal view override returns (uint256) {
        return _mockBlockNumber;
    }

    function _blockTimestamp() internal view override returns (uint256) {
        return _mockBlockTimestamp;
    }
}
