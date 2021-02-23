const { deployMockContract } = require('ethereum-waffle')

const { ethers, BigNumber } = require('ethers')
const { expect } = require('chai')
const hre = require('hardhat')
const { green } = require('chalk')
const { AddressZero } = require('ethers').constants
const now = () => (new Date()).getTime() / 1000 | 0

const toWei = ethers.utils.parseEther


const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('Operations', function() {


  let wallet, wallet2, wallet3, wallet4
  let operationsContract;
  let poolToken;
  const initialMint = "1000000"
  const startAwardFunctionSignature = "0xb9ee1e05" // found by calling etheres.interface.getSighash("startAward()")
  const completeAwardFunctionSignature = '0xdfb2f13b'  // found by calling etheres.interface.getSighash("completeAward()")

  const startAwardReward = "5"
  const completeAwardReward = "10"


  let prizePeriodStart = now()
  let prizePeriodSeconds = 1000
  let prizePool
  let prizeStrategy

  beforeEach(async () => {
    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    
    const operationsContractFactory = await hre.ethers.getContractFactory("Operations", wallet, overrides)
    const ERC20MintableContract =  await hre.ethers.getContractFactory("ERC20Mintable", wallet, overrides)

    
    poolToken = await ERC20MintableContract.deploy('Mock Pool', 'POOL', ethers.utils.parseEther(initialMint))
    operationsContract = await operationsContractFactory.deploy(poolToken.address, wallet.address)
    

    const PeriodicPrizeStrategyHarness =  await hre.ethers.getContractFactory("PeriodicPrizeStrategyHarness", wallet, overrides)
    prizeStrategy = await PeriodicPrizeStrategyHarness.deploy()
    console.log(`PrizeStrategy at ${prizeStrategy.address}`)
    
    // console.log(prizeStrategy)

    console.log(`deploying RNGServiceMock`)
    const RNGInterface = await hre.artifacts.readArtifact("RNGServiceMock")
    rng = await deployMockContract(wallet, RNGInterface.abi, overrides)

    console.log("deploying mock prizepool")
    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    prizePool = await deployMockContract(wallet, PrizePool.abi, overrides)

    console.log("deploying mock prize strategy")
    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategy")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
    await prizeStrategy.mock.startAward.returns()
    await prizeStrategy.mock.completeAward.returns()
 
 
    // const intializeResult = await prizeStrategy.initialize(
    //   prizePeriodStart,
    //   prizePeriodSeconds,
    //   prizePool.address,
    //   SENTINAL, // ticket.address
    //   SENTINAL, //sponsorship.address
    //   rng.address,
    //   []
    // )
    
  })

  describe('admin able to add/remove operations and targets', () => {
    it('adds operations to the contract', async () => {

      //check OperationUpdated event was emmited
      await expect(operationsContract.addOrUpdateOperations([startAwardFunctionSignature, completeAwardFunctionSignature],
      [ethers.utils.parseEther(startAwardReward), ethers.utils.parseEther(completeAwardReward)]))
      .to.emit(operationsContract, "OperationUpdated")

    })
    it('removes operations to the contract', async () => {
      await expect(operationsContract.removeOperations([startAwardFunctionSignature])).to.emit(operationsContract, "OperationUpdated") 
    })


    it('adds targets to the contract', async () => {
      await expect(operationsContract.addTargets([prizeStrategy.address])).to.emit(operationsContract, "TargetUpdated")    
    })


    it('removes targets to the contract', async () => {
      await expect(operationsContract.removeTargets([prizeStrategy.address])).to.emit(operationsContract, "TargetUpdated")    
    })


  })

  describe('non-admin unable to add/remove operations and targets', () => {
    let nonAdminUserOperationsContract
    beforeEach(async()=>{
      nonAdminUserOperationsContract = await hre.ethers.getContractAt("Operations", operationsContract.address, wallet2)
    })


    it('tries to add operations to the contract and reverts', async () => {     
       await expect(nonAdminUserOperationsContract.addOrUpdateOperations([startAwardFunctionSignature], [90999990909])).
       to.be.revertedWith("Operations - not default admin")
    })

    it('tries to add targets to the contract and reverts', async () => {     
      await expect(nonAdminUserOperationsContract.addTargets([wallet2.address, wallet3.address])).
      to.be.revertedWith("Operations - not default admin")
    })
    it('tries to remove operations from the contract and reverts', async () => {     
      await expect(nonAdminUserOperationsContract.removeOperations([startAwardFunctionSignature])).
      to.be.revertedWith("Operations - not default admin")
    })
    it('tries to remove targets to the contract and reverts', async () => {     
      await expect(nonAdminUserOperationsContract.removeTargets([wallet2.address, wallet3.address])).
      to.be.revertedWith("Operations - not default admin")
    })




  })
  describe('user able to call operations and receive pool tokens', () => {
    let userOperationsContract
    beforeEach(async() =>{
      userOperationsContract = await hre.ethers.getContractAt("Operations", operationsContract.address, wallet3)
      operationsContract = await hre.ethers.getContractAt("Operations", operationsContract.address, wallet)
      await operationsContract.addTargets([prizeStrategy.address])
      await operationsContract.addOrUpdateOperations([startAwardFunctionSignature], [ethers.utils.parseEther(startAwardReward)])
      await poolToken.transfer(operationsContract.address, ethers.utils.parseEther("100"))
    })
    it('successfully calls startAward() and receives token reward', async() => {
      //check balance before
      const userBalanceBefore = await poolToken.balanceOf(wallet3.address)

      // make call
      const userCallResult = await userOperationsContract.callOperation(prizeStrategy.address, startAwardFunctionSignature, [])
      const userBalanceAfter = await poolToken.balanceOf(wallet3.address)

      const award = BigNumber.from(startAwardReward)
      
      expect(userBalanceAfter).to.equal(userBalanceBefore.plus(award))


    })

  })

});
