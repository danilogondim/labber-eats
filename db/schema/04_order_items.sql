-- Drop and recreate order_items table

DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
  -- id SERIAL PRIMARY KEY NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  PRIMARY KEY (order_id, item_id)
);
