<template>
    <div class="main-wrap">
        <div class="redis-database-keys" v-if="params.hasConnected">
            <div class="redis-database-top">
                <i :class="showDatabaseMenu?'el-icon-s-fold':'el-icon-s-unfold'" @click="folderHandle"></i>
                <label>Keys：{{params.total}}</label>
            </div>
            <div class="redis-database-top">
                <el-input placeholder="Key name or patterns(e.g. user:*)" prefix-icon="el-icon-search" v-model="pattern" @change="changePattern"></el-input>
            </div>
            <div class="redis-database-top redis-database-top-title">
                <div class="redis-keys-operator">
                    <i class="el-op el-icon-refresh" @click="handleRefreshKey"></i>
                    <i class="el-op el-icon-plus" @click="handleAddKey"></i>
                    <i class="el-op el-icon-delete" @click="handleDeleteKey"></i>
                </div>
            </div>
            <div class="redis-keys-wrap">
                <template v-for="(key,index) in params.keys">
                    <div v-if="key.key!=editKey" :class="((key.key==activekey)?'redis-key-item-active':'')+' redis-keys-item'" :key="index" @click="handleKey(key)" @dblclick="handleEditKey(key)"  @contextmenu.prevent="openContextMenu($event,key,'key',index)">{{key.key}}</div>
                    <el-input class="redis-key-item-input" ref="redis-key-item-input" :data-index="index" v-model="editKeyValue" v-else :key="index" @change="handleSaveKey($event,index)"></el-input>
                </template>
                <!-- <div :class="((key.key==activekey)?'redis-key-item-active':'')+' redis-keys-item'" v-for="(key,index) in params.keys" :key="index" @click="handleKey(key)" @contextmenu.prevent="openContextMenu($event,key,'key',index)">{{key.key}}</div> -->
            </div>
        </div>
        <div class="redis-main-content"  v-if="params.hasConnected">
            <el-tabs type="card" v-model="activeTab" @tab-click="handleTab">
                <el-tab-pane label="value" name="value"  v-loading="valueLoading">
                    <template v-if="params.keys.length>0" >
                        <div class="redis-key-content-wrap" v-if="params.type=='string'">
                            <!-- <div class="redis-key-content">{{params.value}}</div> -->
                            <!-- {{typeof params.value}} -->
                            <jsonEditor :jsonString="params.value" ref="editorvalue"></jsonEditor>
                            <!-- <div class="redis-key-content" v-if="!isJSON(params.value)">{{params.value}}</div> -->
                            <!-- <div class="redis-key-content" v-else> -->
                                <!-- <vue-json-pretty :showLength="true" :deep="1" :data="typeof params.value =='string'?JSON.parse(params.value):JSON.parse(JSON.stringify(params.value))"></vue-json-pretty> -->
                                <!-- <div id="jsoneditor">{{}}</div> -->
                            <!-- </div> -->
                            <!-- <div class="redis-key-content-bottom">
                                <el-select v-model="txttype">
                                    <el-option value="raw">raw</el-option>
                                    <el-option value="json">json</el-option>
                                </el-select>
                            </div> -->
                            <el-button class="saveBtn" @click.native="saveChange(params)">Save Change</el-button>
                        </div>
                        <div class="redis-key-content-wrap flex-row" v-else-if="params.type=='set'||params.type=='list'">
                            <div class="redis-key-content-list">
                                <div class="redis-key-content-top redis-key-content-title">
                                    <span>{{params.type=='set'?'member':'item'}}</span>
                                    <i class="el-op el-icon-plus" @click="handleAddMember"></i>
                                </div>
                                <div :class="(((idx+'_'+item)==activemember)?'redis-key-content-list-item-active':'')+' redis-key-content-list-item'" v-for="(item,idx) in params.value" :key="idx" @click="changeMember(item,idx)" @contextmenu.prevent="openContextMenu($event,item,params.type,idx)">{{item}}</div>
                            </div>
                            <div class="redis-key-content-list-right">{{member}}</div>
                        </div>
                        <div class="redis-key-content-wrap flex-row" v-else-if="params.type=='hash'">
                            <div class="redis-key-content-list">
                                <div class="redis-key-content-top redis-key-content-title">
                                    <span>key</span>
                                    <i class="el-op el-icon-plus" @click="handleAddMember"></i>
                                </div>
                                <div :class="(((idx+'_'+item.key)==activemember)?'redis-key-content-list-item-active':'')+' redis-key-content-list-item'" v-for="(item,idx) in params.value" :key="idx" @click="changeHash(item,idx)" @contextmenu.prevent="openContextMenu($event,item,'hash',idx)">{{item.key}}</div>
                            </div>
                            <!-- <div class="redis-key-content-list-right">{{member}}</div> -->
                            <div class="redis-key-content-list-right-wrap">
                                <jsonEditor :jsonString="member" ref="hasheditorvalue"></jsonEditor>
                                <el-button class="saveBtn" @click.native="saveChange(params)">Save Change</el-button>
                            </div>
                        </div>
                        <div class="redis-key-content-wrap flex-row" v-else-if="params.type=='zset'">
                            <div class="redis-key-content-list">
                                <div class="redis-key-content-top redis-key-content-title redis-key-content-zset">
                                    <span class="redis-key-zset-score">score</span>
                                    <span class="redis-key-zset-member">member <i class="el-op el-icon-plus"  @click="handleAddMember"></i></span>
                                </div>
                                <div :class="(((idx+'_'+item.member)==activemember)?'redis-key-content-zset-item-active':'')+' redis-key-content-zset-item'" v-for="(item,idx) in params.value" :key="idx" @click="changeZSet(item,idx)" @contextmenu.prevent="openContextMenu($event,item,'zset',idx)">
                                    <span class="redis-key-zset-score" v-if="editSubKey!=item.member" @dblclick="handleEditSubKey(item)" :key="idx">{{item.score}}</span>
                                    <el-input class="redis-key-zset-score redis-key-item-subkey-input" ref="redis-key-item-subkey-input" v-model="editSubKeyValue" :data-index="idx" v-else :key="idx" @change="handleSaveSubKey($event,idx)"></el-input>
                                    <span class="redis-key-zset-member">{{item.member}}</span>
                                </div>
                            </div>
                            <div class="redis-key-content-list-right">{{member}}</div>
                        </div>
                    </template>
                </el-tab-pane>
                <!-- <el-tab-pane label="pretty" name="pretty">
                    pretty value
                </el-tab-pane> -->
                <el-tab-pane label="terminal" name="terminal">
                    <div class="terminal-wrap" @click="handleTerminalFocus">
                        <div class="terminal-content" v-for="(item,idx) in cmd" :key="idx">
                            <template v-if="item.type&&item.type=='result'">
                                <div :class="'terminal-content-result '+(item.error?'terminal-content-error':'')" v-html="item.content"></div>
                            </template>
                            <template v-else>
                                <label>{{terminal.host=='localhost'?'127.0.0.1':terminal.host}}:{{terminal.port}}></label>
                                <div class="terminal-content-right">{{item.cmd}}</div>
                            </template>
                        </div>
                        <div class="terminal-content">
                            <label>{{terminal.host=='localhost'?'127.0.0.1':terminal.host}}:{{terminal.port}}></label>
                            <div class="terminal-content-right" ref="terminal-input" contenteditable="plaintext-only" tabindex="0" id="terminal_input" @input="handleTerminal" @keypress="handleExec">
                                <!-- <label class="terminal-cursor" v-if="showTerminalCursor"></label> -->
                            </div>
                            <!-- <label class="terminal-cursor" v-if="!showTerminalCursor"></label> -->
                            <!-- <label class="terminal-cursor"></label> -->
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
         <el-dialog :visible.sync="dialog.visible" width="360px" class="main_dialog">
            <el-form ref="dialogForm" :model="dialog" label-width="80px" size="small" label-position="left">
                <template v-if="dialog.isKey">
                    <el-form-item label="Type" prop="type" :error="errors.first('type')">
                        <el-select v-model="dialog.type">
                            <el-option value="string" label="string"></el-option>
                            <el-option value="list" label="list"></el-option>
                            <el-option value="hash" label="hash"></el-option>
                            <el-option value="set" label="set"></el-option>
                            <el-option value="zset" label="zset"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Key Name" prop="key_name" :error="errors.first('key_name')">
                        <el-input key="key_name" v-model="dialog.key_name" name="key_name" v-validate="'required'" data-vv-as="Key Name" clearable></el-input>
                    </el-form-item>
                    <el-form-item label="Value" prop="value" v-if="dialog.type=='string'" :error="errors.first('value')">
                        <el-input key="str_value" v-model="dialog.value" name="value" v-validate="'required'" data-vv-as="Value" clearable></el-input>
                    </el-form-item>
                    <template v-else-if="dialog.type=='set'">
                        <el-form-item label="Member" prop="member" :error="errors.first('member')">
                            <el-input key="set_member" v-model="dialog.member" name="member" v-validate="'required'" data-vv-as="Member" clearable></el-input>
                        </el-form-item>
                    </template>
                    <template v-else-if="dialog.type=='zset'">
                        <el-form-item label="Member" prop="member" :error="errors.first('member')">
                            <el-input key="zset_member" v-model="dialog.member" name="member" v-validate="'required'" data-vv-as="Member" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="Score" prop="score" :error="errors.first('score')">
                            <el-input key="zset_score" v-model.number="dialog.score" name="score" v-validate="'required|numeric'" data-vv-as="Score" clearable></el-input>
                        </el-form-item>
                    </template>
                    <template v-else-if="dialog.type=='hash'">
                        <el-form-item label="Key" prop="key" :error="errors.first('key')">
                            <el-input key="hash_key" v-model="dialog.key" name="key" v-validate="'required'" data-vv-as="Key" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="Value" prop="value" :error="errors.first('value')">
                            <el-input key="hash_value" v-model="dialog.value" name="value" v-validate="'required'" data-vv-as="Value" clearable></el-input>
                        </el-form-item>
                    </template>
                    <template  v-else-if="dialog.type=='list'">
                        <el-form-item label="Item" prop="item" :error="errors.first('item')">
                            <el-input key="list_item" v-model="dialog.item" name="item" v-validate="'required'" data-vv-as="Item" clearable></el-input>
                        </el-form-item>
                    </template>
                </template>
                <template v-else>
                    <template v-if="params.type=='set'">
                        <el-form-item label="Member" prop="value" :error="errors.first('value')">
                            <el-input key="iset_value" v-model="dialog.value" name="value" v-validate="'required'" data-vv-as="Member" clearable></el-input>
                        </el-form-item>
                    </template>
                    <template v-else-if="params.type=='zset'">
                        <el-form-item label="Member" prop="value" :error="errors.first('value')">
                            <el-input key="izset_value" v-model="dialog.value" name="value" v-validate="'required'" data-vv-as="Member" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="Score" prop="score" :error="errors.first('score')">
                            <el-input key="izset_score" v-model.number="dialog.score" name="score" v-validate="'required|numeric'" data-vv-as="Score" clearable></el-input>
                        </el-form-item>
                    </template>
                    <template v-else-if="params.type=='hash'">
                        <el-form-item label="Key" prop="key" :error="errors.first('key')">
                            <el-input key="ihash_key" v-model="dialog.key" name="key" v-validate="'required'" data-vv-as="Key" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="Value" prop="value" :error="errors.first('value')">
                            <el-input key="ihash_value" v-model="dialog.value" name="value" v-validate="'required'" data-vv-as="Value" clearable></el-input>
                        </el-form-item>
                    </template>
                    <template v-else-if="params.type=='list'">
                        <el-form-item label="Value" prop="value" :error="errors.first('value')">
                            <el-input key="ilist_value" v-model="dialog.value" name="value" v-validate="'required'" data-vv-as="Value" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="Insert To" prop="insert" :error="errors.first('insert')">
                            <el-select key="ilist_insert" v-model="dialog.insert">
                                <el-option value="head" label="head"></el-option>
                                <el-option value="tail" label="tail"></el-option>
                            </el-select>
                        </el-form-item>
                    </template>
                </template>
            </el-form>
            <div class="dialog-footer" slot="footer">
                <div>
                    <el-button  @click="dialog.visible=false">Cancel</el-button>
                    <el-button type="primary" :disabled="btndisabled" @click="handleSaveMember">Insert</el-button>
                </div>
            </div>
        </el-dialog>
        <ul class="contextmenu" v-show="contextmenuVisible" :style="{left:pageXY.left+'px',top:pageXY.top+'px'}">
            <!-- <li>Copy to Clipboard</li> -->
            <li class="contextmenu_item" @click="reload">Reload</li>
            <li class="contextmenu_item" @click="deleteKey">Delete</li>
        </ul>
    </div>
</template>
<script>
// import VueJsonPretty from 'vue-json-pretty'
import { isJSON } from '@/utils/tools'
import jsonEditor from '@/components/jsonEditor'
export default {
    name:'AppMain',
    components:{
        // VueJsonPretty,
        jsonEditor
    },
    props:{
        params:{
            type:Object,
            required:true,
            default:()=>{
                return {}
            }
        },
        showDatabaseMenu:{
            type:Boolean,
            required:false,
            default:true
        },
        terminal:{
            type:Object,
            required:false,
            default:()=>{
                return {}
            }
        },
        cmd:{
            type:Array,
            required:false,
            default:()=>{
                return []
            }
        }
    },
    watch:{
        params:{
            deep:true,
            handler(newvalue){
                this.valueLoading = false;
                if(newvalue.activeKey){
                    this.activekey = newvalue.activeKey;
                }
                if(newvalue.type=='set'||newvalue.type=='list'){
                    this.member = newvalue.keys.length>0?newvalue.value[0]:'';
                    this.activemember = this.member?'0_'+this.member:'';
                }
                else if(newvalue.type=='hash'){
                    this.member = (newvalue.keys.length>0&&newvalue.value[0])?newvalue.value[0]['value']:'';
                    this.activemember = (newvalue.keys.length>0&&newvalue.value[0])?('0_'+newvalue.value[0]['key']):'';
                }
                else if(newvalue.type=='zset'){
                    this.member = (newvalue.keys.length>0&&newvalue.value[0])?newvalue.value[0]['member']:'';
                    this.activemember = this.member?'0_'+this.member:'';
                }
            }
        },
        terminal:{
            deep:true,
            handler(newvalue){
                console.log('==tet',newvalue)
            }
        }
    },
    data(){
        return {
            activeTab:'value',
            pattern:'',
            txttype:'raw',
            isJSON:isJSON,
            member:'',
            activekey:'',
            activemember:'',
            activemembername:'',
            valueLoading:false,
            dialog:{
                visible:false,
                key:'',
                value:'',
                score:'',
                insert:'head',
                isKey:false,
                type:'',
                key_name:'',
                member:'',
                item:''
            },
            btndisabled:false,
            showTerminalCursor:false,
            terminal_content:'',
            contextmenuVisible:false,
            pageXY:{
                left:'',
                top:''
            },
            activeContextMenu:{
                key:'',
                type:''
            },
            editKey:'',
            editKeyValue:'',
            editSubKey:'',
            editSubKeyValue:'',
            originSubKeyValue:''
        }
    },
    mounted(){
        document.addEventListener('click',(e)=>{
            this.handleBodyClick(e)
        });
    },
    methods:{
        handleKey(key){
            this.activekey = key.key;
            this.valueLoading = true;
            this.$emit('handleKey',key)
        },
        changeMember(value,idx){
            this.member = value;
            this.activemember = idx+'_'+value;
            this.activemembername=value;
        },
        changeZSet(value,idx){
            this.member = value.member;
            this.activemember = idx+'_'+value.member;
            this.activemembername = value.member;
        },
        folderHandle(){
            this.$emit('handleShowDatabase');
        },
        changePattern(){
            this.$emit('changeMatchKeys','','',this.pattern);
        },
        changeHash(item,idx){
            this.member = item.value;
            this.activemember = idx+'_'+item.key;
            this.activemembername = item.key;
        },
        handleRefreshKey(){
            this.$emit('handleRefreshKey',this.pattern);
        },
        handleAddMember(){
            this.dialog = {
                visible:true,
                key:'',
                value:'',
                score:'',
                insert:'head',
                isKey:false,
                type:'',
                key_name:'',
                member:'',
                item:''
            }
            this.$validator.pause()
            this.$nextTick(() => {
                this.$validator.errors.clear();
                this.$validator.fields.items.forEach(field => field.reset())
                this.$validator.fields.items.forEach(field => this.errors.remove(field))
                this.$validator.resume()
            })
        },
        handleSaveMember(){//添加zset,hash,list,set类型
            this.btndisabled = true;
            this.$validator.validateAll().then(valid=>{
                if(valid){
                    // let keyarr = this.activekey.split('_');
                    // let key = keyarr.length>1?keyarr[1]:'';
                    let key = this.activekey;
                    let tmp = this.params.value,flag = false;
                    if(this.dialog.isKey){
                        tmp =this.params.keys;
                        for(let i =0;i<tmp.length;i++){
                            if(this.dialog.key==tmp[i]['key']){
                                flag = true;
                                break;
                            }
                        }
                        if(flag){
                            this.$message({
                                type:'error',
                                message:'The key already exists',
                                duration:2000
                            });
                            this.btndisabled = false;
                            return;
                        }
                        this.$emit('handleAddKey',this.dialog);
                    }
                    else{
                        if(this.params.type=='zset'){
                            for(let i =0;i<tmp.length;i++){
                                if(this.dialog.value==tmp[i]['member']){
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        else if(this.params.type=='hash'){
                            for(let i =0;i<tmp.length;i++){
                                if(this.dialog.key==tmp[i]['key']){
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        else if(this.params.type=='set'){
                            for(let i =0;i<tmp.length;i++){
                                if(this.dialog.value==tmp[i]){
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        if(flag){
                            this.$message({
                                type:'error',
                                message:'The field already exists',
                                duration:2000
                            });
                            this.btndisabled = false;
                            return;
                        }
                        this.$emit('handleAddMember',this.dialog,key,this.params.type);
                    }
                    this.btndisabled = false;
                    this.dialog.visible=false;
                }
                else{
                    this.btndisabled = false;
                }
            })
        },
        handleAddKey(){
            this.dialog = {
                visible:true,
                key:'',
                value:'',
                score:'',
                insert:'',
                isKey:true,
                type:'string',
                key_name:'',
                member:'',
                item:''
            }
            this.$validator.pause()
            this.$nextTick(() => {
                this.$validator.errors.clear();
                this.$validator.fields.items.forEach(field => field.reset())
                this.$validator.fields.items.forEach(field => this.errors.remove(field))
                this.$validator.resume()
            })
        },
        handleDeleteKey(){
            this.$emit('handleDeleteKey',this.activekey);
        },
        handleTab(tab){
            if(tab.name=='terminal'){
                this.$nextTick(()=>{
                    this.handleTerminalFocus();
                })
            }
        },
        handleTerminalFocus(){
            let obj = document.getElementById('terminal_input');
            if(window.getSelection){
                obj.focus();
                var range = window.getSelection();//创建range
                range.selectAllChildren(obj);//range 选择obj下所有子内容
                range.collapseToEnd();
            }
            else if(document.selection) {//ie10 9 8 7 6 5
                var range1 = document.selection.createRange();//创建选择对象
                //var range = document.body.createTextRange();
                range1.moveToElementText(obj);
                range1.collapse(false);
                range1.select();
            }
        },
        handleTerminal(){
            let obj = document.getElementById('terminal_input');
            if(obj.innerHTML!=''&&this.showTerminalCursor==false){
                this.showTerminalCursor = true;
            }
        },
        handleExec(e){
            if(e.key=='Enter'){
                e.preventDefault();
                document.getElementById('terminal_input').innerHTML = document.getElementById('terminal_input').innerHTML.replace(/\n/gi,'');
                let cmd = document.getElementById('terminal_input').innerText;
                this.$emit('handleExecCmd',cmd);
                document.getElementById('terminal_input').innerHTML='';
                // this.showTerminalCursor = false;
            }
        },
        openContextMenu(event,key,type,idx){
            let left = event.pageX,top=event.pageY;
            this.pageXY = {
                left:left,
                top:top
            }
            this.contextmenuVisible = true;
            // this.valueLoading = true;
            this.activeContextMenu = {
                key:key,
                type:type,
                activekey:this.activekey,
                idx:idx
            }
        },
        reload(){
            if(this.activeContextMenu.type=='key'){
                this.activekey = this.activeContextMenu.key.key;
                this.$emit('handleKey',this.activeContextMenu.key)
            }
            else{
                this.$emit('handleKey',{key:this.activekey})
            }
            this.contextmenuVisible = false;
        },
        deleteKey(){
            if(this.activeContextMenu.type=='key'){
                this.$emit('handleDeleteKey',this.activeContextMenu.key.key,this.activekey)
            }
            else{
                this.$emit('handleDeleteSubKey',this.activeContextMenu.activekey,this.activeContextMenu.key,this.activeContextMenu.type)
            }
            this.contextmenuVisible = false;
        },
        handleEditKey(key){
            this.editKey = key.key;
            this.editKeyValue = key.key;
            this.$nextTick(()=>{
                let elm = this.$refs['redis-key-item-input'][0];
                if(elm){
                    elm.focus();
                }
            })
        },
        handleSaveKey(value,index){
            if(index===''){
                this.editKey='';
                return;
            }
            if(this.editKeyValue.length!=0){
                this.$emit('handleRename',this.editKey,this.editKeyValue,index);
                this.editKey = '';
            }
            else{
                this.editKey = '';
            }
        },
        handleBodyClick(e){
            let target = e.target;
            if(target.className.indexOf('contextmenu_item')<0&&target.className.indexOf('contextmenu')<0&&this.contextmenuVisible){
                this.contextmenuVisible = false;
                return;
            }
            if((target.className.indexOf('redis-key-item-input')<0&&target.className.indexOf('el-input__inner')<0)&&this.editKey!=''){
                let elm = this.$refs['redis-key-item-input'];
                let idx = elm['$attrs']?elm['$attrs']['data-index']:'';
                this.handleSaveKey(this.editKeyValue,idx);
                return;
            }
            if((target.className.indexOf('redis-key-item-subkey-input')<0&&target.className.indexOf('el-input__inner')<0)&&this.editSubKey!=''){
                let elm = this.$refs['redis-key-item-subkey-input'];
                let idx = elm['$attrs']?elm['$attrs']['data-index']:'';
                this.handleSaveSubKey(this.editSubKeyValue,idx);
                return;
            }
        },
        handleEditSubKey(item){
            this.editSubKey = item.member;
            this.editSubKeyValue = item.score;
            this.originSubKeyValue = item.score;
            this.$nextTick(()=>{
                let elm = this.$refs['redis-key-item-subkey-input'][0];
                if(elm){
                    elm.focus();
                }
            })
        },
        handleSaveSubKey(value,index){
            if(index===''){
                this.editSubKey = '';
                return;
            }
            if(this.editSubKeyValue!=''){
                let tmp = this.editSubKeyValue - this.originSubKeyValue;
                this.$emit('handleReScore',this.activekey,this.editSubKey,tmp);
                this.editSubKey = '';
            }
            else{
                this.editSubKey = '';
            }
        },
        saveChange(type){
            let param= {}
            var value = '';
            if(type.type=='string'){
                try{
                    value = this.$refs.editorvalue.getValue();
                }catch{
                    this.$message.error('内容格式不符');
                    return;
                }
                param = {
                    type:type.type,
                    value:value,
                    key:this.activekey
                }
            }else if(type.type=='hash'){
                try{
                    value = this.$refs.hasheditorvalue.getValue();
                }catch{
                    this.$message.error('内容格式不符');
                    return;
                }
                param = {
                    type:type.type,
                    value:value,
                    key_name:this.activekey,
                    key:this.activemembername
                }
            }
            this.$emit('handleSaveValue',param)
        }
    }
}
</script>
<style scoped>
    .main-wrap{
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: row;
        width:100%;
    }
    .redis-main-content{
        flex:1;
    }
    .redis-database-keys{
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        width:30vw;
        max-width:260px;
        border-right:1px solid #ccc;
    }
    .redis-database-top {
        display: flex;
        padding: 5px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .redis-keys-operator{
        display: flex;
        align-items: center;
    }
    .el-op{
        margin:0 5px;
        color:#555;
    }
    .redis-database-top-title{
        background: rgba(255,255,255,0.4);
        border-bottom:1px solid #dad8d8;
        box-shadow: 0 0 6px #dad8d8;
    }

    .redis-keys-wrap {
        width: calc(100%);
        /* overflow: hidden; */
        padding: 5px 0px;
        flex:1;
        overflow-y: auto;
    }
    .redis-keys-item {
        word-break: break-word;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 100%;
        overflow: hidden;
        line-height: 30px;
        text-align: left;
        cursor: pointer;
        padding:0 10px;
    }
    .redis-key-content-wrap{
        display: flex;
        flex-direction: column;
        height: 100%;;
    }
    .redis-key-content {
        width: calc(100% - 20px);
        word-break: break-word;
        padding: 0 10px;
        text-align: left;
        flex:1;
        overflow-y: auto;
        background:#f9f9f9;
    }
    .redis-key-content-bottom {
        text-align: right;
        padding: 0 10px 10px;
    }
    .redis-key-content-list {
        width: 20vw;
        overflow-y: auto;
        border-right:1px solid #ccc;
    }

    .redis-key-content-list-item {
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-word;
        overflow: hidden;
        line-height: 30px;
        cursor: pointer;
        padding:0 3px;
        text-align: left;
    }
    .redis-key-content-top{
        display: flex;
        padding: 5px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .redis-key-content-title{
        background: rgba(255,255,255,0.4);
        border-bottom:1px solid #dad8d8;
        box-shadow: 0 0 6px #dad8d8;
    }
    .redis-key-content-list-right {
        flex: 1;
        word-break: break-word;
        text-align: left;
        padding: 0 5px;
        background:#f9f9f9;
    }
    .redis-key-content-list-right-wrap{
        display:flex;
        flex-direction: column;
        height:100%;
        flex:1;
    }
    .flex-row{
        display: flex;
        flex-direction: row;
    }
    .redis-key-item-active.redis-keys-item,
    .redis-key-content-list-item.redis-key-content-list-item-active,
    .redis-key-content-zset-item-active.redis-key-content-zset-item{
        background: #eff0f2;
        color: #409EFF;
    }
    .redis-key-zset-score {
        width:40%;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-word;
        overflow: hidden;
    }
    .redis-key-zset-member {
        width:60%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        word-break: break-word;
        overflow: hidden;
    }
    .redis-key-content-zset-item{
        line-height: 30px;
        cursor: pointer;
        padding:0 3px;
        text-align: left;
        display: flex;
    }

    .terminal-wrap{
        background:#fdf7e2;
        color:#8599a7;
        display: flex;
        flex-direction: column;
        height: 100%;
        align-items:flex-start;
        padding:8px 10px;
        overflow-y: auto;
    }
    .terminal-content{
        display:flex;
        flex-direction: row;
        align-items: center;
        width:100%;
        flex-wrap:wrap;
        text-align: left;
        line-height:20px;
    }
    .terminal-content-left{
        margin-right:5px;
    }
    @keyframes blink {
        0%,100%{
            border-right: 8px solid #657a83;
        }
        50% {
            border-right: 8px solid transparent;
        }
    }
    @-webkit-keyframes blink {
        0%,100%{
            border-right: 8px solid #657a83;
        }
        50% {
            border-right: 8px solid transparent;
        }
    }
    @-ms-keyframes blink {
        0%,100%{
            border-right: 8px solid #657a83;
        }
        50% {
            border-right:  solid transparent;
        }
    }
    @-moz-keyframes blink {
       0%,100%{
            border-right: 8px solid #657a83;
        }
        50% {
            border-right: 8px solid transparent;
        }
    }
    .terminal-content-right{
        /* flex:1; */
        text-align:left;
        outline:none;
        
        caret-color: transparent;
        line-height: 20px;
        /* height:24px; */
        cursor: default;
        /* min-width: 10px;; */
        position: relative;
    }
     .terminal-cursor{
         padding-left:0px;
         -webkit-animation: 1.5s blink step-end infinite;
        animation: 1.5s blink step-end infinite ;
        height:20px;
     }
     .terminal-content-input{

     }
     .terminal-content-result{
         font-size:16px;
         color:#b8be6e;
         line-height: 24px;
     }
     .terminal-content-error{
         color:#d13b34;
     }

    #terminal_input:after{
        position: absolute;
        content:"";
        -webkit-animation: 1.5s blink step-end infinite;
        animation: 1.5s blink step-end infinite ;
        height:20px;
        padding-left:3px;
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

    .saveBtn{
        outline: none;
        border:0px;
        border-top:1px solid #DCDFE6;
    }

</style>
<style>
    .main-wrap .el-tabs{
        height:100%;
        display: flex;
        flex-direction: column;
    }
    .main-wrap .el-tabs .el-tabs__content{
        flex:1;
    }
    .main-wrap .el-tabs .el-tab-pane{
        height:100%;
    }
    .redis-main-content .el-tabs__header{
        margin:0px;
    }
    .main_dialog .el-select{
        width:100%;
    }
</style>