const { deployMockContract } = require('ethereum-waffle')
const hre = require('hardhat')
const { expect } = require('chai')

let overrides = { gasLimit: 200000000 }

const SENTINAL = '0x0000000000000000000000000000000000000001'

describe('PrizeStrategyUpkeep', function() {


  let wallet, wallet2, wallet3, wallet4
  let prizePoolRegistry;
  let prizePoolUpkeep

  let prizePool1, prizePool2
  let prizeStrategy, prizeStrategy2

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
  
    const prizePoolRegistryContractFactory = await hre.ethers.getContractFactory("AddressRegistry", wallet, overrides)
    prizePoolRegistry = await prizePoolRegistryContractFactory.deploy("Prize Pool", wallet.address)
  
    const prizePoolUpkeepContractFactory = await hre.ethers.getContractFactory("PrizeStrategyUpkeep", wallet, overrides)
    prizePoolUpkeep = await prizePoolUpkeepContractFactory.deploy(prizePoolRegistry.address, 10, 10)


    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    prizePool1 = await deployMockContract(wallet, PrizePool.abi, overrides)
    prizePool2 = await deployMockContract(wallet, PrizePool.abi, overrides)

    
    await prizePoolRegistry.addAddresses([prizePool1.address, prizePool2.address])


    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategyInterface")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
    
    await prizePool1.mock.prizeStrategy.returns(prizeStrategy.address)
    await prizePool2.mock.prizeStrategy.returns(prizeStrategy.address)


    await prizeStrategy.mock.canCompleteAward.returns(true)
    await prizeStrategy.mock.canStartAward.returns(true)

    await prizeStrategy.mock.startAward.returns()
    await prizeStrategy.mock.completeAward.returns()

  })

  describe('able to call checkup keep', () => {
    it('can check canStartAward()', async () => {
      await prizeStrategy.mock.canStartAward.returns(true)
      const resultArr = await prizePoolUpkeep.callStatic.checkUpkeep("0x")
      expect(resultArr[0]).to.be.equal(true)
    })
    it('can check canCompleteAward()', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(true)
      await prizeStrategy.mock.canStartAward.returns(false)
      const resultArr = await prizePoolUpkeep.callStatic.checkUpkeep("0x")
      expect(resultArr[0]).to.be.equal(true)
    })
    it('no upkeep required', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(false)
      await prizeStrategy.mock.canStartAward.returns(false)
      const resultArr = await prizePoolUpkeep.callStatic.checkUpkeep("0x")
      expect(resultArr[0]).to.be.equal(false)
    })
  })

  describe('able to update the upkeepBatchSize', () => {
    it('owner can update', async () => {
      await expect(prizePoolUpkeep.updateUpkeepBatchSize(3))
      .to.emit(prizePoolUpkeep, "UpkeepBatchSizeUpdated")
      .withArgs(3)
    })
    it('non-owner cannot update', async () => {
      await expect(prizePoolUpkeep.connect(wallet2).updateUpkeepBatchSize(3))
      .to.be.reverted
    })
  })

  describe('owner can pause contract and upkeep cannot be performed', () => {
    it('owner can pause', async () => {
      await expect(prizePoolUpkeep.pause())
      .to.emit(prizePoolUpkeep, "Paused")

      await prizeStrategy.mock.canStartAward.returns(true)
      await prizeStrategy.mock.startAward.revertsWithReason("startAward")
      await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.revertedWith("paused")

      await expect(prizePoolUpkeep.unpause())
      .to.emit(prizePoolUpkeep, "Unpaused")

      await prizeStrategy.mock.canStartAward.returns(true)
      await prizeStrategy.mock.startAward.revertsWithReason("startAward")
      await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.revertedWith("startAward")

    })
    it('non-owner cannot pause', async () => {
      await expect(prizePoolUpkeep.connect(wallet2).pause())
      .to.be.reverted
    })
  })

  describe('able to update the upkeepMinimumBlockInterval', () => {
    it('owner can update', async () => {
      await expect(prizePoolUpkeep.updateUpkeepMinimumBlockInterval(10))
      .to.emit(prizePoolUpkeep, "UpkeepMinimumBlockIntervalUpdated")
      .withArgs(10)
    })
    it('non-owner cannot update', async () => {
      await expect(prizePoolUpkeep.connect(wallet2).updateUpkeepMinimumBlockInterval(3))
      .to.be.reverted
    })
  })

  describe('able to update the prize pool registry', () => {
    it('owner can update the registry', async () => {
      await expect(prizePoolUpkeep.updatePrizePoolRegistry(prizePoolRegistry.address))
      .to.emit(prizePoolUpkeep, "UpkeepPrizePoolRegistryUpdated")
      .withArgs(prizePoolRegistry.address)
    })
    it('non-owner cannot update', async () => {
      await expect(prizePoolUpkeep.connect(wallet2).updatePrizePoolRegistry(SENTINAL))
      .to.be.reverted
    })
  })



  describe('able to call upkeep performUpkeep()', () => {

    let mockContractFactory, mockContract

    before(async() => {
      mockContractFactory = await hre.ethers.getContractFactory("MockContract", wallet3, overrides)
      mockContract = await mockContractFactory.deploy(SENTINAL)
    })
  
    it('can execute startAward()', async () => {
      await prizeStrategy.mock.canStartAward.returns(true)
      await prizeStrategy.mock.startAward.revertsWithReason("startAward")
      await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.revertedWith("startAward")
    })
    it('can execute completeAward()', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(true)
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.completeAward.revertsWithReason("completeAward")
      await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.revertedWith("completeAward")
    })

    it('cannot startAward()', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(false)
      await prizeStrategy.mock.canStartAward.revertsWithReason("startAward")
      await expect(prizePoolUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("startAward")
    })
    it('cannot completeAward()', async () => {
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.canCompleteAward.revertsWithReason("2")
      await expect(prizePoolUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("2")
    })
    it('does not supportFunction canStartAward', async () => {

      await prizePoolRegistry.addAddresses([mockContract.address])
      await prizeStrategy.mock.canCompleteAward.revertsWithReason("2")
      await expect(prizePoolUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("2")

      
    })    
    it('does not supportFunction canCompleteAward', async () => {
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.canCompleteAward.revertsWithReason("2")
      await expect(prizePoolUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("2")
    })

  })
  
  describe('upkeep outside interval', () => {

    let mockContractFactory, mockContract, prizeStrategy2
    const provider = hre.ethers.provider

    beforeEach(async() => {
      mockContractFactory = await hre.ethers.getContractFactory("MockContract", wallet3, overrides)
      mockContract = await mockContractFactory.deploy(SENTINAL)

      const prizePoolRegistryContractFactory = await hre.ethers.getContractFactory("AddressRegistry", wallet, overrides)
      prizePoolRegistry = await prizePoolRegistryContractFactory.deploy("Prize Pool", wallet.address)
    
      const prizePoolUpkeepContractFactory = await hre.ethers.getContractFactory("PrizeStrategyUpkeep", wallet, overrides)
      prizePoolUpkeep = await prizePoolUpkeepContractFactory.deploy(prizePoolRegistry.address, 10, 10)
  
  
      const PrizePool = await hre.artifacts.readArtifact("PrizePool")
      prizePool1 = await deployMockContract(wallet, PrizePool.abi, overrides)
      prizePool2 = await deployMockContract(wallet, PrizePool.abi, overrides)
  
      
      await prizePoolRegistry.addAddresses([prizePool1.address, prizePool2.address])
  
  
      const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategyInterface")
      prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)

      
      prizeStrategy2 = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)

      await prizePool1.mock.prizeStrategy.returns(prizeStrategy.address)
      await prizePool2.mock.prizeStrategy.returns(prizeStrategy.address)

    })

    it('calls performWork() when interval expired', async () => {
      
      const upkeepInterval = 5
      
      await prizeStrategy.mock.canStartAward.returns(true)
      await prizeStrategy.mock.canCompleteAward.returns(false)

      
      await prizeStrategy.mock.startAward.returns()
      await prizeStrategy.mock.completeAward.returns()

      await expect(prizePoolUpkeep.performUpkeep("0x")).to.emit(prizePoolUpkeep, "UpkeepPerformed")

      await expect(prizePoolUpkeep.updateUpkeepMinimumBlockInterval(upkeepInterval)).
      to.emit(prizePoolUpkeep, "UpkeepMinimumBlockIntervalUpdated")
      
      await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.reverted

      // move forward the upkeepIntervalnumber of blocks
      for(let index = 0; index < upkeepInterval; index++){
        await provider.send('evm_mine', [])
      }
      // should now be able to perform upkeep since the interval has expired
      await expect(prizePoolUpkeep.performUpkeep("0x")).to.emit(prizePoolUpkeep, "UpkeepPerformed")
    })

    it('checkUpkeep() returns false when outside interval', async () => {

      const interval = 100

      await prizePoolUpkeep.updateUpkeepMinimumBlockInterval(interval)
      const result = await prizePoolUpkeep.checkUpkeep("0x")
      expect(result.upkeepNeeded).to.equal(false)
    })

    it('can execute completeAward() and emit event', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(true)
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.completeAward.returns()
      const result = await prizePoolUpkeep.performUpkeep("0x")
      const receipt = await provider.getTransactionReceipt(result.hash)
      let event = prizePoolUpkeep.interface.parseLog(receipt.logs[0])
      expect((event.args.startAwardsPerformed).toNumber()).to.equal(0)
      expect((event.args.completeAwardsPerformed).toNumber()).to.equal(2)

    })

    it('can execute completeAward() and startAward() and emit event', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(false)
      await prizeStrategy.mock.canStartAward.returns(true)
      await prizeStrategy.mock.completeAward.returns()
      await prizeStrategy.mock.startAward.returns()

      await prizePool2.mock.prizeStrategy.returns(prizeStrategy2.address)

      await prizeStrategy2.mock.canStartAward.returns(false)
      await prizeStrategy2.mock.canCompleteAward.returns(true)
      await prizeStrategy2.mock.completeAward.returns()
      await prizeStrategy2.mock.startAward.returns()

      const result = await prizePoolUpkeep.performUpkeep("0x")
      const receipt = await provider.getTransactionReceipt(result.hash)
      let event = prizePoolUpkeep.interface.parseLog(receipt.logs[0])
      expect((event.args.startAwardsPerformed).toNumber()).to.equal(1)
      expect((event.args.completeAwardsPerformed).toNumber()).to.equal(1)

    })

  })

});