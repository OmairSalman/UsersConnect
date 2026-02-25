import { Router } from 'express';
import ConfigController from '../../controllers/api/configController';
import { isAuthenticated } from '../../middlewares/auth/isAuthenticated';

const configController = new ConfigController();

const ConfigRouter = Router();

ConfigRouter.use('/', isAuthenticated);

ConfigRouter.get('/s3', configController.isS3Enabled);

ConfigRouter.get('/smtp', configController.isSMTPEnabled);

export default ConfigRouter;