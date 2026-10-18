
import geoip from "geoip-lite";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { client } from './../../DB/redis.connection.js';
import { successResponse } from './success.Response.js';




function fromWhere(ip) {
    try {
        return geoip.lookup(ip);
    } catch (error) {
    }
}

export const generatelimiter = ({
    ttl = 15,
    message = "Too Many Request",
    status = 429,
    skipSuccessfulRequests,
    skipFailedRequests,
    standardHeaders = "draft-8",
    legacyHeaders = true,
    limit = 1000,
}) => {
    return rateLimit({
        windowMs: ttl * 60 * 1000,

        limit: function (req) {
            const ip = req.ip.replace(/^::ffff:/, "")
            const data = fromWhere(ip)
            console.log({ reqIp: req.ip, ip, data })

            return data?.country === "EG" ? limit : 0;
        },
        skipSuccessfulRequests,
        skipFailedRequests,
        standardHeaders,
        legacyHeaders,

        handler: function (req, res, next) {
            return successResponse({
                res,
                message,
                statusCode: status
            });
        },

        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 52);
            return `rateLimit::${ip}::${req.path}`;
        },

        store: {
            init(options) {
                this.windowSeconds = options.windowMs / 1000;
            },

            async increment(key) {
                const totalHits = await client.incr(key);

                let ttl = await client.ttl(key);
                if (ttl < 0) {
                    await client.expire(key, this.windowSeconds);
                    ttl = this.windowSeconds;
                }

                return { totalHits, resetTime: new Date(Date.now() + ttl * 1000) };
            },

            async decrement(key) {
                if (await client.exists(key)) {
                    await client.decr(key);
                }
            },

            async resetKey(key) {
                await client.del(key);
            }
        }
    });

} 
