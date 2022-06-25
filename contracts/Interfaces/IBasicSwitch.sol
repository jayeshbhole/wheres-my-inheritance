// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface IBasicSwitch {
    function keepAlive() external payable;

    function claimInheritance() external;
}
