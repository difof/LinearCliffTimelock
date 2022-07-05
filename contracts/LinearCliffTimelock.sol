// SPDX-License-Identifier: AGPL-3.0-only

pragma solidity ^0.8.14;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/AccessControlEnumerable.sol';
import './ILinearCliffTimelock.sol';
import './TimeContext.sol';

contract LinearCliffTimelock is
    ILinearCliffTimelock,
    ReentrancyGuard,
    AccessControlEnumerable,
    TimeContext
{
    string private constant ERROR_ALREADY_INITIALIZED =
        'ERROR_ALREADY_INITIALIZED';
    string private constant ERROR_NOT_INITIALIZED = 'ERROR_NOT_INITIALIZED';
    string private constant ERROR_NOT_YET = 'ERROR_NOT_YET';
    string private constant ERROR_EMPTY = 'ERROR_EMPTY';
    string private constant ERROR_EDGE_BT_END = 'ERROR_EDGE_BT_END';
    string private constant ERROR_EDGE_LT_NOW = 'ERROR_EDGE_LT_NOW';
    string private constant ERROR_CANNOT_REVOKE = 'ERROR_CANNOT_REVOKE';

    bytes32 private constant INITIALIZE_ROLE = keccak256('INITIALIZE_ROLE');
    bytes32 private constant WITHDRAW_ROLE = keccak256('WITHDRAW_ROLE');

    IERC20 public token;
    address public beneficiary;
    uint256 public totalLocked;
    uint256 public cliffStart; // timestamp of lock start in seconds
    uint256 public cliffTimePeriod; // number of seconds for each cliff
    uint256 public cliffEdge; // timestamp of next cliff release in seconds
    uint256 public cliffEnd; // timestamp of lock end in seconds

    bool public initialized;
    uint256 public cliffAmount; // amount to be released at each cliff

    modifier mustBeInitialized() {
        require(initialized, ERROR_NOT_INITIALIZED);
        _;
    }

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(INITIALIZE_ROLE, _msgSender());
    }

    function revokeRole(bytes32 role, address account)
        public
        virtual
        override(IAccessControl, AccessControl)
    {
        // TODO: turn this into a require when sober
        if (role == WITHDRAW_ROLE && account == beneficiary) {
            revert(ERROR_CANNOT_REVOKE);
        }

        super.revokeRole(role, account);
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
    ) external virtual nonReentrant onlyRole(INITIALIZE_ROLE) {
        require(!initialized, ERROR_ALREADY_INITIALIZED);

        uint256 edge = _cliffStart + _cliffTimePeriod;
        require(edge >= _blockTimestamp(), ERROR_EDGE_LT_NOW);
        require(edge <= _cliffEnd, ERROR_EDGE_BT_END);

        _token.transferFrom(_sender, address(this), _amount);

        _grantRole(WITHDRAW_ROLE, _beneficiary);

        beneficiary = _beneficiary;
        token = _token;
        totalLocked = _amount;
        cliffStart = _cliffStart;
        cliffEdge = edge;
        cliffEnd = _cliffEnd;
        cliffTimePeriod = _cliffTimePeriod;

        uint256 numCliffs = (cliffEnd - cliffStart) / cliffTimePeriod;
        cliffAmount = totalLocked / numCliffs;

        initialized = true;

        emit OnInitialized(
            token,
            beneficiary,
            totalLocked,
            cliffStart,
            cliffEnd,
            cliffTimePeriod
        );
    }

    function withdraw()
        external
        virtual
        onlyRole(WITHDRAW_ROLE)
        nonReentrant
        mustBeInitialized
    {
        uint256 _now = _blockTimestamp();

        if (_now >= cliffEnd) {
            uint256 _balance = token.balanceOf(address(this));
            require(_balance > 0, ERROR_EMPTY);

            token.transfer(beneficiary, _balance);

            emit OnWithdraw(_balance, 0);

            return;
        }

        require(_now >= cliffEdge, ERROR_NOT_YET);

        uint256 numPastCliffs = ((_now - cliffEdge) / cliffTimePeriod) + 1;
        uint256 amount = numPastCliffs * cliffAmount;

        token.transfer(beneficiary, amount);

        cliffEdge += numPastCliffs * cliffTimePeriod;

        emit OnWithdraw(amount, cliffEdge);
    }

    function balance() public view mustBeInitialized returns (uint256) {
        return token.balanceOf(address(this));
    }
}
