import { BaseRepository } from "@/shared/base/BaseRepository";
import { OrderComment } from "@/database/models/OrderComment";
import { FindOptionsSelect, In, SelectQueryBuilder } from "typeorm";
import { injectable, inject } from "inversify";
import { OrderCommentSelectFull, OrderCommentRelations } from "./orderComment.select";
import { IEntityManager, IFindOptions } from "@/shared/types/interfaces";
import { Request } from "express";
import { FILE_TYPES, FileRepository } from "@/modules/file";
import { EntityTypeEnum } from "@/shared/constants/constance";
import { File } from "@/database/models/File";

@injectable()
export class OrderCommentRepository extends BaseRepository<OrderComment> {
  protected entityClass = OrderComment;
  protected selectedFields = OrderCommentSelectFull;
  protected relations = OrderCommentRelations;
  protected multipleFile: boolean = true;
  protected nestedFileFields = ["user.employee"];

  constructor(@inject(FILE_TYPES.FileRepository) private fileRepository: FileRepository) {
    super();
    this.setOptions();
  }

  setOptions(selectedFields?: FindOptionsSelect<OrderComment> | undefined): void {
    this.selectedFields = selectedFields || OrderCommentSelectFull;
    this.relations = OrderCommentRelations;
  }

  async extendQueryBuilder(
    qb: SelectQueryBuilder<OrderComment>,
    options: IFindOptions<OrderComment>,
    req?: Request,
  ): Promise<void> {
    const orderId = req?.params.orderId;
    if (orderId) {
      qb.andWhere("entity.orderId = :orderId", { orderId: orderId });
      qb.orderBy("entity.timeAt", "DESC");
    }
  }

  // lấy 10 bình luận gần đây của hệ thống
  async getRecentComments(limit: number = 5): Promise<OrderComment[]> {
    const comments = await this.getRepository()
      .createQueryBuilder("entity")
      .leftJoinAndSelect("entity.order", "order")
      .where("entity.userId IS NULL")
      .orderBy("entity.timeAt", "DESC")
      .limit(limit)
      .getMany();
    return comments;
  }

  async getAllFileAttachments(orderId: string, manager?: IEntityManager): Promise<File[]> {
    const comments = await this.findByOptions(
      {
        where: {
          orderId: orderId,
        },
      },
      manager,
    );

    const commentAttachments = await this.fileRepository.findByOptions(
      {
        where: {
          entityType: EntityTypeEnum.ORDER_COMMENT,
          entityId: In(comments.map((comment) => comment.id)),
        },
      },
      manager,
    );

    const orderAttachments = await this.fileRepository.findByOptions(
      {
        where: {
          entityType: EntityTypeEnum.ORDER,
          entityId: orderId,
        },
      },
      manager,
    );

    return [...commentAttachments, ...orderAttachments];
  }

  // Đếm số comment chưa đọc của user: các comment có (timeAt, id) sau checkpoint
  // (lastReadCommentId) trong order. Không cần join view_comments như cũ.
  //
  // LƯU Ý QUAN TRỌNG: so sánh (timeAt, id) phải diễn ra NGAY TRONG SQL (row constructor).
  // Cột timeAt là timestamptz(6) (microsecond), nhưng JS Date chỉ có độ phân giải millisecond.
  // Nếu đọc anchor.timeAt qua entity rồi bind lại làm tham số, phần microsecond bị cắt
  // (.131364 -> .131Z) khiến CHÍNH comment anchor bị đếm là "mới hơn" checkpoint
  // -> badge unread luôn >= 1 dù đã đọc hết. (Hàm order.repository.extendQueryBuilder
  // cũng dùng cùng nguyên tắc: so sánh cột DB với cột DB.)
  async countUnreadComments(
    orderId: string,
    lastReadCommentId: string | null,
    manager?: IEntityManager,
  ): Promise<number> {
    const repository = this.getRepository(manager);

    if (!lastReadCommentId) {
      // Chưa có checkpoint -> đếm toàn bộ comment của order
      const [row] = await repository.query(
        `SELECT COUNT(*)::int AS cnt
           FROM order_comments oc
          WHERE oc."orderId" = $1
            AND oc."deletedAt" IS NULL`,
        [orderId],
      );
      return row.cnt;
    }

    // (oc.timeAt, oc.id) > (anchor.timeAt, anchor.id): so sánh tuple đúng thứ tự
    // (timeAt trước, id là tie-breaker), giữ nguyên độ chính xác microsecond.
    // Nếu anchor không tồn tại (bị xóa cứng) -> coi như chưa có checkpoint, đếm toàn bộ.
    const [row] = await repository.query(
      `SELECT COUNT(*)::int AS cnt
         FROM order_comments oc
        WHERE oc."orderId" = $1
          AND oc."deletedAt" IS NULL
          AND (
                NOT EXISTS (
                  SELECT 1 FROM order_comments a
                   WHERE a.id = $2 AND a."orderId" = $1
                )
                OR (oc."timeAt", oc.id) > (
                     SELECT a."timeAt", a.id FROM order_comments a
                      WHERE a.id = $2 AND a."orderId" = $1
                   )
              )`,
      [orderId, lastReadCommentId],
    );
    return row.cnt;
  }

  // Lấy comment mới nhất của order (dùng làm checkpoint khi mark-all-as-viewed)
  async findLatestComment(orderId: string, manager?: IEntityManager): Promise<OrderComment | null> {
    return this.getRepository(manager)
      .createQueryBuilder("entity")
      .where("entity.orderId = :orderId", { orderId })
      .andWhere("entity.deletedAt IS NULL")
      .orderBy("entity.timeAt", "DESC")
      .addOrderBy("entity.id", "DESC")
      .getOne();
  }
}
