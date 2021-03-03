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

describe('PrizePoolRegistry', function() {


  let wallet, wallet2, wallet3, wallet4
  let prizePoolRegistry;
  const initialMint = "1000000"
  const startAwardFunctionSignature = "0xb9ee1e05" // found by calling etheres.interface.getSighash("startAward()")
  const completeAwardFunctionSignature = '0xdfb2f13b'  // found by calling etheres.interface.getSighash("completeAward()")

  let prizePool1, prizePool2, prizePool3
  let prizeStrategy

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    console.log("getting registry factory")
    const prizePoolRegistryContractFactory = await hre.ethers.getContractFactory("PrizePoolRegistry", wallet, overrides)
    prizePoolRegistry = await prizePoolRegistryContractFactory.deploy()
    

    const PeriodicPrizeStrategyHarness =  await hre.ethers.getContractFactory("PeriodicPrizeStrategyHarness", wallet, overrides)
    prizeStrategy = await PeriodicPrizeStrategyHarness.deploy()
    console.log(`PrizeStrategy at ${prizeStrategy.address}`)
    
    // console.log(prizeStrategy)

    console.log(`deploying RNGServiceMock`)
    const RNGInterface = await hre.artifacts.readArtifact("RNGServiceMock")
    rng = await deployMockContract(wallet, RNGInterface.abi, overrides)

    console.log("deploying mock prizepool")
    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    prizePool1 = await deployMockContract(wallet, PrizePool.abi, overrides)
    prizePool2 = await deployMockContract(wallet, PrizePool.abi, overrides)
    


    console.log("deploying mock prize strategy")
    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategy")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
    await prizeStrategy.mock.startAward.returns()
    await prizeStrategy.mock.completeAward.returns()
 
    await prizePool1.mock.prizeStrategy.returns(prizeStrategy.address)
    await prizePool2.mock.prizeStrategy.returns(prizeStrategy.address)

  })

  describe('Owner able to add/remove prize pools to the registry', () => {
    it('adds pools to the registry', async () => {
      await expect(prizePoolRegistry.addPrizePools([prizePool1.address, prizePool2.address]))
      .to.emit(prizePoolRegistry, "PrizePoolAdded")
      .withArgs(prizePool1.address)

    })
    it('removes a pool from the registry', async () => {
      await expect(prizePoolRegistry.removePrizePool(prizePool2.address, prizePool1.address))
      .to.emit(prizePoolRegistry, "PrizePoolRemoved").withArgs(prizePool2.address)

    })


    it('reverts when non-owner tries to add a prizePool', async () => {

      await expect(prizePoolRegistry.connect(wallet2).addPrizePools([prizeStrategy.address])).to.be.revertedWith("Ownable: caller is not the owner")    
    })


    // it('removes targets to the contract', async () => {
    //   await expect(prizePoolRegistry.removeTargets([prizeStrategy.address])).to.emit(prizePoolRegistry, "TargetUpdated")    
    // })


  })

  // describe('non-admin unable to add/remove operations and targets', () => {
  //   let nonAdminUserOperationsContract
  //   beforeEach(async()=>{
  //     nonAdminUserOperationsContract = await hre.ethers.getContractAt("Operations", prizePoolRegristry.address, wallet2)
  //   })


  //   it('tries to add operations to the contract and reverts', async () => {     
  //      await expect(nonAdminUserOperationsContract.addOrUpdateOperations([startAwardFunctionSignature], [90999990909])).
  //      to.be.revertedWith("Operations - not default admin")
  //   })

  //   it('tries to add targets to the contract and reverts', async () => {     
  //     await expect(nonAdminUserOperationsContract.addTargets([wallet2.address, wallet3.address])).
  //     to.be.revertedWith("Operations - not default admin")
  //   })
  //   it('tries to remove operations from the contract and reverts', async () => {     
  //     await expect(nonAdminUserOperationsContract.removeOperations([startAwardFunctionSignature])).
  //     to.be.revertedWith("Operations - not default admin")
  //   })
  //   it('tries to remove targets to the contract and reverts', async () => {     
  //     await expect(nonAdminUserOperationsContract.removeTargets([wallet2.address, wallet3.address])).
  //     to.be.revertedWith("Operations - not default admin")
  //   })




  // })
  // describe('user able to call operations and receive pool tokens', () => {
  //   let userOperationsContract
  //   beforeEach(async() =>{
  //     userOperationsContract = await hre.ethers.getContractAt("Operations", prizePoolRegristry.address, wallet3)
  //     prizePoolRegristry = await hre.ethers.getContractAt("Operations", prizePoolRegristry.address, wallet)
  //     await prizePoolRegristry.addTargets([prizeStrategy.address])
  //     await prizePoolRegristry.addOrUpdateOperations([startAwardFunctionSignature], [ethers.utils.parseEther(startAwardReward)])
  //     await poolToken.transfer(prizePoolRegristry.address, ethers.utils.parseEther("100"))
  //   })
  //   it('successfully calls startAward() and receives token reward', async() => {
  //     //check balance before
  //     const userBalanceBefore = await poolToken.balanceOf(wallet3.address)

  //     // make call
  //     const userCallResult = await userOperationsContract.callOperation(prizeStrategy.address, startAwardFunctionSignature, [])
  //     const userBalanceAfter = await poolToken.balanceOf(wallet3.address)

  //     const award = BigNumber.from(startAwardReward)
      
  //     expect(userBalanceAfter).to.equal(userBalanceBefore.plus(award))


  //   })

  // })

});
