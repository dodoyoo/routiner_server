import { Router } from 'express';
import { CouponController } from './couponController';

const router = Router();
const couponController = new CouponController();

router.post('/api/coupon/issue', (req, res) =>
  couponController.issueAfterComplete(req, res)
);

export default router;
