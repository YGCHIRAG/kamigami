-- KEYS[1]: stock_key (drop:{dropId}:variant:{variantId}:stock)
-- KEYS[2]: reservation_key (reservation:{userId}:{variantId})
-- ARGV[1]: userId
-- ARGV[2]: variantId
-- ARGV[3]: ttl (300)
-- ARGV[4]: dropId
-- ARGV[5]: quantity (default: 1)

-- 1. Check if reservation already exists for this user and variant
if redis.call("EXISTS", KEYS[2]) == 1 then
    return "already_reserved"
end

-- 2. Get current stock
local stock = redis.call("GET", KEYS[1])
local qty = tonumber(ARGV[5] or "1")

if not stock or tonumber(stock) < qty then
    return "out_of_stock"
end

-- 3. Decrement stock by quantity
redis.call("DECRBY", KEYS[1], qty)

-- 4. Create reservation key with TTL
-- Store JSON-like string with metadata
local reservation_data = '{"userId":"' .. ARGV[1] .. '","variantId":"' .. ARGV[2] .. '","dropId":"' .. ARGV[4] .. '","quantity":' .. qty .. ',"reservedAt":' .. redis.call("TIME")[1] .. '}'
redis.call("SET", KEYS[2], reservation_data, "EX", ARGV[3])

return "reserved"
