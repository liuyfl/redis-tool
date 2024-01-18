<template>
    <div class="app-wrap">
        <Sidebar 
            :showDatabaseMenu="showDatabaseMenu" 
            :connectionMap="connectionMap" 
            @changeDatabase="changeDatabase" 
            @connectionHandle="connectionHandle"
            @handleFolderDB="handleFolderDB"
            @handleTest="handleTest">
        </Sidebar>
        <AppMain 
            :showDatabaseMenu="showDatabaseMenu" 
            :params="keysInfo"
            :terminal="current.config"
            :cmd="terminal_cmd"
            @handleKey="handleKey" 
            @handleShowDatabase="handleShowDatabase" 
            @changeMatchKeys="changeDatabase"
            @handleAddMember="handleAddMember"
            @handleRefreshKey="handleRefreshKey"
            @handleAddKey="handleAddKey"
            @handleExecCmd="handleExecCmd"
            @handleDeleteKey="handleDeleteKey"
            @handleDeleteSubKey="handleDeleteSubKey"
            @handleRename="handleRename"
            @handleReScore="handleReScore"
            @handleSaveValue="handleSaveValue">
        </AppMain>
    </div>
</template>
<script>
import Sidebar from '@/components/Sidebar'
import AppMain from '@/components/AppMain'
import Redis from '@/utils/redis'
import splitargs from 'redis-splitargs'
export default {
    name:'Layout',
    components:{
        Sidebar,
        AppMain
    },
    data(){
        return {
            selectNum:10000,
            keysInfo:{
                keys:[],
                total:0,
                hasConnected:false,
                value:'',
                type:''
            },
            database:0,
            connectionMap:{},
            current:{
                client:'',
                database:{},
                config:{}
            },
            showDatabaseMenu:true,
            terminal_cmd:[]
        }
    },
    methods:{
        async changeDatabase(item,database,pattern){
            let connection = '';
            if(!item&&!database){
                connection = this.current.client;
                connection.select(this.current.database.id);
            }
            else{
                if(this.connectionMap[item.name]){
                    connection = this.connectionMap[item.name].client;
                }
                else{
                    connection = Redis.create(item);
                }
                connection.select(database.id);
            }
            pattern = !pattern?'*':pattern+'*';
            let stream = connection.scanStream({
                match:pattern,
                count:this.selectNum
            });
            let keys = [];
            let that = this;
            
             stream.on('data',function(resultKeys){
                for(let i = 0;i<resultKeys.length;i++)
                {
                    // let tmpkey = resultKeys[i];
                    let ttp='';
                    // const [tt] = await Promise.all([connection.type(resultKeys[i])]);
                    // console.log('===test key-type:',resultKeys[i],tt);

                    // keys[tmpkey] = {
                    //     key:tmpkey
                    // }
                    keys.push({
                        key:resultKeys[i],
                        type:ttp
                    });
                }
            })
            stream.on('end',function(){
                let obj = {
                    keys:keys,
                    total:keys.length,
                    hasConnected:true,
                    activeKey:keys.length>0?keys[0]['key']:''
                }
                that.keysInfo = Object.assign({},that.keysInfo,obj);
                if(database){
                    that.current ={
                        client:connection,
                        database:database,
                        config:item
                    }
                }
                if(keys.length>0){
                    that.handleKey(keys[0]);
                }
            })

            // let tt= await connection.type('APP_ID_LABEL_MAP');
            // console.log('==end fun')
        },
        connectionHandle(item){
            let setting = {
                databases:[]
            };
            let obj = {};
            item.times=1;
            let connection = Redis.create(item);
            let configuration = {};
            setting.client = connection;
            connection.info().then(res=>{
                let content = res.split('\n');
                for(let k in content){
                    let tmp = content[k];
                    tmp = tmp.replace(/^(\s+)|(\s+)$/gi,'');
                    if(/^#.*/.test(tmp)||!tmp){
                        continue;
                    }
                    let tpar = tmp.split(':');
                    configuration[tpar[0]]=tpar[1];
                }
                setting.config = configuration;
                setting.fold=0;
                obj[item.name] = setting;
                this.connectionMap = Object.assign({},this.connectionMap,obj)
            })
            connection.config('get','databases').then((res)=>{
                if(res&&res[1]){
                    let tmp = Number(res[1]);
                    for(let k=0;k<tmp;k++)
                    {
                        let tkey = 'db'+k;
                        let size = configuration[tkey]?configuration[tkey].split(','):[];
                        size = (size.length>0)?size[0].split('='):[];
                        size = (size.length>1)?Number(size[1]):0;
                        setting.databases.push({
                            id:k,
                            size:size
                        })
                    }
                }
                obj[item.name] = setting;
                this.connectionMap = Object.assign({},this.connectionMap,obj)
            })
        },
        async handleKey(key){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(connection){
                let type = await connection.type(key.key);
                if(type=='string'){
                    connection.get(key.key,function(err,res){
                        // console.log('===esr',typeof err,err)
                        if(err){
                            that.$message.error(err.ReplyError);
                            that.keysInfo = {
                                ...that.keysInfo,
                                value:'',
                                type:type,
                                activeKey:''
                            };
                        }
                        else{
                            that.keysInfo = {
                                ...that.keysInfo,
                                value:res,
                                type:type,
                                activeKey:''
                            };
                        }
                    })
                }
                else if(type=='set'){
                     connection.smembers(key.key).then(res=>{
                        that.keysInfo = {
                            ...that.keysInfo,
                            value:res,
                            type:type,
                            activeKey:''
                        };
                        console.log('====set',that.keysInfo)
                    })
                }
                else if(type=='list'){
                    connection.lrange(key.key,0,-1).then(res=>{
                        that.keysInfo = {
                            ...that.keysInfo,
                            value:res,
                            type:type,
                            activeKey:''
                        };
                    })
                }
                else if(type=='hash'){
                    connection.hkeys(key.key).then(res=>{
                        if(res){
                            connection.hvals(key.key).then(vres=>{
                                let obj = [];
                                if(vres){
                                    vres.forEach((item,idx)=>{
                                        obj.push({key:res[idx],value:item})
                                    })

                                    that.keysInfo = {
                                        ...that.keysInfo,
                                        value:obj,
                                        type:type,
                                        activeKey:''
                                    };
                                }
                            })
                        }
                    })
                }
                else if(type=='zset'){
                    connection.zrange(key.key,0,-1,'WITHSCORES').then((res)=>{
                        let map = [];
                        for(let i =0;i<res.length;i++)
                        {
                            map.push({
                                score:res[i+1],
                                member:res[i]
                            });
                            i++;
                        }
                        that.keysInfo = {
                            ...that.keysInfo,
                            value:map,
                            type:type,
                            activeKey:''
                        };
                    })
                }
            }
        },
        getKeys(connection){
            return new Promise((resolve)=>{
                let stream = connection.scanStream({
                    count:this.selectNum
                });
                let keys= [];
                stream.on('data',function(resultKeys){
                    for(let i = 0;i<resultKeys.length;i++)
                    {
                        keys.push(resultKeys[i]);
                    }
                })
                stream.on('end',function(){
                    let obj = {
                        keys:keys,
                        total:keys.length,
                        hasConnected:true
                    }
                    resolve(obj);
                });
            })
        },
        getType(connection,key){
            return new Promise((resolve,reject)=>{
                connection.type(key).then(tp=>{
                    resolve(tp);
                }).catch(err=>{
                    reject(err);
                })
            });
        },
        handleShowDatabase(){
            this.showDatabaseMenu = !this.showDatabaseMenu;
        },
        handleFolderDB(item){
            let obj = this.connectionMap[item.name]? this.connectionMap[item.name]:{};
            obj.fold = !obj.fold;
            this.connectionMap = Object.assign({},this.connectionMap,obj)
        },
        async handleTest(item){
            item.times = 1;
            item.showConnectTip = true;
            let connection = await Redis.create(item);
            console.log('Test connection',connection)
        },
        handleAddMember(item,key,type){
             let connection = this.current.client?this.current.client:'';
             let that = this;
            if(connection){
                if(type=='set'){
                    connection.sadd(key,item.value).then((res)=>{
                        if(res){
                            that.handleKey({key:key});
                        }
                    })
                }
                else if(type=='list'){
                    if(item.insert=='head'){
                        connection.lpush(key,item.value).then(res=>{
                            if(res){
                                that.handleKey({key:key})
                            }
                        })
                    }
                    else{
                        connection.rpush(key,item.value).then(res=>{
                            if(res){
                                that.handleKey({key:key})
                            }
                        })
                    }
                }
                else if(type=='hash'){
                    connection.hexists(key,item.key).then(res=>{
                        if(res){
                            that.$message.error('The field already exists');
                        }
                        else{
                            connection.hset(key,item.key,item.value).then(res=>{
                                if(res){
                                    that.handleKey({key:key});
                                }
                            })
                        }
                    })
                }
                else if(type=='zset'){
                    connection.zadd(key,String(item.score),item.value).then(res=>{
                        if(res){
                            that.handleKey({key:key});
                        }
                    })
                }
            }
        },
        handleRefreshKey(pattern){
            this.changeDatabase('','',pattern);
        },
        handleAddKey(item){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(connection){
                connection.exists(item.key_name).then(res=>{
                    if(res){
                        that.$message.error('The key already exists');
                    }
                    else{
                        if(item.type=='string'){
                            connection.set(item.key_name,item.value).then(res=>{
                                if(res){
                                    that.changeDatabase('','','');
                                }
                                else{
                                    that.$message.error('Insert failed! Please try again')
                                }
                            })
                        }
                        else if(item.type=='list'){
                            connection.lpush(item.key_name,item.item).then(res=>{
                                if(res){
                                    that.changeDatabase('','','');
                                }
                                else{
                                    that.$message.error('Insert failed! Please try again')
                                }
                            })
                        }
                        else if(item.type=='hash'){
                            connection.hset(item.key_name,item.key,item.value).then(res=>{
                                if(res){
                                    that.changeDatabase('','','');
                                }
                                else{
                                    that.$message.error('Insert failed! Please try again')
                                }
                            })
                        }
                        else if(item.type=='set'){
                            connection.sadd(item.key_name,item.member).then(res=>{
                                if(res){
                                    that.changeDatabase('','','');
                                }
                                else{
                                    that.$message.error('Insert failed! Please try again')
                                }
                            })
                        }
                        else if(item.type=='zset'){
                            connection.zadd(item.key_name,item.score,item.member).then(res=>{
                                if(res){
                                    that.changeDatabase('','','');
                                }
                                else{
                                    that.$message.error('Insert failed! Please try again')
                                }
                            })
                        }
                    }
                })
            }
        },
        handleExecCmd(cmd){
            cmd = cmd.replace(/^(\s+)|(\s+)$/gi,'');
            if(cmd.length==0){
                this.terminal_cmd.push({
                    cmd:''
                })
            }
            else{
                let connection = this.current.client?this.current.client:'';
                // connection.sendCommand(cmd)
                let args = splitargs(cmd);
                this.terminal_cmd.push({
                    cmd:cmd
                })
                connection.call.apply(connection,args).then(res=>{
                    this.terminal_cmd.push({
                        type:'result',
                        content:res?res:'null'
                    })
                }).catch(err=>{
                    this.terminal_cmd.push({
                        type:'result',
                        content:'WRONGTYPE Operation against a key holding the wrong kind of value',
                        error:err
                    })
                })
                // var Redis = require('ioredis');
                // var redis = new Redis();

                // var clientList = new Redis.Command('client list', null, function (err, result) {
                // console.log(result);
                // });

                // redis.sendCommand(clientList);
            }
        },
        async handleDeleteKey(key,activeKey){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(connection){
                connection.del(key,function(err,res){
                        if(res){
                            console.log('key删除成功');
                        }
                        let keys = that.keysInfo.keys;
                        keys = keys.filter(item=>{
                            return item.key!=key;
                        })
                        let current = '';
                        let obj = {
                            keys:keys
                        };
                        if(key==activeKey){
                            obj['activeKey'] = keys.length>0?keys[0]['key']:'';
                            current = keys.length>0?keys[0]:'';
                        }
                        that.keysInfo = Object.assign({},that.keysInfo,obj);
                        if(current){
                            that.handleKey(current);
                        }
                    })
            }
        },
        async handleDeleteSubKey(key,item,type){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(connection){
                if(type=='set'){
                     connection.srem(key,item).then(res=>{
                        if(res){
                            connection.smembers(key).then(res=>{
                                that.keysInfo = {
                                    ...that.keysInfo,
                                    value:res
                                };
                            })
                         }
                    })
                }
                else if(type=='list'){
                    connection.lrem(key,1,item).then(res=>{
                        if(res){
                            connection.lrange(key,0,-1).then(res=>{
                                that.keysInfo = {
                                    ...that.keysInfo,
                                    value:res
                                };
                            })
                         }
                    })
                }
                else if(type=='hash'){
                    connection.hdel(key,item.key).then(res=>{
                        if(res){
                            connection.hkeys(key).then(res=>{
                                if(res){
                                    connection.hvals(key).then(vres=>{
                                        let obj = [];
                                        if(vres){
                                            vres.forEach((item,idx)=>{
                                                obj.push({key:res[idx],value:item})
                                            })

                                            that.keysInfo = {
                                                ...that.keysInfo,
                                                value:obj
                                            };
                                        }
                                    })
                                }
                                else{
                                    that.keysInfo = {
                                        ...that.keysInfo,
                                        value:[]
                                    };
                                }
                            })
                         }
                    })
                }
                else if(type=='zset'){
                    connection.zrem(key,item.member).then(res=>{
                        if(res){
                            connection.zrange(key.key,0,-1,'WITHSCORES').then((res)=>{
                                let map = [];
                                for(let i =0;i<res.length;i++)
                                {
                                    map.push({
                                        score:res[i+1],
                                        member:res[i]
                                    });
                                    i++;
                                }
                                that.keysInfo = {
                                    ...that.keysInfo,
                                    value:map
                                };
                            })
                         }
                    })
                }
            }
        },
        async handleRename(oldkey,newkey,index){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(connection){
                let type = await connection.type(oldkey);
                connection.rename(oldkey,newkey).then(res=>{
                    if(res){
                        let tmp = that.keysInfo.keys;
                        tmp[index]['key'] = newkey;
                        that.keysInfo = {
                            ...that.keysInfo,
                            keys:tmp,
                            type:type,
                            activeKey:newkey
                        };
                    }
                })
            }
        },
        handleReScore(key,member,score){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(connection){
                connection.zincrby(key,score,member).then(res=>{
                    if(res){
                        connection.zrange(key,0,-1,'WITHSCORES').then((res)=>{
                            let map = [];
                            for(let i =0;i<res.length;i++)
                            {
                                map.push({
                                    score:res[i+1],
                                    member:res[i]
                                });
                                i++;
                            }
                            that.keysInfo = {
                                ...that.keysInfo,
                                value:map
                            };
                        })
                    }
                })
            }
        },
        handleSaveValue(param){
            let connection = this.current.client?this.current.client:'';
            let that = this;
            if(param.type=='string'){
                connection.set(param.key,param.value).then(res=>{
                    if(res){
                        // that.changeDatabase('','','');
                        that.$message({type:'success',message:'修改成功',duration:1000})
                    }
                    else{
                        that.$message.error('Update failed! Please try again')
                    }
                })
            }else if(param.type=='hash'){
                connection.hset(param.key_name,param.key,param.value).then(()=>{
                    // that.changeDatabase('','','');
                    that.$message({type:'success',message:'修改成功',duration:1000})
                })
            }
        }
    }
}
</script>