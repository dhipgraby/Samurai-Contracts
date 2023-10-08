// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract PoolTypes {
    enum PoolType {
        OneDay,
        OneWeek,
        OneMonth,
        SixMonths,
        OneYear,
        Custom,
        Special0,
        Special1
    }
}