// const { deployMockContract } = require('ethereum-waffle')

const { ethers } = require('ethers')
const { expect } = require('chai')
const hre = require('hardhat')
const { AddressZero } = require('ethers').constants


const toWei = ethers.utils.parseEther


const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 9500000 }

describe('Operations', function() {


  let wallet, wallet2, wallet3, wallet4
  let operationsContract;
  let poolToken;
  const initialMint = "1000000"
  const startAwardFunctionSignature = "0xb9ee1e05" // found by calling etheres.interface.getSighash("startAward()")
  const completeAwardFunctionSignature = '0xdfb2f13b'  // found by calling etheres.interface.getSighash("completeAward()")

  beforeEach(async () => {
    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    
    const operationsContractFactory = await hre.ethers.getContractFactory("Operations", wallet, overrides)
    const ERC20MintableContract =  await hre.ethers.getContractFactory("ERC20Mintable", wallet, overrides)
    
    poolToken = await ERC20MintableContract.deploy('Mock Pool', 'POOL', ethers.utils.parseEther(initialMint))
    operationsContract = await operationsContractFactory.deploy(poolToken.address, wallet.address)
   
    
  })

  describe('admin able to add/remove operations and targets', () => {
    it('adds operations to the contract', async () => {

      //check OperationUpdated event was emmited
      await expect(operationsContract.addOrUpdateOperations([startAwardFunctionSignature, completeAwardFunctionSignature], [5, 10]))
      .to.emit(operationsContract, "OperationUpdated")

    })
    it('adds targets to the contract', async () => {
      const addTargetsResult = await operationsContract.removeOperations()
    
    
    })


    
    it('removes operations to the contract', async () => {
      const removeOperationsResult = await operationsContract.removeOperations([startAwardFunctionSignature])

    
    
    })
  })

});
