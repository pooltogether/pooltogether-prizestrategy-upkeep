pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../interfaces/PeriodicPrizeStrategyInterface.sol";



library SafeAwardable{

    function canCompleteAward(address self) internal returns (bool canCompleteAward){
        if(supportsFunction(self, PeriodicPrizeStrategyInterface.canCompleteAward.selector)){
            if(PeriodicPrizeStrategyInterface(self).canCompleteAward()){
                return true;
            }
        }
        return false;

    }
    
    function canStartAward(address self) internal returns (bool canStart){
        if(supportsFunction(self, PeriodicPrizeStrategyInterface.canStartAward.selector)){
            if(PeriodicPrizeStrategyInterface(self).canStartAward()){
                return true;
            }
        }
        return false;
    }

    function supportsFunction(address self, bytes4 selector) internal returns (bool success){
        bytes memory encodedParams = abi.encodeWithSelector(selector);
        (bool success, bytes memory result) = self.staticcall{ gas: 30000 }(encodedParams);
        if (result.length < 32){
            return (false);
        }
        return (success);
    }
}