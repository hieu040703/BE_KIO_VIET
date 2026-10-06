export const resolveOrderEmployeeDefaultNote = (
  note: string | null | undefined,
  orderAddressDetail: string | null | undefined,
): string | undefined => {
  if (note && note.trim()) {
    return note;
  }

  if (orderAddressDetail && orderAddressDetail.trim()) {
    return orderAddressDetail;
  }

  return undefined;
};
