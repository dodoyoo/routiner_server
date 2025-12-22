import { Router } from 'express';
import { CouponController } from './couponController';
import { authMiddleware } from '../../utils/jwtAuth';

const router = Router();
const couponController = new CouponController();

router.post('/api/coupon/issue', authMiddleware, (req, res) =>
  couponController.issueAfterComplete(req, res)
);

router.get('/api/coupon/:user_id', authMiddleware, (req, res) =>
  couponController.listCoupons(req, res)
);

router.get('/api/coupon/use_coupon/:user_id', authMiddleware, (req, res) =>
  couponController.useCoupons(req, res)
);

export default router;
