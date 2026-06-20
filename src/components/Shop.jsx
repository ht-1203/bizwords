const SHOP_ITEMS = [
  { id: 'potion', name: 'Potion', desc: 'ฟื้น HP 30', price: 50 },
  { id: 'megaPotion', name: 'Mega Potion', desc: 'ฟื้น HP เต็ม', price: 120 },
  { id: 'hintToken', name: 'Hint Token', desc: 'ใช้ใบ้คำตอบ 1 ครั้ง', price: 30 },
  { id: 'shield', name: 'Shield', desc: 'ลดดาเมจ 50% (1 ครั้ง)', price: 80 },
]

export default function Shop({ state, dispatch }) {
  return (
    <div className="screen shop-screen">
      <h2>🏪 ร้านค้า</h2>
      <p className="shop-gold">Gold: {state.player.gold}G</p>
      <div className="shop-items">
        {SHOP_ITEMS.map(item => (
          <div key={item.id} className="shop-item">
            <div className="shop-item-info">
              <strong>{item.name}</strong>
              <p>{item.desc}</p>
              <small>มี: {state.player.items[item.id] || 0}</small>
            </div>
            <div className="shop-item-action">
              <span className="shop-price">{item.price}G</span>
              <button
                className="btn btn-small"
                onClick={() => dispatch({ type: 'BUY_ITEM', payload: { item: item.id, cost: item.price } })}
                disabled={state.player.gold < item.price}
              >
                ซื้อ
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'overworld' })}>
        กลับ
      </button>
    </div>
  )
}
