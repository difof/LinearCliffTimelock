// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.14;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface ILinearCliffTimelock {
    event OnInitialized(
        IERC20 indexed token,
        address indexed beneficiary,
        uint256 indexed amount,
        uint256 cliffStart,
        uint256 cliffEnd,
        uint256 cliffTimePeriod
    );

    event OnWithdraw(uint256 indexed amount, uint256 next);

    function initialize(
        IERC20 _token,
        uint256 _amount,
        address _sender,
        address _beneficiary,
        uint256 _cliffStart,
        uint256 _cliffEnd,
        uint256 _cliffTimePeriod
    ) external;

    function withdraw() external;

    function balance() external view returns (uint256);
}
