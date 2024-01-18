<template>
    <div class="json_editor_wrap">
        <div :id="id" style="width: 100%; height: 100%;"></div>
        <!-- <codemirror :value="jsonString" :options="cmdOptiomns"></codemirror> -->
    </div>
</template>
<script>
import JsonEditor from 'jsoneditor'
import Ajv from 'ajv';
// import {JsonEditor} from '@/assets/jsoneditor'
// import { codemirror } from 'vue-codemirror'
// import 'codemirror/lib/codemirror.css'
export default {
    name:'json_editor',
    components:{
        JsonEditor,
        Ajv,
        // codemirror
    },
    props:{
        option:{
            type:Object,
            required:false,
            default:()=>{
                return {
                    mode: 'code',
                    modes: ['code', 'text','tree','view','form'],
                    ajv: Ajv({ allErrors: false, format: 'full', unknownFormats: 'ignore', verbose: true, logger: false }),
                    indentation:2,
                    search:true,
                    mainMenuBar:false,
                    navigationBar:false,
                    statusBar:false,
                    enableSort:false,
                    enableTransform:false,
                    onError(error){
                        console.log('==test sdfeddir',error)
                    },
                    onValidate(json){
                        console.log('===valid',json)
                        return [];
                    },
                    onValidationError(errors){
                        console.log('=test',errors)
                        // errors.forEach(error=>{
                        //     switch (error.type){
                        //         case 'validation':
                        //             break;
                        //         case 'error':

                        //     }
                        // })
                    }
                    // limitDragging:false
                }
            }
        },
        jsonString:{
            type:String,
            required:false,
            default:''
        },
        data:{
            type:Object,
            required:false,
            default:()=>{
                return {}
            }
        },
        cmdOptiomns:{
            type:Object,
            required:false,
            default:()=>{
                return {
                    tabSize: 0,
                    // mode: 'text/javascript',
                    // theme: 'base16-dark',
                    lineNumbers: true,
                    line: true,
                }
            }
        }
    },
    watch:{
        jsonString(newvalue,oldvalue){
            if(newvalue!=oldvalue){
                this.init();
            }
        }
    },
    data(){
        return {
            id:'',
            editor:''
        }
    },
    mounted(){
        if(!this.id){
            this.id = 'jsoneditor_'+Math.floor( Math.random() * 10000 );
        }
        this.init();
    },
    methods:{
        init(){
            this.$nextTick(()=>{
                let container = document.getElementById(this.id);
                if(this.editor){
                    this.editor.destroy();
                }
                this.editor = new JsonEditor(container,this.option);
                if(this.jsonString){
                    let tmp = this.jsonString;
                    try{
                        tmp = JSON.parse(tmp);
                        // this.editor.setMode('code');
                        this.editor.set(tmp);
                    }
                    catch{
                        console.log('parse catch')
                        // this.editor.setMode('text');
                        this.editor.set(tmp);
                    }
                    // console.log('==test',tmp,typeof tmp)
                }
            })
        },
        getValue(){
            //this.editor.get(),this.editor.getText()
            return this.editor.getText();
        }
    }

}
</script>
<style src="@/assets/css/jsoneditor.min.css"></style>
<style>
.jsoneditor{
    border:0px;
}
/* .json_editor_wrap .ace_error{
    background-image:none !important;
} */
</style>
<style lang="css" scoped>
.json_editor_wrap{
    height:100%;
    width:100%;
}
</style>