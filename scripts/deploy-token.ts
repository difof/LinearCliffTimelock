import { ERC20Token__factory } from '../typechain'
import { mainDeploy } from './helpers/main'
import args from './ctor_args/token'

mainDeploy('ERC20Token', (signer) =>
    new ERC20Token__factory(signer).deploy(args[0])
)
