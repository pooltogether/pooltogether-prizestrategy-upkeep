pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "../interfaces/PeriodicPrizeStrategyInterface.sol";


///@notice Wrapper library for address that checks that the address supports canStartAward() and canCompleteAward() before calling
library SafeAwardable{

    ///@return canCompleteAward returns true if the function is supported AND can be completed 
    function canCompleteAward(address self) internal returns (bool canCompleteAward){
        if(supportsFunction(self, PeriodicPrizeStrategyInterface.canCompleteAward.selector)){
            return PeriodicPrizeStrategyInterface(self).canCompleteAward();      
        }
        return false;
    }

    ///@return canStartAward returns true if the function is supported AND can be started, false otherwise
    function canStartAward(address self) internal returns (bool canStartAward){
        if(supportsFunction(self, PeriodicPrizeStrategyInterface.canStartAward.selector)){
            return PeriodicPrizeStrategyInterface(self).canStartAward();
        }
        return false;
    }
    
    ///@param selector is the function selector to check against
    ///@return success returns true if function is implemented, false otherwise
    function supportsFunction(address self, bytes4 selector) internal returns (bool success){
        bytes memory encodedParams = abi.encodeWithSelector(selector);
        (bool success, bytes memory result) = self.staticcall{ gas: 30000 }(encodedParams);
        if (result.length < 32){
            return (false);
        }
        return (success);
    }
}