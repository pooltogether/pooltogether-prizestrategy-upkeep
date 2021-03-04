const { deployMockContract } = require('ethereum-waffle')
const hre = require('hardhat')

const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('PrizePoolUpkeep', function() {


  let wallet, wallet2, wallet3, wallet4
  let prizePoolRegistry;
  let prizePoolUpkeep

  let prizePool1, prizePool2
  let prizeStrategy

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
  
    const prizePoolRegistryContractFactory = await hre.ethers.getContractFactory("PrizePoolRegistry", wallet, overrides)
    prizePoolRegistry = await prizePoolRegistryContractFactory.deploy()
  
    const prizePoolUpkeepContractFactory = await hre.ethers.getContractFactory("PrizePoolUpkeep", wallet, overrides)
    prizePoolUpkeep = await prizePoolUpkeepContractFactory.deploy(prizePoolRegistry.address)


    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    prizePool1 = await deployMockContract(wallet, PrizePool.abi, overrides)
    prizePool2 = await deployMockContract(wallet, PrizePool.abi, overrides)

    
    await prizePoolRegistry.addPrizePools([prizePool1.address, prizePool2.address])


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
    it('can check canStartAward', async () => {
      await prizePoolUpkeep.checkUpkeep("0x")
      // await expect(prizePoolUpkeep.checkUpkeep("0x")).to.be.equal(true)
    })
    it('can check canCompleteAward', async () => {
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizePoolUpkeep.checkUpkeep("0x")
      // await expect(prizePoolUpkeep.checkUpkeep("0x")).to.be.equal(true)
    })
  })

  describe('able to call upkeep keep', () => {
    
    it('can execute startAward', async () => {
      await prizeStrategy.mock.canStartAward.returns(true)
      await prizePoolUpkeep.performUpkeep("0x")
      // await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.true
    })
    it('can execute completeAward', async () => {
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizePoolUpkeep.performUpkeep("0x")
      // expect('completeAward').to.be.calledOnContract(prizeStrategy);
      // await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.true
    })
    
  })
  


});
