import { TLPublicRegistry__factory } from '../typechain'
import { mainDeploy } from './helpers/main'

mainDeploy('TLPublicRegistry', (signer) =>
    new TLPublicRegistry__factory(signer).deploy()
)
