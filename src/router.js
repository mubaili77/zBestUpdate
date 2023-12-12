import Login from "./login.vue";
import Home from "./Home.vue";
import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const router = new Router({
    routes:[
        {
            path:'/',
            redirect:'/home',
        },
        {
            path:'/home',
            name:'Home',
            component:Home,
        },
        {
            path:'/login',
            name:'Login',
            component:Login
        }
    ]
}

);
export {router} ; 
//注意这里采用的router版本应该是3开头的，否则会出现很多错误，不要随意装最新版本