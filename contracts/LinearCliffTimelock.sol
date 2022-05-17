// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

// LinearCliffTimelock
// @notice Locks ERC20 tokens for specified duration.
// @notice Tokens will be released on predefined periods, withdrawable from first cliff edge, not cliff start.
// @notice After deploy, contract must have allowance to transfer tokens to itself.
// @notice Once approved, call {initialize} function to setup the vesting.
contract LinearCliffTimelock is ReentrancyGuard {
    string private constant ERROR_ONLY_BENEFICIARY = 'ERROR_ONLY_BENEFICIARY';
    string private constant ERROR_ALREADY_INITIALIZED =
        'ERROR_ALREADY_INITIALIZED';
    string private constant ERROR_NOT_INITIALIZED = 'ERROR_NOT_INITIALIZED';
    string private constant ERROR_NOT_YET = 'ERROR_NOT_YET';
    string private constant ERROR_EMPTY = 'ERROR_EMPTY';
    string private constant ERROR_EDGE_BT_END = 'ERROR_EDGE_BT_END';
    string private constant ERROR_EDGE_LT_NOW = 'ERROR_EDGE_LT_NOW';

    event OnInitialized(
        address indexed beneficiary,
        IERC20 indexed token,
        uint256 indexed amount,
        uint256 cliffStart,
        uint256 cliffEnd,
        uint256 cliffTimePeriod
    );
    event OnWithdraw(uint256 indexed amount, uint256 next);

    address public beneficiary;
    IERC20 public token;
    uint256 public totalLocked;
    uint256 public cliffStart; // timestamp of lock start in seconds
    uint256 public cliffTimePeriod; // number of seconds for each cliff
    uint256 public cliffEdge; // timestamp of next cliff release in seconds
    uint256 public cliffEnd; // timestamp of lock end in seconds
    bool public initialized;

    modifier mustBeInitialized() {
        require(initialized, ERROR_NOT_INITIALIZED);
        _;
    }

    // initialize
    // @dev Owner must approve this contract to spend given `_amount`
    function initialize(
        IERC20 _token,
        uint256 _amount,
        address _sender,
        address _beneficiary,
        uint256 _cliffStart,
        uint256 _cliffEnd,
        uint256 _cliffTimePeriod
    ) public nonReentrant {
        require(!initialized, ERROR_ALREADY_INITIALIZED);

        uint256 edge = _cliffStart + _cliffTimePeriod;
        require(edge >= _getNow(), ERROR_EDGE_LT_NOW);
        require(edge <= _cliffEnd, ERROR_EDGE_BT_END);

        _token.transferFrom(_sender, address(this), _amount);

        beneficiary = _beneficiary;
        token = _token;
        totalLocked = _amount;
        cliffStart = _cliffStart;
        cliffEdge = edge;
        cliffEnd = _cliffEnd;
        cliffTimePeriod = _cliffTimePeriod;
        initialized = true;

        emit OnInitialized(
            beneficiary,
            token,
            totalLocked,
            cliffStart,
            cliffEnd,
            cliffTimePeriod
        );
    }

    function withdraw() public nonReentrant mustBeInitialized {
        require(msg.sender == beneficiary, ERROR_ONLY_BENEFICIARY);

        uint256 _now = _getNow();

        if (_now >= cliffEnd) {
            uint256 _balance = token.balanceOf(address(this));
            require(_balance > 0, ERROR_EMPTY);

            token.transfer(beneficiary, _balance);

            emit OnWithdraw(_balance, 0);

            return;
        }

        require(_now >= cliffEdge, ERROR_NOT_YET);

        uint256 numCliffs = (cliffEnd - cliffStart) / cliffTimePeriod;
        uint256 cliffAmount = totalLocked / numCliffs;
        uint256 availableCliffs = ((_now - cliffEdge) / cliffTimePeriod) + 1;
        uint256 amount = availableCliffs * cliffAmount;

        token.transfer(beneficiary, amount);

        cliffEdge += availableCliffs * cliffTimePeriod;

        emit OnWithdraw(amount, cliffEdge);
    }

    function balance() public view mustBeInitialized returns (uint256) {
        return token.balanceOf(address(this));
    }

    function _getNow() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
