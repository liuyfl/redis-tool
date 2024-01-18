import Redis from 'ioredis'
import { Message } from 'element-ui'
export default{
    create(item){
        let options = {
            host:item.host,
            port:parseInt(item.port),
            password:item.auth,
            maxRetriesPerRequest:3,
            retryStrategy(times) {
                let t = item.times?item.times:5;
                if(times>=t){
                    return false;
                }
                return Math.min(times*100,3000);
            }
        }
        const redis = new Redis(options);
        redis.on('error',(err)=>{
            Message.error({
                dangerouslyUseHTMLString:true,
                message:'Test Failed<br>'+err.message
            });
            redis.disconnect(true);
            return false;
        });
        redis.on('connect',()=>{
            if(item.showConnectTip){
                Message.success('Connection Successful');
            }
        })
        redis.on('end',(res)=>{
            console.log('===end',res)
        })
        return redis;
    }
}