const chalk = require('chalk');
const { getChainId } = require('hardhat');

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}


module.exports = async (hardhat) => {

    console.log("running deploy script")


    const { getNamedAccounts, deployments, ethers } = hardhat
    const { deploy } = deployments
    const namedAccounts = await getNamedAccounts()
    const { deployer, MultiSig } = await getNamedAccounts()
    const namedSigners = await ethers.getNamedSigners()
    const deployerSigner = namedSigners.deployer


    dim(`deploying operations contract`)
    const operationsContractResult = await deploy('Operations', {
      args: [],
      from: deployer,
      skipIfAlreadyDeployed: true
    })
    green(`Deployed Operations token: ${operationsContractResult.address}`)
  

}