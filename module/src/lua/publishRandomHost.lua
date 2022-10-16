local pattern = ARGV[1];
local data = ARGV[2];

local channels = redis.call('PUBSUB', 'CHANNELS',pattern);

local randomChannel = channels[ math.random( #channels )];

local result = redis.call('PUBLISH', randomChannel,data);


return {result}




