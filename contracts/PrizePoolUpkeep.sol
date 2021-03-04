pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;


import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategyInterface.sol";
import "./interfaces/PrizePoolRegistryInterface.sol";
import "./interfaces/PrizePoolInterface.sol";


import "hardhat/console.sol";


contract PrizePoolUpkeep is KeeperCompatibleInterface {

    address public prizePoolRegistry;

    uint public upkeepBatchSize;
    
    constructor(address _prizePoolRegistry, uint256 _upkeepBatchSize) public {
        prizePoolRegistry = _prizePoolRegistry;
        upkeepBatchSize = _upkeepBatchSize;
    }

    /// @notice Checks if PrizePools require upkeep. Call in a static manner every block by the Chainlink Upkeep network.
    /// @param checkData Not used in this implementation.
    /// @return upkeepNeeded as true if performUpkeep() needs to be called, false otherwise. performData returned empty. 
    function checkUpkeep(bytes calldata checkData) override external returns (bool upkeepNeeded, bytes memory performData){

        address[] memory prizePools = PrizePoolRegistryInterface(prizePoolRegistry).getPrizePools();
        console.log("checkUpkeep at address ", prizePools[0]);
        // check if canStartAward
        for(uint256 pool = 0; pool < prizePools.length; pool++){
            console.log("in loop calling ", pool);
            address prizeStrategy = PrizePoolInterface(prizePools[pool]).prizeStrategy();
            if(PeriodicPrizeStrategyInterface(prizeStrategy).canStartAward()){
                upkeepNeeded = true;
                console.log("returning tru for address ", prizeStrategy);
                return (upkeepNeeded, performData);
            } 
        }
        // check if canCompleteAward
        for(uint256 pool = 0; pool < prizePools.length; pool++){
            address prizeStrategy = PrizePoolInterface(prizePools[pool]).prizeStrategy();
            if(PeriodicPrizeStrategyInterface(prizeStrategy).canCompleteAward()){
                upkeepNeeded = true;
                return (upkeepNeeded, performData);
            } 
        }

    }



    /// @notice Performs upkeep on the prize pools. 
    /// @param performData Not used in this implementation.
    function performUpkeep(bytes calldata performData) override external{

        address[] memory prizePools = PrizePoolRegistryInterface(prizePoolRegistry).getPrizePools();
     
        uint256 batchCounter = upkeepBatchSize; //counter for batch
        uint256 poolIndex = 0;
        
        while(batchCounter > 0 && poolIndex < prizePools.length){
            console.log("while loop ",poolIndex);
            address prizeStrategy = PrizePoolInterface(prizePools[poolIndex]).prizeStrategy();
            console.log("got prizeStrat address", prizeStrategy);            
            if(PeriodicPrizeStrategyInterface(prizeStrategy).canStartAward()){
                console.log("calling startAward on ", prizeStrategy);
                PeriodicPrizeStrategyInterface(prizeStrategy).startAward();
                batchCounter--;
            }
            else{
                if(PeriodicPrizeStrategyInterface(prizeStrategy).canCompleteAward()){
                     PeriodicPrizeStrategyInterface(prizeStrategy).completeAward();
                     batchCounter--;
                }

            }
            poolIndex++;
            
        }
  
    }

    fallback() external payable {
        // no-op
    }

}


