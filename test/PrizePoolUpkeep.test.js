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


    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategy")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
    
    await prizeStrategy.mock.completeAward.returns()
 

  })

  describe('able to call checkup keep', () => {
    it('can startAward', async () => {

      await prizeStrategy.mock.startAward.returns()

      await expect(prizePoolUpkeep.checkUpkeep("0x"))
      // .to.not.be.reverted
    
    })
  })

  describe('able to call upkeep keep', () => {
    
    it('can execute startAward', async () => {
      await prizeStrategy.mock.completeAward.returns()
      
      await expect(prizePoolUpkeep.performUpkeep("0x"))
      // .to.not.be.reverted
    })
  })
  


});
