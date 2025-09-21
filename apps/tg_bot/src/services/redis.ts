import { redisStorage } from "@gramio/storage-redis";

export const storage =  redisStorage({
    host: 'redis-15578.c300.eu-central-1-1.ec2.redns.redis-cloud.com',
    port: 15578,
    password: 'sBv7MQBgEe13DyQLw5M0MNXY0zjiQiEU',
    username: 'default',
})
