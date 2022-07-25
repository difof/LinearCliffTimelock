// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.14;

import '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/**
 * @notice A modular timelock for vesting any ERC20 token.
 * @dev Once the timelock is deployed, contract must be approved to spend the amount of token on behalf on the sender.
 * @dev `initialize` function must be called by the `INITIALIZE_ROLE` role (or from deployer by default) to initialize the timelock.
 * @dev Anyone with `WITHDRAW_ROLE` can withdraw to the beneficiary.
 * @dev Timelock cliff defines how many times and how many tokens can the beneficiary withdraw in timelock start and end periods.
 */
interface ILinearCliffTimelock is IERC165 {
    event OnInitialized(
        IERC20 indexed token,
        address indexed beneficiary,
        uint256 indexed amount,
        uint256 cliffStart,
        uint256 cliffEnd,
        uint256 cliffTimePeriod
    );

    /**
     * @dev Emitted on token withdraw
     * @param amount The amount of tokens withdrawn
     * @param next Next timestamp for tokens to be released. If 0, the timelock is over.
     */
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

    /**
     * @notice Call this function after deploying and allowing the timelock to spend the token from sender.
     * @dev if `_cliffTimePeriod` is `_cliffEnd` - `_cliffStart`, then the timelock will be released at the end of the cliff period.
     * @param _token Token to be spent and locked.
     * @param _amount Amount of token to be locked.
     * @param _sender Sender/spender of the token.
     * @param _beneficiary Beneficiary of the token whom the tokens will be withdrawn to.
     * @param _cliffStart Timestamp of lock start in seconds.
     * @param _cliffEnd Timestamp of lock end in seconds.
     * @param _cliffTimePeriod Duration of each cliff in seconds.
     */
    function initialize(
        IERC20 _token,
        uint256 _amount,
        address _sender,
        address _beneficiary,
        uint256 _cliffStart,
        uint256 _cliffEnd,
        uint256 _cliffTimePeriod
    ) external;

    /**
     * @notice Withdraw the locked tokens to the beneficiary.
     * @dev If cliff edge is past `now`, then all of the tokens will be withdrawn.
     */
    function withdraw() external;

    /// @return - Balance of the timelock in locked tokens.
    function balance() external view returns (uint256);
}
