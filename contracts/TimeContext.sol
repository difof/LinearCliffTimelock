// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

abstract contract TimeContext {
    function _blockTimestamp() internal view virtual returns (uint256) {
        return block.timestamp;
    }

    function _blockNumber() internal view virtual returns (uint256) {
        return block.number;
    }
}

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
