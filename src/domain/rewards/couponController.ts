import { Request, Response } from 'express';
import { CouponRepository } from './couponRepository';
import { PropertyRequiredError } from '../../utils/customError';
import { reportErrorMessage } from '../../utils/errorHandling';

const ALLOWED_STATUS = new Set(['issued', 'redeemed', 'expired'] as const);
type CouponStatus = 'issued' | 'redeemed' | 'expired';

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

      const rawStatus = (req.query.status as string | undefined)?.toLowerCase();
      if (rawStatus) {
        if (!ALLOWED_STATUS.has(rawStatus as CouponStatus)) {
          return res.status(400).json({
            message: 'status는 issued|redeemed|expired 중 하나여야합니다.',
          });
        }
        status = rawStatus as CouponStatus;
      }

      return res.status(200).json({ message: '쿠폰 목록 조회 성공' });
    } catch (err: any) {
      console.error('쿠폰 목록 조회 실패', err);
      return res.status(500).json({ message: '쿠폰 목록 조회 실패', err });
    }
  }

  // 쿠폰 목록 조회
  public async listCoupons(req: Request, res: Response) {
    try {
      const user_id = Number(req.params.user_id);
      const status = req.query.status as 'issued' | 'redeemed' | 'expired';
      if (!user_id || Number.isNaN(user_id)) {
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

  // 사용 가능 쿠폰
  public async useCoupons(req: Request, res: Response) {
    try {
      const user_id = Number(req.params.user_id);
      if (!user_id || Number.isNaN(user_id)) {
        return res.status(400).json({ message: '잘못된 사용자 ID입니다.' });
      }

      const count = await this.couponRepository.availableCoupon(user_id);

      return res
        .status(200)
        .json({
          message: '사용가능 쿠폰 개수 조회 성공',
          data: { usable_count: count },
        });
    } catch (err: any) {
      console.error('사용가능 쿠폰 개수 조회 실패: ', err);
      return res.status(500).json({ message: '서버오류', err });
    }
  }
}
