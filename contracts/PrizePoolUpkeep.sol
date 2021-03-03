pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;


import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategy.sol";



import "@nomiclabs/buidler/console.sol";


contract PrizePoolUpkeep is KeeperCompatibleInterface{

    address public prizePoolRegistry;

    constructor(address _prizePoolRegistry) public {
        prizePoolRegistry = _prizePoolRegistry;
    }

    function checkUpkeep(bytes calldata checkData) override external returns (bool upkeepNeeded, bytes memory performData){
        
        //forEach pool in prizePool, get the prizeStrategy, call startAward() (this will revert if it is too early to start the award period)

        // else call completeAward - this will revert if it is too early to start the award period? 

        // these two can happen out of lockstep

        address[] memory needsStartAward = prizePoolRegistry.checkStartAward();

        address[] memory needsCompleteAward = prizePoolRegistry.checkCompleteAward();

        if(needsStartAward.length > 0 || needsCompleteAward.length > 0){
            upkeepNeeded = true;
            if(needsStartAward.length > 0){
                performData = abi.encode(PeriodicPrizeStrategy.startAward.selector, needsStartAward);
            }

        }
        else{ // is this needed or would upkeepNeeded default to false?

        }


    }


    function performUpkeep(bytes calldata performData) override external{
    


        // while(){
        //     PeriodicPrizeStategy().startAward()
        // }
        


    }



    fallback() external payable {
        // no-op
    }

}


