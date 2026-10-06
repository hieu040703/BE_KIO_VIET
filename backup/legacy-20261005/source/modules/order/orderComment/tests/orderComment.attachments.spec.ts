import "reflect-metadata";

import { EntityTypeEnum } from "@/shared/constants/constance";
import { OrderCommentRepository } from "../orderComment.repository";

describe("OrderCommentRepository order attachments", () => {
  it("returns files linked to both order comments and the order itself", async () => {
    const commentFiles = [{ id: "comment-file-1" }];
    const orderFiles = [{ id: "order-file-1" }];
    const findByOptions = jest
      .fn()
      .mockResolvedValueOnce([{ id: "comment-1" }])
      .mockResolvedValueOnce(commentFiles)
      .mockResolvedValueOnce(orderFiles);

    const repository = Object.create(OrderCommentRepository.prototype) as OrderCommentRepository;
    Object.assign(repository as any, {
      findByOptions,
      fileRepository: { findByOptions },
    });

    const result = await repository.getAllFileAttachments("order-1");

    expect(result).toEqual([...commentFiles, ...orderFiles]);
    expect(findByOptions).toHaveBeenNthCalledWith(
      2,
      {
        where: {
          entityType: EntityTypeEnum.ORDER_COMMENT,
          entityId: expect.objectContaining({ _type: "in", _value: ["comment-1"] }),
        },
      },
      undefined,
    );
    expect(findByOptions).toHaveBeenNthCalledWith(
      3,
      {
        where: {
          entityType: EntityTypeEnum.ORDER,
          entityId: "order-1",
        },
      },
      undefined,
    );
  });
});
