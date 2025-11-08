import { Request, Response } from 'express';
import { CouponRepository } from './couponRepository';
import { PropertyRequiredError } from '../../utils/customError';
import { reportErrorMessage } from '../../utils/errorHandling';

export class CouponController {
  private couponRepository = new CouponRepository();

  constructor() {
    this.couponRepository = new CouponRepository();
  }

  public async issueAfterComplete(req: Request, res: Response) {
    try {
      const { user_id, user_routine_id } = req.body;
      if (!user_id || !user_id) {
        return res
          .status(400)
          .json({ message: 'user_id, user_routine_id가 필요합니다.' });
      }

      const result = await this.couponRepository.issueCoupon(
        Number(user_id),
        Number(user_routine_id)
      );
      return res.status(200).json({ message: '쿠폰 발급 체크 완료', result });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || '쿠폰 발급 처리 실패' });
    }
  }

  // 쿠폰 목록 조회
  public async listCoupons(req: Request, res: Response) {
    try {
      const user_id = Number(req.params.user_id);
      const status = req.query.status as 'issued' | 'redeemed' | 'expired';
      if (!user_id || Number(isNaN(user_id))) {
        return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
      }

      const couponData = await this.couponRepository.couponList(
        user_id,
        status
      );
      return res
        .status(200)
        .json({ message: '쿠폰 목록 조회 성공', couponData });
    } catch (err: any) {
      return res
        .status(500)
        .json({ message: err.message || '쿠폰 목록 조회 실패' });
    }
  }
}
