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
}
