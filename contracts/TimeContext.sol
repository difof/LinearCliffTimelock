// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

/**
 * @dev Similar functionality to openzeppelin's Context which isolates msg.sender.
 * @dev TimeContext is used for mocking block timing information such as timestamp and number.
 * @dev It's recommended to inherit from TimeContext instead of using block.xyz directly.
 */
abstract contract TimeContext {
    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _blockNumber() internal view virtual returns (uint256) {
        return block.number;
    }
}

/**
 * @dev MockTimeContext must be inherited by a mock contract that also inherits a contract with TimeContext as its parent.
 * @dev This allows changing the block timestamp and number in unit tests.
 */
abstract contract MockTimeContext {
    uint256 internal _mockBlockTimestamp;
    uint256 internal _mockBlockNumber;

    function setBlockTimestamp(uint256 timestamp) public virtual {
        _mockBlockTimestamp = timestamp;
    }

    function setBlockNumber(uint256 blocknumber) public virtual {
        _mockBlockNumber = blocknumber;
    }
}
