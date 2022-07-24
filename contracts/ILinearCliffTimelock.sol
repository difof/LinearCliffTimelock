// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.14;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface ILinearCliffTimelock is IERC165 {
    event OnInitialized(
        IERC20 indexed token,
        address indexed beneficiary,
        uint256 indexed amount,
        uint256 cliffStart,
        uint256 cliffEnd,
        uint256 cliffTimePeriod
    );

    event OnWithdraw(uint256 indexed amount, uint256 next);

    function token() external view returns (IERC20);

    function beneficiary() external view returns (address);

    function totalLocked() external view returns (uint256);

    function cliffStart() external view returns (uint256);

    function cliffEnd() external view returns (uint256);

    function cliffTimePeriod() external view returns (uint256);

    function cliffEdge() external view returns (uint256);

    function cliffAmount() external view returns (uint256);

    function initialized() external view returns (bool);

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
