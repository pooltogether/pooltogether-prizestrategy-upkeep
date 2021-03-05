// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

interface PrizePoolRegistryInterface {
    function getPrizePools() external returns(address[] memory);
}