pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategy.sol";
import "./utils/MappedSinglyLinkedList.sol";

import "@nomiclabs/buidler/console.sol";


contract PrizePoolRegristry is Ownable{

    using MappedSinglyLinkedList for MappedSinglyLinkedList.Mapping;

    // mapping(address => bool) operationSupported;
    address public constant SENTINEL = address(0x1);

    // emitted when operation is added
    event OperationUpdated(bytes4 operation);

    event PrizePoolUpdated(address indexed prizePool);


    MappedSinglyLinkedList.Mapping internal prizePoolList;

    constructor() Ownable(){
        prizePoolList.initialize();
    }

    function getPrizePools() external returns(address[]){
        return prizePoolList.addressArray();
    } 


    // or should this functionality live in PrizePoolUpkeep.sol?
    function checkStartAwards() external returns (address [] memory canStartAward){
        address currentPrizePool = prizePoolList.start();
        while (currentPrizePool != address(0) && currentPrizePool != prizePoolList.end()) {
            if(PeriodicPrizeStrategy(currentPrizePool).isPrizePeriodOver() && !PeriodicPrizeStrategy(currentPrizePool).isRngRequested()){
                canStartAward.push(currentPrizePool);
            }   
        }
    }


    function checkCompleteAwards() external returns (address [] memory canCompleteAward){
        address currentPrizePool = prizePoolList.start();
        while (currentPrizePool != address(0) && currentPrizePool != prizePoolList.end()) {
            if(PeriodicPrizeStrategy(currentPrizePool).isRngRequested() && PeriodicPrizeStrategy(currentPrizePool).isRngCompleted()){
                canCompleteAward.push(currentPrizePool);
            }
        }
    }




    // add new operations
    // function addOrUpdateOperations(bytes4[] calldata operations) public onlyOwner {
    //     // ensure arrays are same size?
    //     for(uint8 op = 0; op < operations.length; op++){
    //         emit OperationUpdated(operations[op]);
    //     }
    // }

    // function removeOperations(bytes4[] calldata operations) public onlyOwner {
    //     for(uint8 op = 0; op < operations.length; op++ ){
    //         // delete rewardPerOperation[operations[op]];
    //         emit OperationUpdated(operations[op]);
    //     }
    // }

    function addPrizePools(address[] calldata _prizePools) public onlyOwner {
        for(uint8 prizePool = 0; prizePool < _prizePools.length; prizePool++ ){ // or better to use addAddresses() method but lose event?
            prizePoolList.addAddress(_prizePools[prizePool]);
            emit PrizePoolUpdated(_prizePools[prizePool]);
        }
    }

    // user must provide the SENTINEL for array length > 1
    function removePrizePools(address[] calldata _prizePools) public onlyOwner{

        if(_prizePools.length == 1){
            prizePoolList.removeAddress(_prizePools[0], SENTINEL); // cant get a constant from a library?
            emit  PrizePoolUpdated(_prizePools[0]);
            return;
        }

        for(uint8 prizePool = 0; prizePool < _prizePools.length; prizePool++ ){
            prizePoolList.removeAddress(_prizePools[prizePool], _prizePools[prizePool - 1]);       
            emit  PrizePoolUpdated(_prizePools[prizePool]);
        }
    } 


}