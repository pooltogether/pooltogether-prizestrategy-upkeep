pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/KeeperCompatibleInterface.sol";
import "./interfaces/PeriodicPrizeStrategyInterface.sol";
import "./interfaces/PrizePoolInterface.sol";
import "./utils/MappedSinglyLinkedList.sol";

contract PrizePoolRegistry is Ownable{

    using MappedSinglyLinkedList for MappedSinglyLinkedList.Mapping;

    event PrizePoolAdded(address indexed prizePool);
    event PrizePoolRemoved(address indexed prizePool);

    MappedSinglyLinkedList.Mapping internal prizePoolList;

    constructor() Ownable(){
        prizePoolList.initialize();
    }

    function getPrizePools() external returns(address[] memory){
        return prizePoolList.addressArray();
    } 

    function addPrizePools(address[] calldata _prizePools) public onlyOwner {
        for(uint8 prizePool = 0; prizePool < _prizePools.length; prizePool++ ){ 
            prizePoolList.addAddress(_prizePools[prizePool]);
            emit PrizePoolAdded(_prizePools[prizePool]);
        }
    }


    function removePrizePool(address _previousPrizePool, address _prizePool ) public onlyOwner{
        prizePoolList.removeAddress(_previousPrizePool, _prizePool); 
        emit  PrizePoolRemoved(_prizePool);
    } 


}