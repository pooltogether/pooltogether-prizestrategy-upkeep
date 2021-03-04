const { deployMockContract, waffleChai } = require('ethereum-waffle')
const { expect, use } = require('chai')
const hre = require('hardhat')




const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('PrizePoolUpkeep', function() {


  let wallet, wallet2, wallet3, wallet4
  let prizePoolRegistry;
  let prizePoolUpkeep

  let prizePool1, prizePool2, prizePool3
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
    
    console.log("setting the prize strategy for prizepools as  ", prizeStrategy.address)
    await prizePool1.mock.prizeStrategy.returns(prizeStrategy.address)
    await prizePool2.mock.prizeStrategy.returns(prizeStrategy.address)
    // console.log(await prizePool1.prizeStrategy())
    // console.log(await prizePool2.prizeStrategy())


    console.log("mocking canStartAward and canCompleteAward")
    await prizeStrategy.mock.canCompleteAward.returns(true)
    await prizeStrategy.mock.canStartAward.returns(true)

  })

  describe.only('able to call checkup keep', () => {
    it('can startAward', async () => {
      await prizePoolUpkeep.checkUpkeep("0x")
      // await expect(prizePoolUpkeep.checkUpkeep("0x")).to.be.equal(true)
    })
  })

  describe('able to call upkeep keep', () => {
    
    it('can execute startAward', async () => {
      await prizePoolUpkeep.performUpkeep("0x")
      // await expect(prizePoolUpkeep.performUpkeep("0x")).to.be.true
    })
  })
  


});
