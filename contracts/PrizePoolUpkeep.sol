pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;


import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategyInterface.sol";
import "./interfaces/PrizePoolRegistryInterface.sol";
import "./interfaces/PrizePoolInterface.sol";


import "hardhat/console.sol";


contract PrizePoolUpkeep is KeeperCompatibleInterface {

    address public prizePoolRegistry;

    constructor(address _prizePoolRegistry) public {
        prizePoolRegistry = _prizePoolRegistry;
    }

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


    function performUpkeep(bytes calldata performData) override external{
        console.log("performUpkeep");
        address[] memory prizePools = PrizePoolRegistryInterface(prizePoolRegistry).getPrizePools();
console.log("performUpkeep2");
        uint256 batchCounter = 10; //counter for batch
        uint256 poolIndex = 0;
        while(batchCounter > 0){
            address prizeStrategy = PrizePoolInterface(prizePools[poolIndex]).prizeStrategy();            
            if(PeriodicPrizeStrategyInterface(prizeStrategy).canStartAward()){
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

