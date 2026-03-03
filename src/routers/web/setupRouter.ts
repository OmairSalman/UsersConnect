import { Router } from 'express';
import { SetupController } from '../../controllers/web/setupController';

const router = Router();
const setupController = new SetupController();

router.get('/', (req, res) => setupController.showSetup(req, res));
router.post('/', (req, res) => setupController.processSetup(req, res));

export default router;
