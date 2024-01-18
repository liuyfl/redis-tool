<template>
    <div class="sidebar-wrap" :style="showDatabaseMenu?'display:flex':'display:none'">
        <div class="sidebar-connection-wrap">
            <div class="sidebar-connection-item" v-for="(item,index) in conns" :key="index" @dblclick="handleConnection(item)" @contextmenu.prevent="openContextMenu($event,item)">
                <div class="sidebar-connection-item-name"  @click="handleFolder(item)">
                    <div class="sidebar-connection-item-name-inner">
                        <i class="icon-flag el-icon-connection"></i>
                        {{item.name}}
                    </div>
                    <div v-if="connectionMap[item.name]">
                        <i class="el-icon-caret-top" v-if="!connectionMap[item.name]['fold']"></i>
                        <i class="el-icon-caret-bottom" v-else></i>
                    </div>
                </div>
                <div class="sidebar-connectopm-item-databases" v-if="connectionMap[item.name]&&!connectionMap[item.name]['fold']">
                    <div :class="activeClass==idx?'sidebar-connection-item-database sidebar-connection-item-database-active':'sidebar-connection-item-database'" v-for="(database,idx) in connectionMap[item.name].databases" :key="idx" @dblclick="changeDatabase(item,database,idx)">{{'db'+database.id}}</div>
                </div>
            </div>
        </div>
        <div class="sidebar-connection-bottom">
            <el-button type="primary" class="addConnection" @click.native="addConnection">添加连接</el-button>
        </div>
        <el-dialog :title="title" :visible.sync="dialog.visible" width="460px" class="sidebar_dialog">
            <el-form ref="dialogForm" :model="dialog" label-width="100px" size="small" label-position="left">
                <el-form-item label="Name" prop="name" :error="errors.first('name')">
                    <el-input v-model="dialog.name" name="name" v-validate="'required'" data-vv-as="Name" clearable></el-input>
                </el-form-item>
                <el-form-item label="Host" prop="host" :error="errors.first('host')">
                    <el-input v-model="dialog.host" name="host" v-validate="'required'" data-vv-as="Host" clearable></el-input>
                </el-form-item>
                <el-form-item label="Port" prop="port" :error="errors.first('port')">
                    <el-input v-model="dialog.port" name="port" v-validate="'required'" data-vv-as="Port" clearable></el-input>
                </el-form-item>
                <el-form-item label="Auth" prop="auth" :error="errors.first('auth')">
                    <el-input v-model="dialog.auth" name="auth" data-vv-as="Auth" clearable></el-input>
                </el-form-item>
            </el-form>
            <div class="dialog-footer" slot="footer">
                <el-button  class="test-connect" @click="handleTestConnect">Test Connection</el-button>
                <div>
                    <el-button  @click="dialog.visible=false">Cancel</el-button>
                    <el-button type="primary" @click.native="saveConnection" :disabled="btndisabled">Save</el-button>
                </div>
            </div>
        </el-dialog>
        <ul class="contextmenu" v-show="contextmenuVisible" :style="{left:pageXY.left+'px',top:pageXY.top+'px'}">
            <li class="contextmenu_item" @click="handleClose">Close</li>
            <li class="contextmenu_item" @click="handleDelete">Delete</li>
        </ul>
    </div>
</template>
<script>
import {readFile,writeFile,writeFile1} from '@/utils/file'
export default {
    name:'sidebar',
    props:{
        connectionMap:{
            type:Object,
            required:false,
            default:()=>{
                return {}
            }
        },
        showDatabaseMenu:{
            type:Boolean,
            required:false,
            default:true
        }
    },
    data(){
        return {
            conns:[],
            title:'Add Connection',
            dialog:{
                visible:false,
                name:'',
                host:'',
                port:6379,
                auth:''
            },
            btndisabled:false,
            contextmenuVisible:false,
            pageXY:{
                left:'',
                top:'',
                item:''
            },
            activeClass:-1
        }
    },
    mounted(){
        this.getConfig();
        document.addEventListener('click',(e)=>{
            this.handleBodyClick(e)
        });
    },
    methods:{
        getConfig(){
            readFile().then(res=>{
                this.conns = res?res:[];
            },err=>{
                console.log('get config error',err);
            })
        },
        addConnection(){
            this.title = 'Add Connection';
            this.dialog={
                visible:true,
                name:'',
                host:'',
                port:6379,
                auth:''
            }
            this.$validator.pause()
            this.$nextTick(() => {
                this.$validator.errors.clear();
                this.$validator.fields.items.forEach(field => field.reset())
                this.$validator.fields.items.forEach(field => this.errors.remove(field))
                this.$validator.resume()
            })
        },
        saveConnection(){
            this.btndisabled = true;
            this.$validator.validateAll().then(valid=>{
                if(valid){
                    for(let i=0;i<this.conns.length;i++)
                    {
                        if(this.dialog.name==this.conns[i]['name']){
                            this.$message.error('Connection with same connection name already exists in the project.');
                            this.btndisabled = false;
                            return;
                        }
                    }
                    let frm = {
                        name:this.dialog.name,
                        host:this.dialog.host,
                        port:this.dialog.port,
                        auth:this.dialog.auth
                    }
                    writeFile(frm).then(()=>{
                        this.dialog.visible = false;
                        this.btndisabled = false;
                        this.getConfig();
                    },err=>{
                        console.log('write config error.',err);
                    })
                }
                else{
                    this.btndisabled = false;
                }
            })
        },
        handleConnection(item){
            this.SystemNotification('标题aaa','内容aaa');
            this.$emit('connectionHandle',item);
            // let setting = {
            //     databases:[]
            // };
            // let obj = {};
            // let connection = Redis.create(item);
            // let configuration = {};
            // setting.client = connection;
            // connection.info().then(res=>{
            //     let content = res.split('\n');
            //     for(let k in content){
            //         let tmp = content[k];
            //         tmp = tmp.replace(/^(\s+)|(\s+)$/gi,'');
            //         if(/^#.*/.test(tmp)||!tmp){
            //             continue;
            //         }
            //         let tpar = tmp.split(':');
            //         configuration[tpar[0]]=tpar[1];
            //     }
            //     setting.config = configuration;
            //     obj[item.name] = setting;
            //     this.connectionMap = Object.assign({},this.connectionMap,obj)
            // })
            // connection.config('get','databases').then((res)=>{
            //     if(res&&res[1]){
            //         let tmp = Number(res[1]);
            //         for(let k=0;k<tmp;k++)
            //         {
            //             let tkey = 'db'+k;
            //             let size = configuration[tkey]?configuration[tkey].split(','):[];
            //             size = (size.length>0)?size[0].split('='):[];
            //             size = (size.length>1)?Number(size[1]):0;
            //             setting.databases.push({
            //                 id:k,
            //                 size:size
            //             })
            //         }
            //     }
            //     obj[item.name] = setting;
            //     this.connectionMap = Object.assign({},this.connectionMap,obj)
            // })
            // connection.select(this.database);

            // var keys = await connection.scan(0,'COUNT',10000);
            // console.log('==keys',keys);
            // let stream = connection.scanStream({
            //     count:this.selectNum
            // });
            // let keys = [];
            // stream.on('data',function(resultKeys){
            //     for(let i = 0;i<resultKeys.length;i++)
            //     {
            //         keys.push(resultKeys[i]);
            //     }
            // })
            // stream.on('end',function(){
            //     console.log('====with keys:',keys);
            // })
            // console.log('===skfskfs')
        },
        changeDatabase(item,database,idx){
            // let connection = '';
            // if(this.connectionMap[item.name]){
            //     connection = this.connectionMap[item.name].client;
            // }
            // else{
            //     connection = Redis.create(item);
            // }
            this.activeClass = idx
            this.$emit('changeDatabase',item,database);
        },
        handleFolder(item){
            this.$emit('handleFolderDB',item);
        },
        handleTestConnect(){
            this.$emit('handleTest',this.dialog);
        },
        openContextMenu(event,item){
            let left = event.pageX,top=event.pageY;
            this.pageXY = {
                left:left,
                top:top,
                item:item
            }
            this.contextmenuVisible = true;
        },
        handleClose(){
            if(this.pageXY.item){
                this.connectionMap[this.pageXY.item.name] = null;
            }
            this.contextmenuVisible = false;
        },
        handleDelete(){
            readFile().then(res=>{
                let data = res,current = this.pageXY.item;
                let flag = false;
                let i;
                for(i=0;i<data.length;i++)
                {
                    if(data[i]['name']==current.name){
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    data.splice(i,1);
                    writeFile1(data).then(()=>{
                        this.conns = data;
                    })
                }
                this.contextmenuVisible = false;
            },err=>{
                console.log('get config error',err);
            })
        },
        handleBodyClick(e){
            let target = e.target;
            if(target.className.indexOf('contextmenu_item')<0&&target.className.indexOf('contextmenu')<0&&this.contextmenuVisible){
                this.contextmenuVisible = false;
                return;
            }
        },
    }
}
</script>
<style scoped>
    .sidebar-wrap{
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        max-width:240px;
        width:24vw;
        border-right:1px solid #ccc;
    }
    .sidebar-connection-wrap{
        flex:1;
        overflow-y: auto;
    }
    .sidebar-connection-bottom{
        height: 50px;
        border-top:1px solid #dad8d8;
        display: flex;
        flex-direction: row;
    }
    .addConnection{
        margin:10px 15px;
        width:100%;
    }
    .sidebar-connection-item {
        margin: 5px auto;
        text-align: left;
        /* padding: 0 15px 0 10px; */
        display: flex;
        flex-direction: column;
        
    }
    .sidebar-connection-item-name {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        cursor: default;
        padding:0 15px 0 10px
        /* width:100%; */
        /* position: relative; */
    }
    .sidebar-connection-item-name-inner{
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        cursor: default;
        width:100%;
        line-height:30px;
        font-size:18px;
        /* padding-left: 17px;; */
    }
    .sidebar-connection-item-name .icon-flag{
        margin-right:5px;
    }
    .sidebar_dialog .dialog-footer{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }
    .sidebar-connectopm-item-databases{
        display: flex;
        flex-direction: column;
        /* padding:0 10px 0 25px; */
    }
    .sidebar-connection-item-database {
        display: flex;
        /* width: 100%; */
        margin: 0px;
        cursor: pointer;
        padding:0 10px 0 40px;
        line-height:30px;
        font-size:18px;
    }
    .sidebar-connection-item-database:hover{
        background: #eff0f2;
        color: #409EFF;
    }
    .sidebar-connection-item-database-active{
        background: #eff0f2;
        color: #409EFF;
    }
     .contextmenu{
        position: fixed;
        list-style: none;
        background:#f2f2f2;
        margin:0px;
        padding:3px 0px;
        width:80px;
        border-radius: 2px;
        cursor: default;
    }
    .contextmenu li{
        height:24px;
        line-height: 24px;
    }
    .contextmenu li:hover{
        background:#398def;
        color:white;
    }
</style>