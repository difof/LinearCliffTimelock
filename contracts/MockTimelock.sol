// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

import './LinearCliffTimelock.sol';

contract MockTimelock is LinearCliffTimelock {
    uint256 private mockTime = 0;

    function setNow(uint256 _now) external {
        mockTime = _now;
    }

    function _getNow() internal view virtual override returns (uint256) {
        return mockTime;
    }
}
