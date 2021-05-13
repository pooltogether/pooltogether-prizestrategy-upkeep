# PoolTogether PrizePool Upkeep

[![Coverage Status](https://coveralls.io/repos/github/pooltogether/pooltogether-operations-contracts/badge.svg?branch=main)](https://coveralls.io/github/pooltogether/pooltogether-operations-contracts?branch=main)
![Tests](https://github.com/pooltogether/pooltogether-prizepool-upkeep/actions/workflows/main.yml/badge.svg)

PoolTogether Operations contracts is PoolTogether's integration with ChainLinks upkeep system, [currently in beta](https://docs.chain.link/docs/kovan-keeper-network-beta/).

## How it works

The goal of this system is to fully automate the awarding of the PoolTogether governance owned prize pools.

A registry of these prize pools exists (as an Ownable MappedSinglyLinkedList) and the prize strategy for each prize pool checked every block (`canStartAward()` and `canCompleteAward()`) to see if upkeep is required.

If upkeep is required then either `startAward()` or `completeAward()` are called on the prize pool. 

To prevent out-of-gas situations, an owner updatable `upkeepBatchSize` is maintained to prevent attempting to award too many prize strategies in the same transaction.

An owner updatable `upkeepMinimumBlockInterval` is also maintained so as to mitigate multiple `performUpkeep()` transactions within the same block - if a transaction is to be included in the same block, it will revert. 

# Installation
Install the repo and dependencies by running:
`yarn`

## Deployment
These contracts can be deployed to a network by running:
`yarn deploy <networkName>`

# Testing
Run the unit tests locally with:
`yarn test`

## Coverage
Generate the test coverage report with:
`yarn coverage`