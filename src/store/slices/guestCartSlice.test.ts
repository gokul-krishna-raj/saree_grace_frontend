import guestCartReducer, {
  guestCartCleared,
  guestItemAdded,
  guestItemQtyUpdated,
  guestItemRemoved,
} from "./guestCartSlice";

const line = {
  productId: "p1",
  variantId: null,
  qty: 1,
  nameSnapshot: "Elampillai Cotton Saree",
  priceSnapshot: 1499,
};

describe("guestCartSlice", () => {
  it("adds a new line item", () => {
    const state = guestCartReducer(undefined, guestItemAdded(line));
    expect(state.items).toEqual([line]);
  });

  it("sums quantity for the same product+variant instead of duplicating the line", () => {
    let state = guestCartReducer(undefined, guestItemAdded(line));
    state = guestCartReducer(state, guestItemAdded({ ...line, qty: 2 }));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].qty).toBe(3);
  });

  it("treats different variants of the same product as separate lines", () => {
    let state = guestCartReducer(undefined, guestItemAdded(line));
    state = guestCartReducer(state, guestItemAdded({ ...line, variantId: "v1", qty: 1 }));

    expect(state.items).toHaveLength(2);
  });

  it("updates quantity for a specific line", () => {
    let state = guestCartReducer(undefined, guestItemAdded(line));
    state = guestCartReducer(
      state,
      guestItemQtyUpdated({ productId: "p1", variantId: null, qty: 5 }),
    );

    expect(state.items[0].qty).toBe(5);
  });

  it("removes a specific line", () => {
    let state = guestCartReducer(undefined, guestItemAdded(line));
    state = guestCartReducer(state, guestItemRemoved({ productId: "p1", variantId: null }));

    expect(state.items).toHaveLength(0);
  });

  it("clears all lines", () => {
    let state = guestCartReducer(undefined, guestItemAdded(line));
    state = guestCartReducer(state, guestCartCleared());

    expect(state.items).toEqual([]);
  });
});
